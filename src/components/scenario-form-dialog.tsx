
"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

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

const Step1 = memo(({ name, setName, description, setDescription, cost, setCost, currency, errors }: any) => (
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
));
Step1.displayName = "Step1";


const Step2 = memo(({ selectedMetrics, setSelectedMetrics, errors }: any) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const metricGroups = useMemo(() => {
        type MetricGroup = {
            prospecting: InputField[];
            remarketing: InputField[];
            items: InputField[];
        }
        const groups: Record<string, MetricGroup> = {
            "Meta Ads": { prospecting: [], remarketing: [], items: [] },
            "Google Ads": { prospecting: [], remarketing: [], items: [] },
            "Organic": { prospecting: [], remarketing: [], items: [] },
            "First Purchase": { prospecting: [], remarketing: [], items: [] },
            "Repeat Purchase": { prospecting: [], remarketing: [], items: [] },
        };

        const filteredMetrics = impactableMetrics.filter(m => 
            m.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredMetrics.forEach(m => {
            if (m.group.startsWith('meta')) {
                 if (m.label.toLowerCase().includes('prospecting')) {
                    groups["Meta Ads"].prospecting.push(m);
                } else if (m.label.toLowerCase().includes('remarketing')) {
                    groups["Meta Ads"].remarketing.push(m);
                }
            } else if (m.group.startsWith('google')) {
                 if (m.label.toLowerCase().includes('prospecting')) {
                    groups["Google Ads"].prospecting.push(m);
                } else if (m.label.toLowerCase().includes('remarketing')) {
                    groups["Google Ads"].remarketing.push(m);
                }
            } else if (m.group === 'general-organic') {
                groups["Organic"].items.push(m);
            } else if (m.group === 'general-first-purchase') {
                groups["First Purchase"].items.push(m);
            } else if (m.group === 'general-repeat-purchase') {
                groups["Repeat Purchase"].items.push(m);
            }
        });
        
        return Object.entries(groups).filter(([, metrics]) => metrics.prospecting.length > 0 || metrics.remarketing.length > 0 || metrics.items.length > 0);
    }, [searchTerm]);

    const renderMetricCheckbox = (metric: InputField) => (
        <div key={metric.name} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
            <Checkbox
                id={`metric-${metric.name}`}
                checked={selectedMetrics[metric.name]}
                onCheckedChange={(checked) =>
                    setSelectedMetrics((prev: any) => ({ ...prev, [metric.name]: !!checked }))
                }
            />
            <Label htmlFor={`metric-${metric.name}`} className="font-normal cursor-pointer flex-grow">{metric.label}</Label>
        </div>
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
            <Accordion type="multiple" defaultValue={["Meta Ads", "Google Ads", "Organic", "First Purchase", "Repeat Purchase"]} className="w-full">
                {metricGroups.map(([groupName, metrics]) => (
                     <AccordionItem value={groupName} key={groupName}>
                        <AccordionTrigger>{groupName}</AccordionTrigger>
                        <AccordionContent>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                <div>
                                    {metrics.prospecting.map(renderMetricCheckbox)}
                                    {metrics.items.map(renderMetricCheckbox)}
                                </div>
                                <div>
                                    {metrics.remarketing.map(renderMetricCheckbox)}
                                </div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
             {metricGroups.length === 0 && <p className="text-muted-foreground text-center py-4">No metrics found.</p>}
        </div>
    );
});
Step2.displayName = "Step2";


const ImpactInput = memo(({ metric, impact, setImpact, currency, currentInputs }: { metric: InputField, impact: Impact, setImpact: any, currency: Currency, currentInputs: Inputs }) => {
    const metricImpact = impact ?? { type: 'percentage', value: {} };
    const currentVal = currentInputs[metric.name];
    const [focusedInput, setFocusedInput] = useState<keyof Impact['value'] | null>(null);
    
    const getPlaceholder = (level: keyof Impact['value']) => {
        if (metricImpact.type === 'absolute') {
            return currentVal.toString();
        }
        return "0";
    }

    const getSuffix = () => {
        if (metric.isCurrency && metricImpact.type === 'absolute') return currencySymbols[currency];
        if (metric.isPercentage || metricImpact.type === 'percentage') return "%";
        return "";
    }

    const handleFocus = (level: keyof Impact['value']) => {
        setFocusedInput(level);
    }

    const handleBlur = () => {
        setFocusedInput(null);
    }

    const handleImpactChange = (field: keyof Impact['value'], value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setImpact((prev: any) => ({
            ...prev,
            [metric.name]: {
                ...prev[metric.name],
                value: {
                    ...(prev[metric.name]?.value ?? {}),
                    [field]: numValue
                }
            }
        }));
    }
    
    const handleTypeChange = (v: ImpactType) => {
        setImpact((prev: any) => ({...prev, [metric.name]: {...(prev[metric.name] ?? {value: {}}), type: v}}))
    }

    useEffect(() => {
        if (!focusedInput) return;

        const sourceValue = metricImpact.value?.[focusedInput];
        if (sourceValue === undefined) return;
        
        let realistic, pessimistic, optimistic;

        switch(focusedInput) {
            case 'realistic':
                realistic = sourceValue;
                pessimistic = realistic * 0.75;
                optimistic = realistic * 1.25;
                break;
            case 'pessimistic':
                pessimistic = sourceValue;
                realistic = pessimistic / 0.75;
                optimistic = realistic * 1.25;
                break;
            case 'optimistic':
                optimistic = sourceValue;
                realistic = optimistic / 1.25;
                pessimistic = realistic * 0.75;
                break;
        }

        const format = (val: number) => parseFloat(val.toFixed(2));

        setImpact((prev: any) => {
             const newImpact = {
                ...prev,
                [metric.name]: {
                    ...prev[metric.name],
                    value: {
                        pessimistic: focusedInput === 'pessimistic' ? pessimistic : format(pessimistic),
                        realistic: focusedInput === 'realistic' ? realistic : format(realistic),
                        optimistic: focusedInput === 'optimistic' ? optimistic : format(optimistic),
                    }
                }
            };
            return newImpact;
        });

    }, [metricImpact.value?.pessimistic, metricImpact.value?.realistic, metricImpact.value?.optimistic, focusedInput]);

    return (
      <div className="p-4 border rounded-md">
        <div className="flex justify-between items-center mb-4">
            <div>
              <Label className="font-semibold">{metric.label}</Label>
              <p className="text-xs text-muted-foreground">Current Value: {currentVal}{metric.isPercentage ? '%' : ''}</p>
            </div>
            <RadioGroup
              value={metricImpact.type}
              onValueChange={handleTypeChange}
              className="flex gap-4"
            >
              <Label htmlFor={`${metric.name}-percentage`} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-muted/50">
                <RadioGroupItem value="percentage" id={`${metric.name}-percentage`} />
                <span>% Change</span>
              </Label>
              <Label htmlFor={`${metric.name}-absolute`} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-muted/50">
                <RadioGroupItem value="absolute" id={`${metric.name}-absolute`} />
                <span>Absolute</span>
              </Label>
            </RadioGroup>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor={`${metric.name}-pessimistic`} className="text-xs text-muted-foreground">Pessimistic</Label>
            <div className="relative">
              <Input id={`${metric.name}-pessimistic`} type="number" placeholder={getPlaceholder('pessimistic')}
                value={metricImpact.value?.pessimistic ?? ''}
                onChange={e => handleImpactChange('pessimistic', e.target.value)}
                onFocus={() => handleFocus('pessimistic')}
                onBlur={handleBlur}
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
                onChange={e => handleImpactChange('realistic', e.target.value)}
                onFocus={() => handleFocus('realistic')}
                onBlur={handleBlur}
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
                onChange={e => handleImpactChange('optimistic', e.target.value)}
                onFocus={() => handleFocus('optimistic')}
                onBlur={handleBlur}
                className="pr-8"
              />
               <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">{getSuffix()}</span>
            </div>
          </div>
        </div>
      </div>
    );
});
ImpactInput.displayName = "ImpactInput";


const Step3 = ({ selectedMetrics, impact, setImpact, currency, currentInputs }: any) => {
    return (
        <div className="space-y-4 px-1">
          {impactableMetrics
            .filter(m => selectedMetrics[m.name])
            .map(metric => (
              <ImpactInput 
                key={metric.name} 
                metric={metric} 
                impact={impact[metric.name]} 
                setImpact={setImpact} 
                currency={currency}
                currentInputs={currentInputs}
              />
            ))}
        </div>
      );
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
      const scenarioSelectedMetrics = impactableMetrics.reduce((acc, m) => ({ ...acc, [m.name]: false }), {} as Record<keyof Inputs, boolean>);
      for (const key in scenario.impact) {
        scenarioSelectedMetrics[key as keyof Inputs] = true;
      }
      setSelectedMetrics(scenarioSelectedMetrics);
      setErrors({});
    } else if (!open) {
      resetState();
    }
  }, [open, scenario]);


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
    // Prune unselected metrics from final impact object
    const finalImpact: Partial<Record<keyof Inputs, Impact>> = {};
    for (const key in impact) {
        const metricKey = key as keyof Inputs;
        if(selectedMetrics[metricKey]) {
            finalImpact[metricKey] = impact[metricKey];
        }
    }

    const newScenario = { name, description, cost, impact: finalImpact };
    onSaveScenario(newScenario, scenario?.id);
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 {...{ name, setName, description, setDescription, cost, setCost, currency, errors }} />;
      case 2: return <Step2 {...{ selectedMetrics, setSelectedMetrics, errors }} />;
      case 3: return <Step3 {...{ selectedMetrics, impact, setImpact, currency, currentInputs }} />;
      default: return null;
    }
  };
  
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
