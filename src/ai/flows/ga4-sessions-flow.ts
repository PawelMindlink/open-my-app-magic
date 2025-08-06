
'use server';
/**
 * @fileOverview A flow for fetching session data from Google Analytics 4.
 *
 * - getGa4Sessions - A function that fetches session data from the GA4 Data API.
 * - Ga4SessionsInput - The input type for the getGa4Sessions function.
 * - Ga4SessionsOutput - The return type for the getGa4Sessions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { run } from 'genkit';

const Ga4SessionsInputSchema = z.object({
  propertyId: z.string().describe('The GA4 Property ID, e.g., "123456789"'),
  startDate: z.string().describe('The start date in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date in YYYY-MM-DD format.'),
  idToken: z.string().describe("The user's Firebase Authentication ID token."),
});
export type Ga4SessionsInput = z.infer<typeof Ga4SessionsInputSchema>;

const Ga4SessionsOutputSchema = z.object({
  totalSessions: z.number().describe('The total number of sessions for the date range.'),
});
export type Ga4SessionsOutput = z.infer<typeof Ga4SessionsOutputSchema>;


const getGa4SessionsFlow = ai.defineFlow(
  {
    name: 'getGa4SessionsFlow',
    inputSchema: Ga4SessionsInputSchema,
    outputSchema: Ga4SessionsOutputSchema,
  },
  async ({ propertyId, startDate, endDate, idToken }) => {
    
    // In a real application, you would verify the ID token here.
    // For this example, we will trust the token and use it directly.
    // Note: This is NOT a secure practice for production.
    if (!idToken) {
        throw new Error("Authentication is required.");
    }
    
    try {
        const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // The Bearer token should be the user's OAuth access token, not the ID token.
                // However, for this simplified example, we are showing how to pass an auth token.
                // A production implementation would require exchanging the ID token for an access token.
                'Authorization': `Bearer ${idToken}`, 
            },
            body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [{ name: 'sessions' }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('GA4 API Error Response:', data);
            const errorDetails = data.error || {};
             if (errorDetails.code === 403 || errorDetails.code === 401) {
                throw new Error("Permission denied. Ensure the authenticated user has 'Viewer' access to the GA4 property, or your token may have expired.");
            }
            if (errorDetails.code === 400) {
                throw new Error(`Invalid request. Check if the Property ID '${propertyId}' is correct.`);
            }
            throw new Error(errorDetails.message || 'Failed to fetch data from Google Analytics.');
        }
      
      const rows = data.rows || [];
      if (rows.length > 0 && rows[0].metricValues && rows[0].metricValues.length > 0) {
        const totalSessions = parseInt(rows[0].metricValues[0].value || '0', 10);
        return { totalSessions };
      }

      return { totalSessions: 0 };
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
