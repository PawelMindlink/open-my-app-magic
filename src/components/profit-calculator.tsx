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

type Inputs = {
  adsBudget: number;
  paidSessions: number;
  organicSessions: number;
  crFirstPurchase: number;
  aovFirstPurchase: number;
  gmFirstPurchase: number;
  crRepeatPurchase: number;
  aovRepeatPurchase: number;
  gmRepeatPurchase: number;
  marketingOpexFixed: number;
};

const inputFields: {
  name: keyof Inputs;
  label: string;
  description: string;
  adornment: "$" | "%" | null;
}[] = [
  { name: "adsBudget", label: "Ads Budget", description: "Total spend on advertising.", adornment: "$" },
  { name: "paidSessions", label: "Paid Sessions", description: "Website sessions from paid ads.", adornment: null },
  { name: "organicSessions", label: "Organic Sessions", description: "Website sessions from organic search.", adornment: null },
  { name: "crFirstPurchase", label: "CR First Purchase", description: "Conversion rate for first-time buyers.", adornment: "%" },
  { name: "aovFirstPurchase", label: "AOV First Purchase", description: "Average order value for first-time buyers.", adornment: "$" },
  { name: "gmFirstPurchase", label: "GM First Purchase", description: "Gross margin on first-time purchases.", adornment: "%" },
  { name: "crRepeatPurchase", label: "CR Repeat Purchase", description: "Conversion rate for repeat customers.", adornment: "%" },
  { name: "aovRepeatPurchase", label: "AOV Repeat Purchase", description: "Average order value for repeat customers.", adornment: "$" },
  { name: "gmRepeatPurchase", label: "GM Repeat Purchase", description: "Gross margin on repeat purchases.", adornment: "%" },
  { name: "marketingOpexFixed", label: "Marketing OPEX (Fixed)", description: "Fixed marketing operational expenses.", adornment: "$" },
];

export function ProfitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    adsBudget: 10000,
    paidSessions: 20000,
    organicSessions: 15000,
    crFirstPurchase: 2.5,
    aovFirstPurchase: 120,
    gmFirstPurchase: 60,
    crRepeatPurchase: 20,
    aovRepeatPurchase: 80,
    gmRepeatPurchase: 70,
    marketingOpexFixed: 5000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value),
    }));
  };

  const results = useMemo(() => {
    const {
      adsBudget, paidSessions, organicSessions, crFirstPurchase, aovFirstPurchase,
      gmFirstPurchase, crRepeatPurchase, aovRepeatPurchase, gmRepeatPurchase, marketingOpexFixed,
    } = inputs;

    const totalSessions = paidSessions + organicSessions;
    const cpSessionBlended = paidSessions > 0 ? adsBudget / paidSessions : 0;
    
    const totalFirstPurchases = totalSessions * (crFirstPurchase / 100);
    const revenueFirstPurchase = totalFirstPurchases * aovFirstPurchase;
    const grossProfitFirstPurchase = revenueFirstPurchase * (gmFirstPurchase / 100);

    const totalRepeatPurchases = totalFirstPurchases * (crRepeatPurchase / 100);
    const revenueRepeatPurchase = totalRepeatPurchases * aovRepeatPurchase;
    const grossProfitRepeatPurchase = revenueRepeatPurchase * (gmRepeatPurchase / 100);

    const totalGrossProfit = grossProfitFirstPurchase + grossProfitRepeatPurchase;
    const totalMarketingCost = adsBudget + marketingOpexFixed;
    const netProfit = totalGrossProfit - totalMarketingCost;

    return { totalSessions, cpSessionBlended, totalGrossProfit, netProfit, totalMarketingCost };
  }, [inputs]);

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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <Card className="lg:col-span-3 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Business Inputs</CardTitle>
          <CardDescription>Adjust these values to model your profit.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {inputFields.map(({ name, label, description, adornment }) => (
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
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-lg sticky top-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Calculated Results</CardTitle>
          <CardDescription>Your financial forecast based on the inputs.</CardDescription>
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
  );
}
