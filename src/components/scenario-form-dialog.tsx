
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inputs, Currency, inputFields } from "@/lib/types";
import { Scenario, Impact } from "./scenario-manager";
import { cn } from "@/lib/utils";

type ScenarioFormDialogProps = {
  onSaveScenario: (scenario: Omit<Scenario, "id" | "active" | "estimateLevel" | "isCustom">, id?: string) => void;
  currency: Currency;
  scenario?: Scenario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
};

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

export function ScenarioFormDialog({ children, onSaveScenario, currency, scenario, open, onOpenChange }: ScenarioFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [impact, setImpact] = useState<Partial<Record<keyof Inputs, Impact>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const impactableMetrics = useMemo(() => {
    return inputFields.filter(field => 
        !field.name.toLowerCase().includes('budget') && 
        field.name !== 'marketingOpexFixed'
    );
  }, []);

  const isEditing = !!scenario;

  useEffect(() => {
      if (open && scenario) {
          setName(scenario.name);
          setDescription(scenario.description);
          setCost(scenario.cost);
          setImpact(scenario.impact);
          setErrors({});
      } else if (!open) {
          // Reset form when dialog is closed
          setName("");
          setDescription("");
          setCost(0);
          setImpact({});
          setErrors({});
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
        if (Object.values(newMetricImpact).every(v => v === undefined || v === 0 || v === null || v === '')) {
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Scenario name is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = () => {
    if (!validate()) {
        const firstErrorKey = Object.keys(errors)[0] || 'name';
        const errorElement = formRef.current?.querySelector(`[data-field-key="${firstErrorKey}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    const newScenario = {
        name,
        description,
        cost,
        impact
    };
    onSaveScenario(newScenario, scenario?.id);
    onOpenChange(false);
  };
  
  const dialogContent = (
    <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{isEditing ? "Edit Scenario" : "Add Custom Scenario"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify this business initiative." : "Define a new business initiative to see its potential financial impact."}
            <br/>
            <span className="text-xs text-muted-foreground">Fields marked with * are required.</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4 -mx-4">
            <div className="space-y-6 px-1" ref={formRef}>
                <div className="space-y-2" data-field-key="name">
                    <Label htmlFor="scenario-name" className="font-headline">Scenario Name *</Label>
                    <Input id="scenario-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Q3 Content Marketing Push" className={cn(errors.name && "border-destructive")} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                 <div className="space-y-2" data-field-key="description">
                    <Label htmlFor="scenario-desc" className="font-headline">Description *</Label>
                    <Textarea id="scenario-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of the initiative." className={cn(errors.description && "border-destructive")} />
                     {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Scenario"}</Button>
        </DialogFooter>
    </DialogContent>
  );

  return <Dialog open={open} onOpenChange={onOpenChange}>{children}{dialogContent}</Dialog>;
}
