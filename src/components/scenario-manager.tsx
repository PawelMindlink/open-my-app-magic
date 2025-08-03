"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Inputs } from "./profit-calculator";
import { Badge } from "./ui/badge";

export type Scenario = {
  id: string;
  name: string;
  description: string;
  cost: number;
  impact: Partial<Record<keyof Inputs, number>>; // Percentage change
};

const availableScenarios: Scenario[] = [
  {
    id: "cro-project",
    name: "Conversion Rate Optimization Project",
    description: "Implement A/B testing and UX improvements on key landing pages.",
    cost: 1500,
    impact: { crFirstPurchase: 10, metaConversionRate: 5, googleConversionRate: 5 },
  },
  {
    id: "seo-optimization",
    name: "SEO Optimization Campaign",
    description: "Improve organic search rankings through content marketing and technical SEO.",
    cost: 2000,
    impact: { organicSessions: 20 },
  },
  {
    id: "product-bundle",
    name: "Add Product Bundle Landing Page",
    description: "Introduce a new landing page offering a discounted product bundle.",
    cost: 500,
    impact: { aovFirstPurchase: 15 },
  },
  {
    id: "email-marketing",
    name: "Start Email Marketing Campaign",
    description: "Launch a newsletter and automated email flows to engage customers.",
    cost: 800,
    impact: { crRepeatPurchase: 25 },
  },
   {
    id: "agency-ads",
    name: "Hire Professional Agency for Ads",
    description: "Outsource ad management to an expert agency for better efficiency.",
    cost: 4000,
    impact: { metaCpc: -10, googleCpc: -10, metaConversionRate: 15, googleConversionRate: 15 },
  },
];

type ScenarioManagerProps = {
  onActiveScenariosChange: (activeScenarios: Scenario[]) => void;
};

export function ScenarioManager({ onActiveScenariosChange }: ScenarioManagerProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  const toggleScenario = (scenarioId: string) => {
    setActiveIds(prev => {
      const newIds = new Set(prev);
      if (newIds.has(scenarioId)) {
        newIds.delete(scenarioId);
      } else {
        newIds.add(scenarioId);
      }
      return newIds;
    });
  };

  useEffect(() => {
    const activeScenarios = availableScenarios.filter(s => activeIds.has(s.id));
    onActiveScenariosChange(activeScenarios);
  }, [activeIds, onActiveScenariosChange]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatImpact = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}%`;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Scenario Planning</CardTitle>
        <CardDescription>
          Select different "what-if" scenarios to see their layered impact on your profitability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableScenarios.map((scenario) => (
          <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1 space-y-2 pr-4">
                <div className="flex items-center gap-4">
                    <Label htmlFor={scenario.id} className="font-headline text-base cursor-pointer">
                        {scenario.name}
                    </Label>
                    <Badge variant="outline">{formatCurrency(scenario.cost)} / mo</Badge>
                </div>
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(scenario.impact).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className={value > 0 ? 'text-green-700' : 'text-red-700'}>
                        {key}: {formatImpact(value)}
                    </Badge>
                ))}
              </div>
            </div>
            <Switch
              id={scenario.id}
              checked={activeIds.has(scenario.id)}
              onCheckedChange={() => toggleScenario(scenario.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
