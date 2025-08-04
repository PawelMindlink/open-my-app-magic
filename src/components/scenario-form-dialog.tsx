"use client";

import React, { useState, useEffect } from "react";
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
import { Inputs, Currency, inputFields } from "@/lib/types";
import { Scenario, Impact } from "./scenario-manager";

type ScenarioFormDialogProps = {
  children?: React.ReactNode;
  onSaveScenario: (scenario: Omit<Scenario, "id" | "active" | "estimateLevel" | "isCustom">, id?: string) => void;
  currency: Currency;
  scenario?: Scenario | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

// Exclude budget and fixed cost fields from being directly impactable in scenarios
const impactableMetrics = inputFields.filter(field => 
    !field.name.toLowerCase().includes('budget') && 
    field.name !== 'marketingOpexFixed'
);

export function ScenarioFormDialog({ children, onSaveScenario, currency, scenario, open: controlledOpen, onOpenChange: setControlledOpen }: ScenarioFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [impact, setImpact] = useState<Partial<Record<keyof Inputs, Impact>>>({});

  const isEditing = !!scenario;

  useEffect(() => {
      if (open && scenario) {
          setName(scenario.name);
          setDescription(scenario.description);
          setCost(scenario.cost);
          setImpact(scenario.impact);
      } else if (!open) {
          // Reset form when dialog is closed
          setName("");
          setDescription("");
          setCost(0);
          setImpact({});
      }
  }, [open, scenario]);

  const handleImpactChange = (
    metric: keyof Inputs,
    level: keyof Impact,
    value: string
  ) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setImpact((prev) => {
        const newMetricImpact = { ...prev[metric], [level]: numValue };
        // If all levels for a metric are undefined, remove the metric from impact
        if (Object.values(newMetricImpact).every(v => v === undefined)) {
            const newImpact = {...prev};
            delete newImpact[metric];
            return newImpact;
        }
      return {
        ...prev,
        [metric]: newMetricImpact,
      };
    });
  };

  const handleSubmit = () => {
    if (!name || !description) {
        // Basic validation
        return;
    }
    const newScenario = {
        name,
        description,
        cost,
        impact
    };
    onSaveScenario(newScenario, scenario?.id);
    setOpen(false);
  };
  
  const dialogContent = (
    <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{isEditing ? "Edit Scenario" : "Add Custom Scenario"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify this business initiative." : "Define a new business initiative to see its potential financial impact."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 -mx-4">
            <div className="space-y-6 px-1">
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
                        {impactableMetrics.map(({ name: metricName, label }) => (
                             <div key={metricName} className="p-3 border rounded-md">
                                <Label className="font-semibold">{label}</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <div>
                                        <Label htmlFor={`${metricName}-pessimistic`} className="text-xs text-muted-foreground">Pessimistic</Label>
                                        <div className="relative">
                                          <Input id={`${metricName}-pessimistic`} type="number" placeholder="0" 
                                            value={impact[metricName]?.pessimistic ?? ''}
                                            onChange={e => handleImpactChange(metricName, 'pessimistic', e.target.value)}
                                            className="pr-6"
                                          />
                                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor={`${metricName}-realistic`} className="text-xs text-muted-foreground">Realistic</Label>
                                        <div className="relative">
                                            <Input id={`${metricName}-realistic`} type="number" placeholder="0" 
                                              value={impact[metricName]?.realistic ?? ''}
                                              onChange={e => handleImpactChange(metricName, 'realistic', e.target.value)}
                                              className="pr-6"
                                            />
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor={`${metricName}-optimistic`} className="text-xs text-muted-foreground">Optimistic</Label>
                                        <div className="relative">
                                            <Input id={`${metricName}-optimistic`} type="number" placeholder="0" 
                                                value={impact[metricName]?.optimistic ?? ''}
                                                onChange={e => handleImpactChange(metricName, 'optimistic', e.target.value)}
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
          <Button type="submit" onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Scenario"}</Button>
        </DialogFooter>
    </DialogContent>
  );

  if (children) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            {dialogContent}
        </Dialog>
    )
  }

  return <Dialog open={open} onOpenChange={setOpen}>{dialogContent}</Dialog>;
}
