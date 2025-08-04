
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Inputs,
  Currency,
  impactableMetrics,
  Impact,
  ImpactType,
  InputField,
} from "@/lib/types";
import { Scenario } from "./scenario-manager";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "./ui/progress";

type ScenarioFormDialogProps = {
  onSaveScenario: (
    scenario: Omit<Scenario, "id" | "active" | "estimateLevel" | "isCustom">,
    id?: string
  ) => void;
  currency: Currency;
  scenario?: Scenario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  currentInputs: Inputs;
};

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

export function ScenarioFormDialog({
  children,
  onSaveScenario,
  currency,
  scenario,
  open,
  onOpenChange,
  currentInputs,
}: ScenarioFormDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [selectedMetrics, setSelectedMetrics] = useState<Record<keyof Inputs, boolean>>(() =>
    impactableMetrics.reduce((acc, m) => ({ ...acc, [m.name]: false }), {} as Record<keyof Inputs, boolean>)
  );
  const [impact, setImpact] = useState<Partial<Record<keyof Inputs, Impact>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!scenario;

  const resetState = () => {
    setStep(1);
    setName("");
    setDescription("");
    setCost(0);
    const initialSelected = impactableMetrics.reduce((acc, m) => ({ ...acc, [m.name]: false }), {} as Record<keyof Inputs, boolean>);
    setSelectedMetrics(initialSelected);
    setImpact({});
    setErrors({});
  }

  useEffect(() => {
    if (open && scenario) {
      setName(scenario.name);
      setDescription(scenario.description);
      setCost(scenario.cost);
      setImpact(scenario.impact);
      const scenarioSelectedMetrics = { ...selectedMetrics };
      for (const key in scenario.impact) {
        scenarioSelectedMetrics[key as keyof Inputs] = true;
      }
      setSelectedMetrics(scenarioSelectedMetrics);
      setErrors({});
    } else if (!open) {
      resetState();
    }
  }, [open, scenario]);

  const handleImpactChange = (
    metric: keyof Inputs,
    field: "type" | "pessimistic" | "realistic" | "optimistic",
    value: string | ImpactType
  ) => {
    setImpact((prev) => {
      const currentImpact = prev[metric] ?? { type: 'percentage', value: {} };
      let newImpact;
      if (field === 'type') {
        newImpact = { ...currentImpact, type: value as ImpactType };
      } else {
        const numValue = value === "" ? undefined : parseFloat(value as string);
        newImpact = { ...currentImpact, value: { ...currentImpact.value, [field]: numValue }};
      }
      return { ...prev, [metric]: newImpact };
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Scenario name is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      const hasSelectedMetrics = Object.values(selectedMetrics).some(v => v);
      if (!hasSelectedMetrics) {
          setErrors({ metrics: "Please select at least one metric to impact." });
          return;
      }
      setErrors({});
      // Initialize impact objects for newly selected metrics
      setImpact(prev => {
        const newImpact = {...prev};
        Object.entries(selectedMetrics).forEach(([key, value]) => {
          if (value && !newImpact[key as keyof Inputs]) {
            newImpact[key as keyof Inputs] = { type: 'percentage', value: {} };
          }
        })
        return newImpact;
      })
      setStep(3);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    const newScenario = { name, description, cost, impact };
    onSaveScenario(newScenario, scenario?.id);
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      default: return null;
    }
  };
  
  const Step1 = () => (
    <div className="space-y-6 px-1">
      <div className="space-y-2">
        <Label htmlFor="scenario-name" className="font-headline">Scenario Name *</Label>
        <Input id="scenario-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q3 Content Marketing Push" className={cn(errors.name && "border-destructive")} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="scenario-desc" className="font-headline">Description *</Label>
        <Textarea id="scenario-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the initiative." className={cn(errors.description && "border-destructive")} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="scenario-cost" className="font-headline">Total Investment Cost</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbols[currency]}</span>
          <Input id="scenario-cost" type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} className="pl-7" />
        </div>
      </div>
    </div>
  );

  const Step2 = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredMetrics = useMemo(() => 
        impactableMetrics.filter(m => m.label.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    return (
        <div className="space-y-4 px-1">
            <Input 
                type="text" 
                placeholder="Search metrics..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
            />
            {errors.metrics && <p className="text-sm text-destructive mt-1">{errors.metrics}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMetrics.map(({ name, label }) => (
                <div key={name} className="flex items-center space-x-2 p-3 border rounded-md">
                    <Checkbox
                        id={name}
                        checked={selectedMetrics[name]}
                        onCheckedChange={(checked) =>
                            setSelectedMetrics(prev => ({ ...prev, [name]: !!checked }))
                        }
                    />
                    <Label htmlFor={name} className="font-normal cursor-pointer flex-grow">{label}</Label>
                </div>
            ))}
            </div>
            {filteredMetrics.length === 0 && <p className="text-muted-foreground text-center">No metrics found.</p>}
        </div>
    );
  };
  
  const Step3 = () => (
    <div className="space-y-4 px-1">
      {impactableMetrics
        .filter(m => selectedMetrics[m.name])
        .map(metric => (
          <ImpactInput key={metric.name} metric={metric} />
        ))}
    </div>
  );

  const ImpactInput = ({ metric }: { metric: InputField }) => {
      const metricImpact = impact[metric.name] ?? { type: 'percentage', value: {} };
      const currentVal = currentInputs[metric.name];
      
      const getPlaceholder = (level: keyof Impact['value']) => {
          if (metricImpact.type === 'absolute') {
              return currentVal.toString();
          }
          return "0";
      }

      const getSuffix = () => {
          if (metric.isCurrency) return currencySymbols[currency];
          if (metric.isPercentage || metricImpact.type === 'percentage') return "%";
          return "";
      }

      return (
        <div className="p-4 border rounded-md">
          <div className="flex justify-between items-center mb-4">
              <div>
                <Label className="font-semibold">{metric.label}</Label>
                <p className="text-xs text-muted-foreground">Current Value: {currentVal}{metric.isPercentage ? '%' : ''}</p>
              </div>
              <RadioGroup
                value={metricImpact.type}
                onValueChange={(v) => handleImpactChange(metric.name, 'type', v as ImpactType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id={`${metric.name}-percentage`} />
                  <Label htmlFor={`${metric.name}-percentage`}>% Change</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="absolute" id={`${metric.name}-absolute`} />
                  <Label htmlFor={`${metric.name}-absolute`}>Absolute</Label>
                </div>
              </RadioGroup>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor={`${metric.name}-pessimistic`} className="text-xs text-muted-foreground">Pessimistic</Label>
              <div className="relative">
                <Input id={`${metric.name}-pessimistic`} type="number" placeholder={getPlaceholder('pessimistic')}
                  value={metricImpact.value?.pessimistic ?? ''}
                  onChange={e => handleImpactChange(metric.name, 'pessimistic', e.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">{getSuffix()}</span>
              </div>
            </div>
            <div>
              <Label htmlFor={`${metric.name}-realistic`} className="text-xs text-muted-foreground">Realistic</Label>
              <div className="relative">
                <Input id={`${metric.name}-realistic`} type="number" placeholder={getPlaceholder('realistic')}
                  value={metricImpact.value?.realistic ?? ''}
                  onChange={e => handleImpactChange(metric.name, 'realistic', e.target.value)}
                  className="pr-8"
                />
                 <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">{getSuffix()}</span>
              </div>
            </div>
            <div>
              <Label htmlFor={`${metric.name}-optimistic`} className="text-xs text-muted-foreground">Optimistic</Label>
              <div className="relative">
                <Input id={`${metric.name}-optimistic`} type="number" placeholder={getPlaceholder('optimistic')}
                  value={metricImpact.value?.optimistic ?? ''}
                  onChange={e => handleImpactChange(metric.name, 'optimistic', e.target.value)}
                  className="pr-8"
                />
                 <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">{getSuffix()}</span>
              </div>
            </div>
          </div>
        </div>
      );
  }

  const stepTitles = ["Details", "Select Metrics", "Define Impact"];
  const progressValue = ((step) / 3) * 100;

  const dialogContent = (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">
          {isEditing ? "Edit Scenario" : "Add Custom Scenario"}
        </DialogTitle>
        <DialogDescription>
          {stepTitles[step - 1]} ({step}/3)
        </DialogDescription>
        <Progress value={progressValue} className="w-full mt-2" />
      </DialogHeader>
      <ScrollArea className="max-h-[60vh] p-4 -mx-4">
        {renderStep()}
      </ScrollArea>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <div className="flex-grow flex justify-end gap-2">
          {step > 1 && (
            <Button type="button" variant="ghost" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>
              {isEditing ? "Save Changes" : "Add Scenario"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );

  return <Dialog open={open} onOpenChange={onOpenChange}>{children}{dialogContent}</Dialog>;
}
