"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Inputs } from "./profit-calculator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AddScenarioDialog } from "./add-scenario-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { PlusCircle } from "lucide-react";

export type EstimateLevel = 'pessimistic' | 'realistic' | 'optimistic';

export type Impact = {
  [key in EstimateLevel]?: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  cost: number;
  impact: Partial<Record<keyof Inputs, Impact>>; // Percentage change
};

const initialScenarios: Scenario[] = [
  {
    id: "cro-project",
    name: "Conversion Rate Optimization Project",
    description: "Implement A/B testing and UX improvements on key landing pages.",
    cost: 1500,
    impact: { 
        crFirstPurchase: { pessimistic: 5, realistic: 10, optimistic: 15 }, 
        metaConversionRate: { pessimistic: 2, realistic: 5, optimistic: 8 }, 
        googleConversionRate: { pessimistic: 2, realistic: 5, optimistic: 8 } 
    },
  },
  {
    id: "seo-optimization",
    name: "SEO Optimization Campaign",
    description: "Improve organic search rankings through content marketing and technical SEO.",
    cost: 2000,
    impact: { organicSessions: { pessimistic: 10, realistic: 20, optimistic: 30 } },
  },
  {
    id: "product-bundle",
    name: "Add Product Bundle Landing Page",
    description: "Introduce a new landing page offering a discounted product bundle.",
    cost: 500,
    impact: { aovFirstPurchase: { pessimistic: 5, realistic: 15, optimistic: 20 } },
  },
  {
    id: "email-marketing",
    name: "Start Email Marketing Campaign",
    description: "Launch a newsletter and automated email flows to engage customers.",
    cost: 800,
    impact: { crRepeatPurchase: { pessimistic: 10, realistic: 25, optimistic: 35 } },
  },
   {
    id: "agency-ads",
    name: "Hire Professional Agency for Ads",
    description: "Outsource ad management to an expert agency for better efficiency.",
    cost: 4000,
    impact: { 
        metaCpc: { pessimistic: -5, realistic: -10, optimistic: -15 }, 
        googleCpc: { pessimistic: -5, realistic: -10, optimistic: -15 }, 
        metaConversionRate: { pessimistic: 5, realistic: 15, optimistic: 20 }, 
        googleConversionRate: { pessimistic: 5, realistic: 15, optimistic: 20 } 
    },
  },
];

type ScenarioManagerProps = {
  onActiveScenariosChange: (activeScenarios: Scenario[]) => void;
  onEstimateLevelChange: (level: EstimateLevel) => void;
};

export function ScenarioManager({ onActiveScenariosChange, onEstimateLevelChange }: ScenarioManagerProps) {
  const [availableScenarios, setAvailableScenarios] = useState<Scenario[]>(initialScenarios);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [estimateLevel, setEstimateLevel] = useState<EstimateLevel>('realistic');

  const handleAddScenario = (newScenario: Omit<Scenario, 'id'>) => {
    const scenarioWithId = { ...newScenario, id: `custom-${Date.now()}` };
    setAvailableScenarios(prev => [...prev, scenarioWithId]);
  };

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
  }, [activeIds, onActiveScenariosChange, availableScenarios]);

  useEffect(() => {
    onEstimateLevelChange(estimateLevel);
  }, [estimateLevel, onEstimateLevelChange]);


  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatImpact = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}%`;
  }

  const impactMetricLabels: Record<keyof Inputs, string> = {
    metaAdsBudget: "Meta Ads Budget",
    metaCpc: "Meta CPC",
    metaConversionRate: "Meta Conv. Rate",
    googleAdsBudget: "Google Ads Budget",
    googleCpc: "Google CPC",
    googleConversionRate: "Google Conv. Rate",
    organicSessions: "Organic Sessions",
    crFirstPurchase: "Baseline CR First Purchase",
    aovFirstPurchase: "AOV First Purchase",
    gmFirstPurchase: "GM First Purchase",
    crRepeatPurchase: "CR Repeat Purchase",
    aovRepeatPurchase: "AOV Repeat Purchase",
    gmRepeatPurchase: "GM Repeat Purchase",
    marketingOpexFixed: "Marketing OPEX",
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-2xl">Scenario Planning</CardTitle>
            <CardDescription>
            Select different "what-if" scenarios to see their layered impact on your profitability.
            </CardDescription>
        </div>
        <AddScenarioDialog onAddScenario={handleAddScenario}>
            <Button>
                <PlusCircle className="mr-2" />
                Add Scenario
            </Button>
        </AddScenarioDialog>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-card-foreground/5">
            <Label className="font-headline text-base mb-3 block">Estimation Level</Label>
            <RadioGroup defaultValue="realistic" value={estimateLevel} onValueChange={(value) => setEstimateLevel(value as EstimateLevel)} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pessimistic" id="pessimistic" />
                    <Label htmlFor="pessimistic">Pessimistic</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="realistic" id="realistic" />
                    <Label htmlFor="realistic">Realistic</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="optimistic" id="optimistic" />
                    <Label htmlFor="optimistic">Optimistic</Label>
                </div>
            </RadioGroup>
        </div>

        <div className="space-y-4">
            {availableScenarios.map((scenario) => (
            <div key={scenario.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2 pr-4">
                    <div className="flex items-center gap-4">
                        <Label htmlFor={scenario.id} className="font-headline text-base cursor-pointer flex-grow">
                            {scenario.name}
                        </Label>
                        <Badge variant="outline">{formatCurrency(scenario.cost)}</Badge>
                    </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(scenario.impact).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="font-mono">
                            {impactMetricLabels[key as keyof Inputs]}:{' '}
                            <span className={(value[estimateLevel] ?? 0) > 0 ? 'text-green-700' : 'text-red-700'}>
                                {formatImpact(value[estimateLevel] ?? 0)}
                            </span>
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
        </div>
      </CardContent>
    </Card>
  );
}
