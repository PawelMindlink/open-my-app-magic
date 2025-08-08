
"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, LogOut, Download } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { getGa4Sessions, Ga4SessionsOutput } from '@/ai/flows/ga4-sessions-flow';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/auth/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DateRangePicker } from './date-range-picker';
import { cn } from '@/lib/utils';

type GA4ImportDialogProps = {
  onImport: (sessions: Ga4SessionsOutput) => void;
};

export function GA4ImportDialog({ onImport }: GA4ImportDialogProps) {
  const [propertyId, setPropertyId] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading, signIn, signOut, getToken } = useAuth();

  const handleImport = async () => {
    if (!propertyId || !dateRange?.from || !dateRange?.to) {
      setError("Property ID and a full date range are required.");
      return;
    }
    if (!user) {
        setError("Please sign in to import data from Google Analytics.");
        return;
    }
    
    setIsImporting(true);
    setError(null);

    try {
      const idToken = await getToken();
      if (!idToken) {
        throw new Error("Could not retrieve authentication token.");
      }
      
      const result = await getGa4Sessions({
        propertyId,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        idToken,
      });

      onImport(result);
      const totalSessions = result.meta + result.google + result.other;
      toast({
        title: "Import Successful",
        description: `Successfully imported ${totalSessions.toLocaleString()} total sessions.`,
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unknown error occurred.");
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: e.message || "Could not fetch data from Google Analytics.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderAuthSection = () => {
    if (authLoading) {
      return <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }
    if (user) {
      return (
        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5"/>
          </Button>
        </div>
      )
    }
    return (
      <Button onClick={signIn} className="w-full" disabled={authLoading}>
        <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
      </Button>
    )
  }

  return (
    <Card className="bg-muted/30">
        <CardHeader>
            <CardTitle className="font-headline text-xl">GA4 Import</CardTitle>
            <CardDescription>
                Sign in to your Google Account to pull session data directly from Google Analytics. Your domain must be authorized in Firebase.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {renderAuthSection()}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-1 space-y-2">
                     <Label htmlFor="ga4-property-id" className={cn(!user && "text-muted-foreground/50")}>GA4 Property ID</Label>
                     <Input
                         id="ga4-property-id"
                         placeholder="e.g., 123456789"
                         value={propertyId}
                         onChange={(e) => setPropertyId(e.target.value)}
                         disabled={isImporting || !user || authLoading}
                     />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                      <Label className={cn(!user && "text-muted-foreground/50")}>Date Range</Label>
                      <DateRangePicker 
                         dateRange={dateRange}
                         onDateRangeChange={(range) => setDateRange(range)}
                         disabled={isImporting || !user || authLoading}
                      />
                 </div>
             </div>
         
             {error && (
                 <Alert variant="destructive">
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
                 </Alert>
             )}

             <Button
                 type="button"
                 onClick={handleImport}
                 disabled={isImporting || !propertyId || !dateRange?.from || !dateRange?.to || !user || authLoading}
                 className="w-full"
             >
                 {isImporting ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                     <Download className="mr-2 h-4 w-4" />
                 )}
                 Import Data
             </Button>
        </CardContent>
    </Card>
  );
}
