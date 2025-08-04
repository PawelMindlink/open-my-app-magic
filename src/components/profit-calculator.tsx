
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
import { ScenarioManager, Scenario } from "@/components/scenario-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Inputs, Currency, inputFields, EstimateLevel } from "@/lib/types";


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
        metaProspectingBudget, metaProspectingCpc, metaProspectingBounceRate, metaProspectingConversionRate,
        metaRemarketingBudget, metaRemarketingCpc, metaRemarketingBounceRate, metaRemarketingConversionRate,
        googleProspectingBudget, googleProspectingCpc, googleProspectingBounceRate, googleProspectingConversionRate,
        googleRemarketingBudget, googleRemarketingCpc, googleRemarketingBounceRate, googleRemarketingConversionRate,
        organicSessions, crFirstPurchase, aovFirstPurchase, gmFirstPurchase, crRepeatPurchase, 
        aovRepeatPurchase, gmRepeatPurchase, marketingOpexFixed
    } = modifiedInputs;

    const calcChannelSessions = (budget: number, cpc: number, bounceRate: number) => {
        if (cpc <= 0) return 0;
        const clicks = budget / cpc;
        return clicks * (1 - bounceRate / 100);
    }

    const metaProspectingSessions = calcChannelSessions(metaProspectingBudget, metaProspectingCpc, metaProspectingBounceRate);
    const metaRemarketingSessions = calcChannelSessions(metaRemarketingBudget, metaRemarketingCpc, metaRemarketingBounceRate);
    const googleProspectingSessions = calcChannelSessions(googleProspectingBudget, googleProspectingCpc, googleProspectingBounceRate);
    const googleRemarketingSessions = calcChannelSessions(googleRemarketingBudget, googleRemarketingCpc, googleRemarketingBounceRate);
    
    const totalPaidSessions = metaProspectingSessions + metaRemarketingSessions + googleProspectingSessions + googleRemarketingSessions;
    const totalMetaBudget = metaProspectingBudget + metaRemarketingBudget;
    const totalGoogleBudget = googleProspectingBudget + googleRemarketingBudget;
    const totalAdsBudget = totalMetaBudget + totalGoogleBudget;

    const totalSessions = totalPaidSessions + organicSessions;
    const cpSessionBlended = totalSessions > 0 ? totalAdsBudget / totalSessions : 0;
    
    const prospectingPurchases = (metaProspectingSessions * (metaProspectingConversionRate / 100)) + (googleProspectingSessions * (googleProspectingConversionRate / 100));
    const remarketingPurchases = (metaRemarketingSessions * (metaRemarketingConversionRate / 100)) + (googleRemarketingSessions * (googleRemarketingConversionRate / 100));
    const organicFirstPurchases = organicSessions * (crFirstPurchase / 100);
    const totalFirstPurchases = prospectingPurchases + organicFirstPurchases;

    const revenueFirstPurchase = totalFirstPurchases * aovFirstPurchase;
    const grossProfitFirstPurchase = revenueFirstPurchase * (gmFirstPurchase / 100);

    const repeatCustomersFromAds = remarketingPurchases;
    const repeatCustomersFromPrevious = totalFirstPurchases * (crRepeatPurchase / 100);
    const totalRepeatPurchases = repeatCustomersFromAds + repeatCustomersFromPrevious;

    const revenueRepeatPurchase = totalRepeatPurchases * aovRepeatPurchase;
    const grossProfitRepeatPurchase = revenueRepeatPurchase * (gmRepeatPurchase / 100);

    const totalGrossProfit = grossProfitFirstPurchase + grossProfitRepeatPurchase;
    const contributionMargin = totalGrossProfit - totalAdsBudget;
    const totalMarketingCost = totalAdsBudget + marketingOpexFixed;
    const marketingProfit = totalGrossProfit - totalMarketingCost;

    const totalPurchases = totalFirstPurchases + totalRepeatPurchases;
    const totalRevenue = revenueFirstPurchase + revenueRepeatPurchase;
    const blendedAov = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
    const blendedCr = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;
    
    const prospectingAndOrganicSessions = metaProspectingSessions + googleProspectingSessions + organicSessions;
    const firstPurchaseCr = prospectingAndOrganicSessions > 0 ? (totalFirstPurchases / prospectingAndOrganicSessions) * 100 : 0;
    
    // Total sessions for repeat consideration includes remarketing sessions + previous buyers who might return
    const repeatPurchaseCrDenominator = metaRemarketingSessions + totalFirstPurchases;
    const repeatPurchaseCr = repeatPurchaseCrDenominator > 0 ? (totalRepeatPurchases / repeatPurchaseCrDenominator) * 100 : 0;


    return { 
      totalSessions, 
      paidSessions: totalPaidSessions,
      organicSessions: modifiedInputs.organicSessions,
      cpSessionBlended, 
      totalGrossProfit, 
      marketingProfit, 
      totalMarketingCost, 
      contributionMargin,
      totalMetaBudget,
      totalGoogleBudget,
      totalAdsBudget,
      marketingOpexFixed,
      scenarioCosts,
      aovFirstPurchase: modifiedInputs.aovFirstPurchase,
      aovRepeatPurchase: modifiedInputs.aovRepeatPurchase,
      crFirstPurchase: firstPurchaseCr,
      crRepeatPurchase: repeatPurchaseCr,
      blendedAov,
      blendedCr,
    };
}


export function ProfitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    metaProspectingBudget: 3000,
    metaProspectingCpc: 1.0,
    metaProspectingBounceRate: 40,
    metaProspectingConversionRate: 1.5,
    metaRemarketingBudget: 2000,
    metaRemarketingCpc: 0.6,
    metaRemarketingBounceRate: 25,
    metaRemarketingConversionRate: 4,

    googleProspectingBudget: 3000,
    googleProspectingCpc: 1.5,
    googleProspectingBounceRate: 45,
    googleProspectingConversionRate: 2,
    googleRemarketingBudget: 2000,
    googleRemarketingCpc: 0.9,
    googleRemarketingBounceRate: 30,
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
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(Math.round(value));
  
  const formatPercentage = (value: number) =>
    `${(value || 0).toFixed(2)}%`;

  const renderDelta = (delta: number, format: (val: number) => string, isGood: boolean) => {
    if (Math.abs(delta) < 0.01) return null;
    const isPositive = delta > 0;
    const colorClass = (isPositive && isGood) || (!isPositive && !isGood) ? 'text-green-500' : 'text-destructive';
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <span className={cn("flex items-center text-sm font-semibold ml-2", colorClass)}>
        <Icon className="w-4 h-4 mr-1" />
        {format(Math.abs(delta))}
      </span>
    )
  }

  const renderInputGroup = (group: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {inputFields.filter(f => f.group === group).map(({ name, label, isCurrency, isPercentage }) => (
          <div key={name} className="flex flex-col space-y-2 justify-end">
            <Label htmlFor={name} className="font-headline h-10 flex items-end">{label}</Label>
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

  const renderGeneralInputGroup = (group: string) => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        {inputFields.filter(f => f.group === group).map(({ name, label, isCurrency, isPercentage }) => (
          <div key={name} className="flex flex-col space-y-2 justify-end">
            <Label htmlFor={name} className="font-headline h-10 flex items-end">{label}</Label>
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
              <h3 className="font-headline text-xl mb-4 text-primary/80">Paid Ads</h3>
              <div className="space-y-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-headline text-lg">Meta Ads</h4>
                    <div className="w-1/3 space-y-2">
                      <Label htmlFor="meta-total" className="font-headline text-xs">Total Meta Budget</Label>
                      <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbols[currency]}</span>
                          <Input id="meta-total" value={results.scenarios.totalMetaBudget.toFixed(0)} disabled className="pl-7 font-bold bg-muted/30" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <h5 className="font-semibold text-base mb-3">Prospecting</h5>
                        {renderInputGroup('meta-prospecting')}
                    </div>
                    <Separator/>
                    <div>
                        <h5 className="font-semibold text-base mb-3">Remarketing</h5>
                        {renderInputGroup('meta-remarketing')}
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-headline text-lg">Google Ads</h4>
                     <div className="w-1/3 space-y-2">
                        <Label htmlFor="google-total" className="font-headline text-xs">Total Google Budget</Label>
                        <div className="relative">
                           <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbols[currency]}</span>
                           <Input id="google-total" value={results.scenarios.totalGoogleBudget.toFixed(0)} disabled className="pl-7 font-bold bg-muted/30" />
                        </div>
                      </div>
                  </div>
                  <div className="space-y-6">
                      <div>
                           <h5 className="font-semibold text-base mb-3">Prospecting</h5>
                          {renderInputGroup('google-prospecting')}
                      </div>
                      <Separator/>
                      <div>
                           <h5 className="font-semibold text-base mb-3">Remarketing</h5>
                          {renderInputGroup('google-remarketing')}
                      </div>
                  </div>
              </div>

              <Separator className="my-8" />
              <h3 className="font-headline text-xl mb-4 text-primary/80">Organic & Profitability</h3>
               <div className="space-y-6 p-4 border rounded-lg">
                <div>
                  <h4 className="font-headline text-lg mb-4">Organic Sessions</h4>
                  {renderGeneralInputGroup('general-organic')}
                </div>
                <Separator/>
                <div>
                  <h4 className="font-headline text-lg mb-4">First Purchase</h4>
                  {renderGeneralInputGroup('general-first-purchase')}
                </div>
                <Separator/>
                 <div>
                  <h4 className="font-headline text-lg mb-4">Repeat Purchase</h4>
                  {renderGeneralInputGroup('general-repeat-purchase')}
                </div>
                 <Separator/>
                 <div>
                  <h4 className="font-headline text-lg mb-4">Fixed Costs</h4>
                  {renderGeneralInputGroup('general-opex')}
                </div>
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
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-xl">Marketing Profit</p>
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
                        "font-headline text-2xl font-bold transition-colors duration-300",
                        results.scenarios.marketingProfit < 0 ? 'text-destructive' : 'text-green-500'
                    )}>
                        {formatCurrency(results.scenarios.marketingProfit)}
                    </p>
                    {renderDelta(results.scenarios.marketingProfit - results.base.marketingProfit, formatCurrency, true)}
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Added by Scenarios</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The additional Contribution Margin generated by the active scenarios.</p>
                      <p className="text-sm text-muted-foreground">Formula: Contribution Margin (Scenarios) - Contribution Margin (Base)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className={cn(
                    "font-headline text-xl font-bold transition-colors duration-300",
                    results.contributionMarginDelta === 0 ? "" : (results.contributionMarginDelta < 0 ? 'text-destructive' : 'text-green-500')
                )}>
                    {results.scenarios.scenarioCosts > 0 ? formatCurrency(results.contributionMarginDelta) : "—"}
                </p>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Scenarios ROI</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>(Added Contribution Margin / Total Scenario Cost) * 100.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                 <p className={cn(
                    "font-headline text-xl font-bold transition-colors duration-300",
                     results.roi === 0 ? "" : (results.roi < 0 ? 'text-destructive' : 'text-green-500')
                )}>
                    {results.scenarios.scenarioCosts > 0 ? formatPercentage(results.roi) : "—"}
                </p>
            </div>

            <Separator/>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Total Marketing Cost</p>
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

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Blended Cost Per Session</p>
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

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Total Sessions</p>
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
            <div className="pl-6 text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Paid Sessions</span><span>{formatNumber(results.scenarios.paidSessions)}</span></div>
                <div className="flex justify-between"><span>Organic Sessions</span><span>{formatNumber(results.scenarios.organicSessions)}</span></div>
            </div>

            <Separator />
            
            <div className="flex justify-between items-center">
              <p>Blended Average Order Value</p>
              <div className="flex items-center">
                <p className="font-headline text-xl font-bold">{formatCurrency(results.scenarios.blendedAov)}</p>
                {renderDelta(results.scenarios.blendedAov - results.base.blendedAov, formatCurrency, true)}
              </div>
            </div>

            <div className="pl-6 text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between items-center">
                  <span>First Purchase</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-foreground">{formatCurrency(results.scenarios.aovFirstPurchase)}</span>
                    {renderDelta(results.scenarios.aovFirstPurchase - results.base.aovFirstPurchase, formatCurrency, true)}
                  </div>
                </div>
                 <div className="flex justify-between items-center">
                  <span>Repeat Purchase</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-foreground">{formatCurrency(results.scenarios.aovRepeatPurchase)}</span>
                     {renderDelta(results.scenarios.aovRepeatPurchase - results.base.aovRepeatPurchase, formatCurrency, true)}
                  </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <p>Blended Conversion Rate</p>
                <div className="flex items-center">
                    <p className="font-headline text-xl font-bold">{formatPercentage(results.scenarios.blendedCr)}</p>
                    {renderDelta(results.scenarios.blendedCr - results.base.blendedCr, formatPercentage, true)}
                </div>
            </div>

            <div className="pl-6 text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between items-center">
                  <span>First Purchase</span>
                   <div className="flex items-center">
                    <span className="font-semibold text-foreground">{formatPercentage(results.scenarios.crFirstPurchase)}</span>
                    {renderDelta(results.scenarios.crFirstPurchase - results.base.crFirstPurchase, formatPercentage, true)}
                  </div>
                </div>
                 <div className="flex justify-between items-center">
                  <span>Repeat Purchase</span>
                   <div className="flex items-center">
                    <span className="font-semibold text-foreground">{formatPercentage(results.scenarios.crRepeatPurchase)}</span>
                    {renderDelta(results.scenarios.crRepeatPurchase - results.base.crRepeatPurchase, formatPercentage, true)}
                  </div>
                </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
