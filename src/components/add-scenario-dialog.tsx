"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inputs, Currency } from "./profit-calculator";
import { Scenario, Impact } from "./scenario-manager";

type AddScenarioDialogProps = {
  children: React.ReactNode;
  onAddScenario: (scenario: Omit<Scenario, "id" | "active" | "estimateLevel">) => void;
  currency: Currency;
};

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

const impactableMetrics: { key: keyof Inputs; label: string }[] = [
  { key: "metaCpc", label: "Meta CPC" },
  { key: "metaConversionRate", label: "Meta Conv. Rate" },
  { key: "googleCpc", label: "Google CPC" },
  { key: "googleConversionRate", label: "Google Conv. Rate" },
  { key: "organicSessions", label: "Organic Sessions" },
  { key: "crFirstPurchase", label: "Baseline CR First Purchase" },
  { key: "aovFirstPurchase", label: "AOV First Purchase" },
  { key: "crRepeatPurchase", label: "CR Repeat Purchase" },
];

export function AddScenarioDialog({ children, onAddScenario, currency }: AddScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [impact, setImpact] = useState<Partial<Record<keyof Inputs, Impact>>>({});

  const handleImpactChange = (
    metric: keyof Inputs,
    level: keyof Impact,
    value: string
  ) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setImpact((prev) => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [level]: numValue,
      },
    }));
  };

  const handleSubmit = () => {
    if (!name || !description) {
        // Basic validation
        return;
    }
    const newScenario: Omit<Scenario, 'id' | 'active' | 'estimateLevel'> = {
        name,
        description,
        cost,
        impact
    };
    onAddScenario(newScenario);
    // Reset form
    setName("");
    setDescription("");
    setCost(0);
    setImpact({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Add Custom Scenario</DialogTitle>
          <DialogDescription>
            Define a new business initiative to see its potential financial impact.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="scenario-name" className="font-headline">Scenario Name</Label>
                    <Input id="scenario-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Q3 Content Marketing Push" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="scenario-desc" className="font-headline">Description</Label>
                    <Textarea id="scenario-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of the initiative." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="scenario-cost" className="font-headline">Total Investment Cost</Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbols[currency]}</span>
                        <Input id="scenario-cost" type="number" value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} className="pl-7" />
                    </div>
                </div>

                <div>
                    <h4 className="font-headline text-lg mb-4">Impact on Metrics (%)</h4>
                    <div className="space-y-4">
                        {impactableMetrics.map(({key, label}) => (
                             <div key={key} className="p-3 border rounded-md">
                                <Label className="font-semibold">{label}</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <div>
                                        <Label htmlFor={`${key}-pessimistic`} className="text-xs text-muted-foreground">Pessimistic</Label>
                                        <div className="relative">
                                          <Input id={`${key}-pessimistic`} type="number" placeholder="0" 
                                            value={impact[key]?.pessimistic ?? ''}
                                            onChange={e => handleImpactChange(key, 'pessimistic', e.target.value)}
                                            className="pr-6"
                                          />
                                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor={`${key}-realistic`} className="text-xs text-muted-foreground">Realistic</Label>
                                        <div className="relative">
                                            <Input id={`${key}-realistic`} type="number" placeholder="0" 
                                              value={impact[key]?.realistic ?? ''}
                                              onChange={e => handleImpactChange(key, 'realistic', e.target.value)}
                                              className="pr-6"
                                            />
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor={`${key}-optimistic`} className="text-xs text-muted-foreground">Optimistic</Label>
                                        <div className="relative">
                                            <Input id={`${key}-optimistic`} type="number" placeholder="0" 
                                                value={impact[key]?.optimistic ?? ''}
                                                onChange={e => handleImpactChange(key, 'optimistic', e.target.value)}
                                                className="pr-6"
                                            />
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Add Scenario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
