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

const inputFields: {
  name: keyof Inputs;
  label: string;
  description: string;
  adornment: "$" | "%" | null;
  group: "meta" | "google" | "general"
}[] = [
  { name: "metaAdsBudget", label: "Meta Ads Budget", description: "Total spend on Meta advertising.", adornment: "$", group: 'meta' },
  { name: "metaCpc", label: "Meta CPC", description: "Cost per click for Meta ads.", adornment: "$", group: 'meta' },
  { name: "metaConversionRate", label: "Meta Conv. Rate", description: "Conversion rate from Meta clicks.", adornment: "%", group: 'meta' },
  { name: "googleAdsBudget", label: "Google Ads Budget", description: "Total spend on Google advertising.", adornment: "$", group: 'google' },
  { name: "googleCpc", label: "Google CPC", description: "Cost per click for Google ads.", adornment: "$", group: 'google' },
  { name: "googleConversionRate", label: "Google Conv. Rate", description: "Conversion rate from Google clicks.", adornment: "%", group: 'google' },
  { name: "organicSessions", label: "Organic Sessions", description: "Website sessions from organic search.", adornment: null, group: 'general' },
  { name: "crFirstPurchase", label: "Baseline CR First Purchase", description: "Conversion rate for first-time buyers (non-ad traffic).", adornment: "%", group: 'general' },
  { name: "aovFirstPurchase", label: "AOV First Purchase", description: "Average order value for first-time buyers.", adornment: "$", group: 'general' },
  { name: "gmFirstPurchase", label: "GM First Purchase", description: "Gross margin on first-time purchases.", adornment: "%", group: 'general' },
  { name: "crRepeatPurchase", label: "CR Repeat Purchase", description: "Conversion rate for repeat customers.", adornment: "%", group: 'general' },
  { name: "aovRepeatPurchase", label: "AOV Repeat Purchase", description: "Average order value for repeat customers.", adornment: "$", group: 'general' },
  { name: "gmRepeatPurchase", label: "GM Repeat Purchase", description: "Gross margin on repeat purchases.", adornment: "%", group: 'general' },
  { name: "marketingOpexFixed", label: "Marketing OPEX (Fixed)", description: "Fixed marketing operational expenses.", adornment: "$", group: 'general' },
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
      for (const key in scenario.impact) {
        const modifier = scenario.impact[key as keyof Inputs] as number;
        (modifiedInputs[key as keyof Inputs] as number) *= (1 + modifier / 100);
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
    const totalMarketingCost = totalAdsBudget + marketingOpexFixed;
    const netProfit = totalGrossProfit - totalMarketingCost;

    return { totalSessions, cpSessionBlended, totalGrossProfit, netProfit, totalMarketingCost };
  }, [inputs, activeScenarios]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const resultMetrics = [
    { key: "totalGrossProfit", label: "Total Gross Profit", format: formatCurrency },
    { key: "netProfit", label: "Net Profit", format: formatCurrency },
    { key: "cpSessionBlended", label: "Blended Cost Per Session", format: formatCurrency },
    { key: "totalSessions", label: "Total Sessions", format: formatNumber },
    { key: "totalMarketingCost", label: "Total Marketing Cost", format: formatCurrency },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Business Inputs</CardTitle>
              <CardDescription>Adjust these values to model your profit.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-headline text-lg mb-4">Meta Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-6">
                {inputFields.filter(f => f.group === 'meta').map(({ name, label, description, adornment }) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name} className="font-headline">{label}</Label>
                    <div className="relative">
                      {adornment && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {adornment}
                        </span>
                      )}
                      <Input
                        id={name}
                        name={name}
                        type="number"
                        value={inputs[name]}
                        onChange={handleInputChange}
                        className={cn("transition-shadow", adornment ? "pl-7" : "")}
                        aria-describedby={`${name}-description`}
                      />
                    </div>
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <h3 className="font-headline text-lg mb-4">Google Ads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-6">
                {inputFields.filter(f => f.group === 'google').map(({ name, label, description, adornment }) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name} className="font-headline">{label}</Label>
                    <div className="relative">
                      {adornment && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {adornment}
                        </span>
                      )}
                      <Input
                        id={name}
                        name={name}
                        type="number"
                        value={inputs[name]}
                        onChange={handleInputChange}
                        className={cn("transition-shadow", adornment ? "pl-7" : "")}
                        aria-describedby={`${name}-description`}
                      />
                    </div>
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <h3 className="font-headline text-lg mb-4">General Business Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 {inputFields.filter(f => f.group === 'general').map(({ name, label, description, adornment }) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name} className="font-headline">{label}</Label>
                    <div className="relative">
                      {adornment && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {adornment}
                        </span>
                      )}
                      <Input
                        id={name}
                        name={name}
                        type="number"
                        value={inputs[name]}
                        onChange={handleInputChange}
                        className={cn("transition-shadow", adornment ? "pl-7" : "")}
                        aria-describedby={`${name}-description`}
                      />
                    </div>
                    <p id={`${name}-description`} className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
           <ScenarioManager onActiveScenariosChange={setActiveScenarios} />
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
                    "font-headline text-2xl font-bold transition-colors duration-300",
                    key === 'netProfit' && (results.netProfit < 0 ? 'text-destructive' : 'text-green-500')
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
