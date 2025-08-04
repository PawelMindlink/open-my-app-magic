
export type Currency = "USD" | "EUR" | "PLN";

export type EstimateLevel = 'pessimistic' | 'realistic' | 'optimistic';

export type Impact = {
  [key in EstimateLevel]?: number;
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
  // General
  organicSessions: number;
  crFirstPurchase: number; // Conversion rate for first-time purchases from organic
  aovFirstPurchase: number; // Average order value
  gmFirstPurchase: number; // Gross margin for first-time purchases
  crRepeatPurchase: number; // Conversion rate for repeat purchases
  aovRepeatPurchase: number; // Average order value for repeat purchases
  gmRepeatPurchase: number; // Gross margin for repeat purchases
  marketingOpexFixed: number;
};

type InputField = {
    name: keyof Inputs;
    label: string;
    group: 'meta-prospecting' | 'meta-remarketing' | 'google-prospecting' | 'google-remarketing' | 'general-organic' | 'general-first-purchase' | 'general-repeat-purchase' | 'general-opex';
    isCurrency?: boolean;
    isPercentage?: boolean;
}

export const inputFields: InputField[] = [
    // Meta Prospecting
    { name: 'metaProspectingBudget', label: 'Budget', group: 'meta-prospecting', isCurrency: true },
    { name: 'metaProspectingCpc', label: 'CPC', group: 'meta-prospecting', isCurrency: true },
    { name: 'metaProspectingBounceRate', label: 'Bounce Rate', group: 'meta-prospecting', isPercentage: true },
    { name: 'metaProspectingConversionRate', label: 'Conversion Rate', group: 'meta-prospecting', isPercentage: true },
    // Meta Remarketing
    { name: 'metaRemarketingBudget', label: 'Budget', group: 'meta-remarketing', isCurrency: true },
    { name: 'metaRemarketingCpc', label: 'CPC', group: 'meta-remarketing', isCurrency: true },
    { name: 'metaRemarketingBounceRate', label: 'Bounce Rate', group: 'meta-remarketing', isPercentage: true },
    { name: 'metaRemarketingConversionRate', label: 'Conversion Rate', group: 'meta-remarketing', isPercentage: true },
    // Google Prospecting
    { name: 'googleProspectingBudget', label: 'Budget', group: 'google-prospecting', isCurrency: true },
    { name: 'googleProspectingCpc', label: 'CPC', group: 'google-prospecting', isCurrency: true },
    { name: 'googleProspectingBounceRate', label: 'Bounce Rate', group: 'google-prospecting', isPercentage: true },
    { name: 'googleProspectingConversionRate', label: 'Conversion Rate', group: 'google-prospecting', isPercentage: true },
    // Google Remarketing
    { name: 'googleRemarketingBudget', label: 'Budget', group: 'google-remarketing', isCurrency: true },
    { name: 'googleRemarketingCpc', label: 'CPC', group: 'google-remarketing', isCurrency: true },
    { name: 'googleRemarketingBounceRate', label: 'Bounce Rate', group: 'google-remarketing', isPercentage: true },
    { name: 'googleRemarketingConversionRate', label: 'Conversion Rate', group: 'google-remarketing', isPercentage: true },
    // General
    { name: 'organicSessions', label: 'Organic Sessions', group: 'general-organic' },
    
    { name: 'aovFirstPurchase', label: 'AOV (First Purchase)', group: 'general-first-purchase', isCurrency: true },
    { name: 'gmFirstPurchase', label: 'Gross Margin (First Purchase)', group: 'general-first-purchase', isPercentage: true },
    { name: 'crFirstPurchase', label: 'Organic First Purchase CR', group: 'general-first-purchase', isPercentage: true },
    
    { name: 'aovRepeatPurchase', label: 'AOV (Repeat Purchase)', group: 'general-repeat-purchase', isCurrency: true },
    { name: 'gmRepeatPurchase', label: 'Gross Margin (Repeat Purchase)', group: 'general-repeat-purchase', isPercentage: true },
    { name: 'crRepeatPurchase', label: 'Repeat Purchase CR', group: 'general-repeat-purchase', isPercentage: true },

    { name: 'marketingOpexFixed', label: 'Fixed Marketing OPEX', group: 'general-opex', isCurrency: true },
];
