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
import { run } from 'genkit/flow';

const Ga4SessionsInputSchema = z.object({
  propertyId: z.string().describe('The GA4 Property ID, e.g., "123456789"'),
  startDate: z.string().describe('The start date in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date in YYYY-MM-DD format.'),
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
  async ({ propertyId, startDate, endDate }, context) => {

    if (!context?.authenticated) {
        throw new Error("Authentication is required to access Google Analytics data.");
    }
    
    // Use the authenticated fetch provided by Genkit context
    const fetch = context.auth?.fetch;
    if (!fetch) {
        throw new Error("Could not get an authenticated fetch instance.");
    }

    try {
        const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
             if (errorDetails.code === 403) {
                throw new Error("Permission denied. Ensure the service account has 'Viewer' access to the GA4 property.");
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
        // It's helpful to log the full error for debugging in the server logs
        console.error(error);
        throw new Error(error.message || 'Failed to fetch data from Google Analytics. Please check your configuration and permissions.');
    }
  }
);


export async function getGa4Sessions(input: Ga4SessionsInput): Promise<Ga4SessionsOutput> {
  // To call a flow from a server component, we need to wrap it in `run`
  // and provide a placeholder for the auth object. The actual authentication
  // will be handled by the Genkit plugin based on the environment.
  return run(getGa4SessionsFlow, input, { auth: {} });
}