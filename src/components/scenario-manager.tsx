"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Inputs, Currency } from "./profit-calculator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AddScenarioDialog } from "./add-scenario-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./ui/separator";

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
  active: boolean;
  estimateLevel: EstimateLevel;
};

const initialScenarios: Omit<Scenario, 'active' | 'estimateLevel'>[] = [
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
  currency: Currency;
  activeScenarios: Scenario[];
  onActiveScenariosChange: (activeScenarios: Scenario[]) => void;
  globalEstimateLevel: EstimateLevel | 'individual';
  onGlobalEstimateLevelChange: (level: EstimateLevel | 'individual') => void;
};

export function ScenarioManager({ 
    currency,
    onActiveScenariosChange, 
    globalEstimateLevel,
    onGlobalEstimateLevelChange 
}: ScenarioManagerProps) {
  const [availableScenarios, setAvailableScenarios] = useState<Scenario[]>(() => 
    initialScenarios.map(s => ({...s, active: false, estimateLevel: 'realistic'}))
  );

  const handleAddScenario = (newScenario: Omit<Scenario, 'id' | 'active' | 'estimateLevel'>) => {
    const scenarioWithId = { ...newScenario, id: `custom-${Date.now()}`, active: true, estimateLevel: 'realistic' as EstimateLevel };
    setAvailableScenarios(prev => [...prev, scenarioWithId]);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setAvailableScenarios(prev => prev.filter(s => s.id !== scenarioId));
  };

  const toggleScenario = (scenarioId: string) => {
    setAvailableScenarios(prev => prev.map(s => 
        s.id === scenarioId ? {...s, active: !s.active} : s
    ));
  };
  
  const setScenarioEstimateLevel = (scenarioId: string, level: EstimateLevel) => {
     setAvailableScenarios(prev => prev.map(s => 
        s.id === scenarioId ? {...s, estimateLevel: level} : s
    ));
  }

  useEffect(() => {
    const active = availableScenarios.filter(s => s.active);
    onActiveScenariosChange(active);
  }, [availableScenarios, onActiveScenariosChange]);


  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);

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
        <AddScenarioDialog onAddScenario={handleAddScenario} currency={currency}>
            <Button>
                <PlusCircle className="mr-2" />
                Add Scenario
            </Button>
        </AddScenarioDialog>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-card-foreground/5">
            <Label className="font-headline text-base mb-3 block">Global Estimation Level</Label>
            <RadioGroup value={globalEstimateLevel} onValueChange={(value) => onGlobalEstimateLevelChange(value as any)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                </div>
            </RadioGroup>
        </div>

        <div className="space-y-4">
            {availableScenarios.map((scenario) => {
              const currentEstimateLevel = globalEstimateLevel === 'individual' ? scenario.estimateLevel : globalEstimateLevel;
              return (
                <div key={scenario.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2 pr-4">
                            <div className="flex items-center gap-4">
                                <Label htmlFor={scenario.id} className="font-headline text-base cursor-pointer flex-grow">
                                    {scenario.name}
                                </Label>
                                <Badge variant="outline">{formatCurrency(scenario.cost)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {scenario.id.startsWith('custom-') && (
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteScenario(scenario.id)}>
                               <Trash2 className="w-4 h-4 text-destructive" />
                             </Button>
                           )}
                           <Switch
                                id={scenario.id}
                                checked={scenario.active}
                                onCheckedChange={() => toggleScenario(scenario.id)}
                            />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1">
                        <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Impacts</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {Object.entries(scenario.impact).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="font-mono">
                                    {impactMetricLabels[key as keyof Inputs]}:{' '}
                                    <span className={(value[currentEstimateLevel] ?? 0) > 0 ? 'text-green-700' : 'text-red-700'}>
                                        {formatImpact(value[currentEstimateLevel] ?? 0)}
                                    </span>
                                </Badge>
                            ))}
                        </div>
                      </div>
                      <div className="w-full md:w-48">
                         <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Confidence</Label>
                         <Select 
                            value={scenario.estimateLevel} 
                            onValueChange={(v) => setScenarioEstimateLevel(scenario.id, v as EstimateLevel)}
                            disabled={globalEstimateLevel !== 'individual'}
                          >
                            <SelectTrigger>
                                <SelectValue placeholder="Select estimate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pessimistic">Pessimistic</SelectItem>
                                <SelectItem value="realistic">Realistic</SelectItem>
                                <SelectItem value="optimistic">Optimistic</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
