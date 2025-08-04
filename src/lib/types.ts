
export type Currency = "USD" | "EUR" | "PLN";

export type EstimateLevel = 'pessimistic' | 'realistic' | 'optimistic';

export type ImpactType = 'percentage' | 'absolute';

export type ImpactValue = {
  pessimistic?: number;
  realistic?: number;
  optimistic?: number;
};

export type Impact = {
  type: ImpactType;
  value: ImpactValue;
};


export type Inputs = {
  // Meta Ads - Prospecting
  metaProspectingBudget: number;
  metaProspectingCpc: number;
  metaProspectingBounceRate: number;
  metaProspectingConversionRate: number;
  // Meta Ads - Remarketing
  metaRemarketingBudget: number;
  metaRemarketingCpc: number;
  metaRemarketingBounceRate: number;
  metaRemarketingConversionRate: number;
  // Google Ads - Prospecting
  googleProspectingBudget: number;
  googleProspectingCpc: number;
  googleProspectingBounceRate: number;
  googleProspectingConversionRate: number;
  // Google Ads - Remarketing
  googleRemarketingBudget: number;
  googleRemarketingCpc: number;
  googleRemarketingBounceRate: number;
  googleRemarketingConversionRate: number;
  // Organic
  organicSessions: number;
  crFirstPurchase: number; // Conversion rate for first-time purchases from organic
  // First Purchase
  aovFirstPurchase: number; // Average order value
  gmFirstPurchase: number; // Gross margin for first-time purchases
  // Repeat Purchase
  crRepeatPurchase: number; // Conversion rate for repeat purchases
  aovRepeatPurchase: number; // Average order value for repeat purchases
  gmRepeatPurchase: number; // Gross margin for repeat purchases
  // OPEX
  marketingOpexFixed: number;
};

export type InputField = {
    name: keyof Inputs;
    label: string;
    group: 'meta' | 'google' | 'organic' | 'first-purchase' | 'repeat-purchase' | 'opex';
    subGroup?: 'prospecting' | 'remarketing';
    isCurrency?: boolean;
    isPercentage?: boolean;
}

export const inputFields: InputField[] = [
    // Meta Prospecting
    { name: 'metaProspectingBudget', label: 'Budget', group: 'meta', subGroup: 'prospecting', isCurrency: true },
    { name: 'metaProspectingCpc', label: 'CPC', group: 'meta', subGroup: 'prospecting', isCurrency: true },
    { name: 'metaProspectingBounceRate', label: 'Bounce Rate', group: 'meta', subGroup: 'prospecting', isPercentage: true },
    { name: 'metaProspectingConversionRate', label: 'Conversion Rate', group: 'meta', subGroup: 'prospecting', isPercentage: true },
    // Meta Remarketing
    { name: 'metaRemarketingBudget', label: 'Budget', group: 'meta', subGroup: 'remarketing', isCurrency: true },
    { name: 'metaRemarketingCpc', label: 'CPC', group: 'meta', subGroup: 'remarketing', isCurrency: true },
    { name: 'metaRemarketingBounceRate', label: 'Bounce Rate', group: 'meta', subGroup: 'remarketing', isPercentage: true },
    { name: 'metaRemarketingConversionRate', label: 'Conversion Rate', group: 'meta', subGroup: 'remarketing', isPercentage: true },
    // Google Prospecting
    { name: 'googleProspectingBudget', label: 'Budget', group: 'google', subGroup: 'prospecting', isCurrency: true },
    { name: 'googleProspectingCpc', label: 'CPC', group: 'google', subGroup: 'prospecting', isCurrency: true },
    { name: 'googleProspectingBounceRate', label: 'Bounce Rate', group: 'google', subGroup: 'prospecting', isPercentage: true },
    { name: 'googleProspectingConversionRate', label: 'Conversion Rate', group: 'google', subGroup: 'prospecting', isPercentage: true },
    // Google Remarketing
    { name: 'googleRemarketingBudget', label: 'Budget', group: 'google', subGroup: 'remarketing', isCurrency: true },
    { name: 'googleRemarketingCpc', label: 'CPC', group: 'google', subGroup: 'remarketing', isCurrency: true },
    { name: 'googleRemarketingBounceRate', label: 'Bounce Rate', group: 'google', subGroup: 'remarketing', isPercentage: true },
    { name: 'googleRemarketingConversionRate', label: 'Conversion Rate', group: 'google', subGroup: 'remarketing', isPercentage: true },
    
    // Organic
    { name: 'organicSessions', label: 'Organic Sessions', group: 'organic' },
    { name: 'crFirstPurchase', label: 'Organic First Purchase CR', group: 'organic', isPercentage: true },
    
    // First Purchase
    { name: 'aovFirstPurchase', label: 'AOV (First Purchase)', group: 'first-purchase', isCurrency: true },
    { name: 'gmFirstPurchase', label: 'Gross Margin (First Purchase)', group: 'first-purchase', isPercentage: true },
    
    // Repeat Purchase
    { name: 'aovRepeatPurchase', label: 'AOV (Repeat Purchase)', group: 'repeat-purchase', isCurrency: true },
    { name: 'gmRepeatPurchase', label: 'Gross Margin (Repeat Purchase)', group: 'repeat-purchase', isPercentage: true },
    { name: 'crRepeatPurchase', label: 'Repeat Purchase CR', group: 'repeat-purchase', isPercentage: true },

    // OPEX
    { name: 'marketingOpexFixed', label: 'Fixed Marketing OPEX', group: 'opex', isCurrency: true },
];

export const impactableMetrics: InputField[] = [
    // Meta Prospecting
    { name: 'metaProspectingCpc', label: 'Meta Prospecting CPC', group: 'meta', subGroup: 'prospecting', isCurrency: true },
    { name: 'metaProspectingBounceRate', label: 'Meta Prospecting Bounce Rate', group: 'meta', subGroup: 'prospecting', isPercentage: true },
    { name: 'metaProspectingConversionRate', label: 'Meta Prospecting Conversion Rate', group: 'meta', subGroup: 'prospecting', isPercentage: true },
    // Meta Remarketing
    { name: 'metaRemarketingCpc', label: 'Meta Remarketing CPC', group: 'meta', subGroup: 'remarketing', isCurrency: true },
    { name: 'metaRemarketingBounceRate', label: 'Meta Remarketing Bounce Rate', group: 'meta', subGroup: 'remarketing', isPercentage: true },
    { name: 'metaRemarketingConversionRate', label: 'Meta Remarketing Conversion Rate', group: 'meta', subGroup: 'remarketing', isPercentage: true },
    // Google Prospecting
    { name: 'googleProspectingCpc', label: 'Google Prospecting CPC', group: 'google', subGroup: 'prospecting', isCurrency: true },
    { name: 'googleProspectingBounceRate', label: 'Google Prospecting Bounce Rate', group: 'google', subGroup: 'prospecting', isPercentage: true },
    { name: 'googleProspectingConversionRate', label: 'Google Prospecting Conversion Rate', group: 'google', subGroup: 'prospecting', isPercentage: true },
    // Google Remarketing
    { name: 'googleRemarketingCpc', label: 'Google Remarketing CPC', group: 'google', subGroup: 'remarketing', isCurrency: true },
    { name: 'googleRemarketingBounceRate', label: 'Google Remarketing Bounce Rate', group: 'google', subGroup: 'remarketing', isPercentage: true },
    { name: 'googleRemarketingConversionRate', label: 'Google Remarketing Conversion Rate', group: 'google', subGroup: 'remarketing', isPercentage: true },
    // Organic
    { name: 'organicSessions', label: 'Organic Sessions', group: 'organic' },
    { name: 'crFirstPurchase', label: 'Organic First Purchase CR', group: 'organic', isPercentage: true },
    // First Purchase
    { name: 'aovFirstPurchase', label: 'AOV (First Purchase)', group: 'first-purchase', isCurrency: true },
    { name: 'gmFirstPurchase', label: 'Gross Margin (First Purchase)', group: 'first-purchase', isPercentage: true },
    // Repeat Purchase
    { name: 'crRepeatPurchase', label: 'Repeat Purchase CR', group: 'repeat-purchase', isPercentage: true },
    { name: 'aovRepeatPurchase', label: 'AOV (Repeat Purchase)', group: 'repeat-purchase', isCurrency: true },
    { name: 'gmRepeatPurchase', label: 'Gross Margin (Repeat Purchase)', group: 'repeat-purchase', isPercentage: true },
].filter(field => 
    !field.name.toLowerCase().includes('budget') && 
    field.name !== 'marketingOpexFixed'
);
