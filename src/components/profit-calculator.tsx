
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScenarioManager, Scenario, EstimateLevel } from "@/components/scenario-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Inputs, Currency, inputFields } from "@/lib/types";


const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

const calculateMetrics = (currentInputs: Inputs, activeScenarios: Scenario[] = [], globalEstimateLevel: EstimateLevel | 'individual' = 'realistic') => {
    // Apply scenario modifiers
    const modifiedInputs = { ...currentInputs };
    let scenarioCosts = 0;

    activeScenarios.forEach(scenario => {
      scenarioCosts += scenario.cost;
      const estimateLevel = globalEstimateLevel === 'individual' ? scenario.estimateLevel : globalEstimateLevel;
      for (const key in scenario.impact) {
        const impactKey = key as keyof Inputs;
        const modifier = scenario.impact[impactKey]?.[estimateLevel];
        if (typeof modifier === 'number') {
           (modifiedInputs[impactKey] as number) *= (1 + modifier / 100);
        }
      }
    });
    
    modifiedInputs.marketingOpexFixed += scenarioCosts;

    const {
        metaProspectingBudget, metaProspectingCpc, metaProspectingConversionRate,
        metaRemarketingBudget, metaRemarketingCpc, metaRemarketingConversionRate,
        googleProspectingBudget, googleProspectingCpc, googleProspectingConversionRate,
        googleRemarketingBudget, googleRemarketingCpc, googleRemarketingConversionRate,
        organicSessions, crFirstPurchase, aovFirstPurchase, gmFirstPurchase, crRepeatPurchase, 
        aovRepeatPurchase, gmRepeatPurchase, marketingOpexFixed
    } = modifiedInputs;

    const metaProspectingSessions = metaProspectingCpc > 0 ? metaProspectingBudget / metaProspectingCpc : 0;
    const metaRemarketingSessions = metaRemarketingCpc > 0 ? metaRemarketingBudget / metaRemarketingCpc : 0;
    const googleProspectingSessions = googleProspectingCpc > 0 ? googleProspectingBudget / googleProspectingCpc : 0;
    const googleRemarketingSessions = googleRemarketingCpc > 0 ? googleRemarketingBudget / googleRemarketingCpc : 0;
    
    const totalPaidSessions = metaProspectingSessions + metaRemarketingSessions + googleProspectingSessions + googleRemarketingSessions;
    const totalAdsBudget = metaProspectingBudget + metaRemarketingBudget + googleProspectingBudget + googleRemarketingBudget;

    const totalSessions = totalPaidSessions + organicSessions;
    const cpSessionBlended = totalSessions > 0 ? totalAdsBudget / totalSessions : 0;

    const prospectingPurchases = (metaProspectingSessions * (metaProspectingConversionRate / 100)) + (googleProspectingSessions * (googleProspectingConversionRate / 100));
    const remarketingPurchases = (metaRemarketingSessions * (metaRemarketingConversionRate / 100)) + (googleRemarketingSessions * (googleRemarketingConversionRate / 100));
    const organicPurchases = organicSessions * (crFirstPurchase / 100);
    
    const totalFirstPurchases = prospectingPurchases + organicPurchases;

    const revenueFirstPurchase = totalFirstPurchases * aovFirstPurchase;
    const grossProfitFirstPurchase = revenueFirstPurchase * (gmFirstPurchase / 100);

    // Assumption: remarketing purchases are repeat purchases.
    const repeatCustomersFromAds = remarketingPurchases;
    const repeatCustomersFromPrevious = totalFirstPurchases * (crRepeatPurchase / 100);
    const totalRepeatPurchases = repeatCustomersFromAds + repeatCustomersFromPrevious;

    const revenueRepeatPurchase = totalRepeatPurchases * aovRepeatPurchase;
    const grossProfitRepeatPurchase = revenueRepeatPurchase * (gmRepeatPurchase / 100);

    const totalGrossProfit = grossProfitFirstPurchase + grossProfitRepeatPurchase;
    const contributionMargin = totalGrossProfit - totalAdsBudget;
    const totalMarketingCost = totalAdsBudget + marketingOpexFixed;
    const marketingProfit = totalGrossProfit - totalMarketingCost;

    return { 
      totalSessions, 
      cpSessionBlended, 
      totalGrossProfit, 
      marketingProfit, 
      totalMarketingCost, 
      contributionMargin,
      totalAdsBudget,
      scenarioCosts
    };
}


export function ProfitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    metaProspectingBudget: 3000,
    metaProspectingCpc: 1.0,
    metaProspectingConversionRate: 1.5,
    metaRemarketingBudget: 2000,
    metaRemarketingCpc: 0.6,
    metaRemarketingConversionRate: 4,

    googleProspectingBudget: 3000,
    googleProspectingCpc: 1.5,
    googleProspectingConversionRate: 2,
    googleRemarketingBudget: 2000,
    googleRemarketingCpc: 0.9,
    googleRemarketingConversionRate: 5,

    organicSessions: 15000,
    crFirstPurchase: 1.5,
    aovFirstPurchase: 120,
    gmFirstPurchase: 60,
    crRepeatPurchase: 20,
    aovRepeatPurchase: 80,
    gmRepeatPurchase: 70,
    marketingOpexFixed: 5000,
  });

  const [activeScenarios, setActiveScenarios] = useState<Scenario[]>([]);
  const [globalEstimateLevel, setGlobalEstimateLevel] = useState<EstimateLevel | 'individual'>('realistic');
  const [currency, setCurrency] = useState<Currency>("USD");


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value),
    }));
  };

  const results = useMemo(() => {
    const baseResults = calculateMetrics(inputs);
    const scenarioResults = calculateMetrics(inputs, activeScenarios, globalEstimateLevel);

    const contributionMarginDelta = scenarioResults.contributionMargin - baseResults.contributionMargin;
    const roi = scenarioResults.scenarioCosts > 0 ? (contributionMarginDelta / scenarioResults.scenarioCosts) * 100 : 0;
    
    return {
      base: baseResults,
      scenarios: scenarioResults,
      roi,
      contributionMarginDelta
    }

  }, [inputs, activeScenarios, globalEstimateLevel]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);
  
  const formatPercentage = (value: number) =>
    `${value.toFixed(2)}%`;

  const renderDelta = (delta: number, format: (val: number) => string, isGood: boolean) => {
    if (Math.abs(delta) < 0.01) return null;
    const isPositive = delta > 0;
    const colorClass = (isPositive && isGood) || (!isPositive && !isGood) ? 'text-green-500' : 'text-destructive';
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <span className={cn("flex items-center text-sm font-semibold ml-2", colorClass)}>
        <Icon className="w-4 h-4 mr-1" />
        {format(delta)}
      </span>
    )
  }

  const renderInputGroup = (group: (typeof inputFields)[number]['group']) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        {inputFields.filter(f => f.group === group).map(({ name, label, isCurrency, isPercentage }) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name} className="font-headline">{label}</Label>
            <div className="relative">
              {isCurrency && (
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  {currencySymbols[currency]}
                </span>
              )}
              <Input
                id={name}
                name={name}
                type="number"
                value={inputs[name]}
                onChange={handleInputChange}
                className={cn("transition-shadow", isCurrency ? "pl-7" : "", isPercentage ? "pr-8" : "")}
                aria-describedby={`${name}-description`}
              />
              {isPercentage && (
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                  %
                </span>
              )}
            </div>
          </div>
        ))}
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl">Business Inputs</CardTitle>
                  <CardDescription>Adjust these values to model your profit.</CardDescription>
                </div>
                <div className="w-32">
                  <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                      <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="PLN">PLN (zł)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-headline text-xl mb-4 text-primary/80">Meta Ads</h3>
              <div className="space-y-6">
                <div>
                    <h4 className="font-headline text-lg mb-4">Prospecting</h4>
                    {renderInputGroup('meta-prospecting')}
                </div>
                 <div>
                    <h4 className="font-headline text-lg mb-4">Remarketing</h4>
                    {renderInputGroup('meta-remarketing')}
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <h3 className="font-headline text-xl mb-4 text-primary/80">Google Ads</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-headline text-lg mb-4">Prospecting</h4>
                        {renderInputGroup('google-prospecting')}
                    </div>
                    <div>
                        <h4 className="font-headline text-lg mb-4">Remarketing</h4>
                        {renderInputGroup('google-remarketing')}
                    </div>
                </div>

              <Separator className="my-8" />
              <h3 className="font-headline text-xl mb-4 text-primary/80">General Business Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 {inputFields.filter(f => f.group === 'general').map(({ name, label, isCurrency, isPercentage }) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name} className="font-headline">{label}</Label>
                    <div className="relative">
                       {isCurrency && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {currencySymbols[currency]}
                        </span>
                      )}
                      <Input
                        id={name}
                        name={name}
                        type="number"
                        value={inputs[name]}
                        onChange={handleInputChange}
                        className={cn("transition-shadow", isCurrency ? "pl-7" : "", isPercentage ? "pr-8" : "")}
                      />
                       {isPercentage && (
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                          %
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
           <ScenarioManager 
              currency={currency}
              activeScenarios={activeScenarios}
              onActiveScenariosChange={setActiveScenarios}
              globalEstimateLevel={globalEstimateLevel}
              onGlobalEstimateLevelChange={setGlobalEstimateLevel}
            />
        </div>

        <Card className="lg:col-span-2 shadow-lg sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Calculated Results</CardTitle>
            <CardDescription>Your financial forecast based on the inputs and active scenarios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Marketing Profit */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Marketing Profit</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total Gross Profit - Total Marketing Cost</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                    <p className={cn(
                        "font-headline text-xl font-bold transition-colors duration-300",
                        results.scenarios.marketingProfit < 0 ? 'text-destructive' : 'text-green-500'
                    )}>
                        {formatCurrency(results.scenarios.marketingProfit)}
                    </p>
                    {renderDelta(results.scenarios.marketingProfit - results.base.marketingProfit, formatCurrency, true)}
                </div>
            </div>
            <Separator />
            
             {/* Added by Scenarios */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Added by Scenarios</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The additional Contribution Margin generated by the active scenarios.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className={cn(
                    "font-headline text-xl font-bold transition-colors duration-300",
                    results.contributionMarginDelta < 0 ? 'text-destructive' : 'text-green-500'
                )}>
                    {formatCurrency(results.contributionMarginDelta)}
                </p>
            </div>
            <Separator />

            {/* ROI */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Scenarios ROI</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>(Added Contribution Margin / Total Scenario Cost) * 100. This shows the return specifically on your scenario investments.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                 <p className={cn(
                    "font-headline text-xl font-bold transition-colors duration-300",
                    results.roi < 0 ? 'text-destructive' : 'text-green-500'
                )}>
                    {formatPercentage(results.roi)}
                </p>
            </div>
            <Separator />

            {/* Money Invested */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Total Marketing Cost</p>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Total Ads Budget + Fixed Marketing OPEX + Scenario Costs</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                    <p className="font-headline text-xl font-bold">
                        {formatCurrency(results.scenarios.totalMarketingCost)}
                    </p>
                    {renderDelta(results.scenarios.totalMarketingCost - results.base.totalMarketingCost, formatCurrency, false)}
                </div>
            </div>
             <div className="pl-6 text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Ads Budget</span><span>{formatCurrency(results.scenarios.totalAdsBudget)}</span></div>
                <div className="flex justify-between"><span>OPEX + Scenarios</span><span>{formatCurrency(results.scenarios.marketingOpexFixed)}</span></div>
            </div>
            <Separator />

            {/* Blended Cost Per Session */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Blended Cost Per Session</p>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Total Ads Budget / Total Sessions (Paid + Organic)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                    <p className="font-headline text-xl font-bold">
                        {formatCurrency(results.scenarios.cpSessionBlended)}
                    </p>
                     {renderDelta(results.scenarios.cpSessionBlended - results.base.cpSessionBlended, formatCurrency, false)}
                </div>
            </div>
            <Separator />

             {/* Total Sessions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Total Sessions</p>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total Paid Sessions (from all ad channels) + Organic Sessions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                 <div className="flex items-center">
                    <p className="font-headline text-xl font-bold">
                        {formatNumber(results.scenarios.totalSessions)}
                    </p>
                     {renderDelta(results.scenarios.totalSessions - results.base.totalSessions, formatNumber, true)}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
