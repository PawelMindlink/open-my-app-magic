
'use server';
/**
 * @fileOverview A flow for fetching and categorizing session data from Google Analytics 4.
 *
 * - getGa4Sessions - A function that fetches session data from the GA4 Data API.
 * - Ga4SessionsInput - The input type for the getGa4Sessions function.
 * - Ga4SessionsOutput - The return type for the getGa4Sessions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const Ga4SessionsInputSchema = z.object({
  propertyId: z.string().describe('The GA4 Property ID, e.g., "123456789"'),
  startDate: z.string().describe('The start date in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date in YYYY-MM-DD format.'),
  idToken: z.string().describe("The user's Firebase Authentication ID token."),
});
export type Ga4SessionsInput = z.infer<typeof Ga4SessionsInputSchema>;

const Ga4SessionsOutputSchema = z.object({
  meta: z.number().describe('Total sessions attributed to Meta (Facebook, Instagram).'),
  google: z.number().describe('Total sessions attributed to Google Ads.'),
  other: z.number().describe('Total sessions from other sources (organic, direct, etc.).'),
});
export type Ga4SessionsOutput = z.infer<typeof Ga4SessionsOutputSchema>;


const getGa4SessionsFlow = ai.defineFlow(
  {
    name: 'getGa4SessionsFlow',
    inputSchema: Ga4SessionsInputSchema,
    outputSchema: Ga4SessionsOutputSchema,
  },
  async ({ propertyId, startDate, endDate, idToken }) => {
    
    // In a real application, you would verify the ID token and exchange it
    // for an OAuth 2.0 access token with the necessary scopes.
    // For this example, we are showing how to pass an auth token.
    if (!idToken) {
        throw new Error("Authentication is required.");
    }
    
    try {
        const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // This is NOT a valid use of an ID token for auth.
                // A production app must exchange the ID token for an OAuth access token
                // via a secure server-side process. This is a temporary shortcut.
                'Authorization': `Bearer ${idToken}`, 
            },
            body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }, { name: 'sessionCampaignName' }],
                metrics: [{ name: 'sessions' }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('GA4 API Error Response:', data);
            const errorDetails = data.error || {};
             if (errorDetails.code === 403 || errorDetails.code === 401) {
                throw new Error("Permission denied. Ensure the authenticated user has 'Viewer' access to the GA4 property, or your token may have expired. This can also happen if the Google Sign-in is not configured correctly.");
            }
            if (errorDetails.code === 400) {
                throw new Error(`Invalid request. Check if the Property ID '${propertyId}' is correct.`);
            }
            throw new Error(errorDetails.message || 'Failed to fetch data from Google Analytics.');
        }
      
      const rows = data.rows || [];
      const categorizedSessions = {
          meta: 0,
          google: 0,
          other: 0,
      };

      rows.forEach((row: any) => {
          const source = (row.dimensionValues[0]?.value || '').toLowerCase();
          const medium = (row.dimensionValues[1]?.value || '').toLowerCase();
          const sessions = parseInt(row.metricValues[0]?.value || '0', 10);
          
          if (source.includes('facebook') || source.includes('instagram') || medium.includes('cpc') && (source.includes('fb') || source.includes('ig'))) {
              categorizedSessions.meta += sessions;
          } else if (medium === 'cpc' && source === 'google') {
              categorizedSessions.google += sessions;
          } else {
              categorizedSessions.other += sessions;
          }
      });
      
      return categorizedSessions;

    } catch (error: any) {
        console.error('GA4 API Error:', error.message);
        console.error(error);
        throw new Error(error.message || 'Failed to fetch data from Google Analytics. Please check your configuration and permissions.');
    }
  }
);


export async function getGa4Sessions(input: Ga4SessionsInput): Promise<Ga4SessionsOutput> {
  return getGa4SessionsFlow(input);
}
