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


export type Inputs = {
  metaAdsBudget: number;
  metaCpc: number;
  metaConversionRate: number; // as a percentage
  googleAdsBudget: number;
  googleCpc: number;
  googleConversionRate: number; // as a percentage
  organicSessions: number;
  crFirstPurchase: number; // as a percentage
  aovFirstPurchase: number;
  gmFirstPurchase: number; // as a percentage
  crRepeatPurchase: number; // as a percentage
  aovRepeatPurchase: number;
  gmRepeatPurchase: number; // as a percentage
  marketingOpexFixed: number;
};

export type Currency = "USD" | "EUR" | "PLN";

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

const inputFields: {
  name: keyof Inputs;
  label: string;
  description: string;
  isCurrency: boolean;
  isPercentage: boolean;
  group: "meta" | "google" | "general"
}[] = [
  { name: "metaAdsBudget", label: "Meta Ads Budget", description: "Total spend on Meta advertising.", isCurrency: true, isPercentage: false, group: 'meta' },
  { name: "metaCpc", label: "Meta CPC", description: "Cost per click for Meta ads.", isCurrency: true, isPercentage: false, group: 'meta' },
  { name: "metaConversionRate", label: "Meta Conv. Rate", description: "Conversion rate from Meta clicks.", isCurrency: false, isPercentage: true, group: 'meta' },
  { name: "googleAdsBudget", label: "Google Ads Budget", description: "Total spend on Google advertising.", isCurrency: true, isPercentage: false, group: 'google' },
  { name: "googleCpc", label: "Google CPC", description: "Cost per click for Google ads.", isCurrency: true, isPercentage: false, group: 'google' },
  { name: "googleConversionRate", label: "Google Conv. Rate", description: "Conversion rate from Google clicks.", isCurrency: false, isPercentage: true, group: 'google' },
  { name: "organicSessions", label: "Organic Sessions", description: "Website sessions from organic search.", isCurrency: false, isPercentage: false, group: 'general' },
  { name: "crFirstPurchase", label: "Baseline CR First Purchase", description: "Conversion rate for first-time buyers (non-ad traffic).", isCurrency: false, isPercentage: true, group: 'general' },
  { name: "aovFirstPurchase", label: "AOV First Purchase", description: "Average order value for first-time buyers.", isCurrency: true, isPercentage: false, group: 'general' },
  { name: "gmFirstPurchase", label: "GM First Purchase", description: "Gross margin on first-time purchases.", isCurrency: false, isPercentage: true, group: 'general' },
  { name: "crRepeatPurchase", label: "CR Repeat Purchase", description: "Conversion rate for repeat customers.", isCurrency: false, isPercentage: true, group: 'general' },
  { name: "aovRepeatPurchase", label: "AOV Repeat Purchase", description: "Average order value for repeat customers.", isCurrency: true, isPercentage: false, group: 'general' },
  { name: "gmRepeatPurchase", label: "GM Repeat Purchase", description: "Gross margin on repeat purchases.", isCurrency: false, isPercentage: true, group: 'general' },
  { name: "marketingOpexFixed", label: "Marketing OPEX (Fixed)", description: "Fixed marketing operational expenses.", isCurrency: true, isPercentage: false, group: 'general' },
];


export function ProfitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    metaAdsBudget: 5000,
    metaCpc: 0.8,
    metaConversionRate: 2,
    googleAdsBudget: 5000,
    googleCpc: 1.2,
    googleConversionRate: 3,
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
    // Apply scenario modifiers
    const modifiedInputs = { ...inputs };
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
        metaAdsBudget, metaCpc, metaConversionRate, googleAdsBudget, googleCpc, googleConversionRate,
        organicSessions, crFirstPurchase, aovFirstPurchase, gmFirstPurchase, crRepeatPurchase, 
        aovRepeatPurchase, gmRepeatPurchase, marketingOpexFixed
    } = modifiedInputs;

    const metaPaidSessions = metaCpc > 0 ? metaAdsBudget / metaCpc : 0;
    const googlePaidSessions = googleCpc > 0 ? googleAdsBudget / googleCpc : 0;
    const totalPaidSessions = metaPaidSessions + googlePaidSessions;
    const totalAdsBudget = metaAdsBudget + googleAdsBudget;

    const paidSessions = totalPaidSessions;
    const totalSessions = paidSessions + organicSessions;
    const cpSessionBlended = totalSessions > 0 ? totalAdsBudget / totalSessions : 0;

    // Simplified: Applying a blended CR for ad traffic and a different one for organic
    const paidPurchases = (metaPaidSessions * (metaConversionRate / 100)) + (googlePaidSessions * (googleConversionRate / 100));
    const organicPurchases = organicSessions * (crFirstPurchase / 100);
    const totalFirstPurchases = paidPurchases + organicPurchases;

    const revenueFirstPurchase = totalFirstPurchases * aovFirstPurchase;
    const grossProfitFirstPurchase = revenueFirstPurchase * (gmFirstPurchase / 100);

    const totalRepeatPurchases = totalFirstPurchases * (crRepeatPurchase / 100);
    const revenueRepeatPurchase = totalRepeatPurchases * aovRepeatPurchase;
    const grossProfitRepeatPurchase = revenueRepeatPurchase * (gmRepeatPurchase / 100);

    const totalGrossProfit = grossProfitFirstPurchase + grossProfitRepeatPurchase;
    const contributionMargin = totalGrossProfit - totalAdsBudget;
    const totalMarketingCost = totalAdsBudget + marketingOpexFixed;
    const netProfit = totalGrossProfit - totalMarketingCost;
    const roi = totalMarketingCost > 0 ? (netProfit / totalMarketingCost) * 100 : 0;


    return { totalSessions, cpSessionBlended, totalGrossProfit, netProfit, totalMarketingCost, contributionMargin, roi };
  }, [inputs, activeScenarios, globalEstimateLevel]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);
  
  const formatPercentage = (value: number) =>
    `${value.toFixed(2)}%`;


  const resultMetrics = [
    { key: "netProfit", label: "Net Profit", format: formatCurrency },
    { key: "roi", label: "Return on Investment (ROI)", format: formatPercentage },
    { key: "contributionMargin", label: "Contribution Margin", format: formatCurrency },
    { key: "totalGrossProfit", label: "Total Gross Profit", format: formatCurrency },
    { key: "totalMarketingCost", label: "Total Marketing Cost", format: formatCurrency },
    { key: "cpSessionBlended", label: "Blended Cost Per Session", format: formatCurrency },
    { key: "totalSessions", label: "Total Sessions", format: formatNumber },
  ];

  return (
    <>
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
              <h3 className="font-headline text-lg mb-4">Meta Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-6">
                {inputFields.filter(f => f.group === 'meta').map(({ name, label, description, isCurrency, isPercentage }) => (
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
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <h3 className="font-headline text-lg mb-4">Google Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-6">
                {inputFields.filter(f => f.group === 'google').map(({ name, label, description, isCurrency, isPercentage }) => (
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
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <h3 className="font-headline text-lg mb-4">General Business Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 {inputFields.filter(f => f.group === 'general').map(({ name, label, description, isCurrency, isPercentage }) => (
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
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
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
            {resultMetrics.map(({ key, label, format }, index) => (
              <React.Fragment key={key}>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">{label}</p>
                  <p className={cn(
                    "font-headline text-xl font-bold transition-colors duration-300",
                    key === 'netProfit' && (results.netProfit < 0 ? 'text-destructive' : 'text-green-500'),
                    key === 'roi' && (results.roi < 0 ? 'text-destructive' : 'text-green-500'),
                  )}>
                    {format(results[key as keyof typeof results])}
                  </p>
                </div>
                {index < resultMetrics.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
