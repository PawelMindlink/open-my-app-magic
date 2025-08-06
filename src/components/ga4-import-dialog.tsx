
"use client";

import React, { useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, LogIn, LogOut } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { getGa4Sessions } from '@/ai/flows/ga4-sessions-flow';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/auth/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type GA4ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (sessions: number) => void;
};

export function GA4ImportDialog({ open, onOpenChange, onImport }: GA4ImportDialogProps) {
  const [propertyId, setPropertyId] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
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
    
    setIsLoading(true);
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

      onImport(result.totalSessions);
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.totalSessions.toLocaleString()} sessions.`,
      });
      onOpenChange(false); // Close dialog on success
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unknown error occurred.");
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: e.message || "Could not fetch data from Google Analytics.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthSection = () => {
    if (authLoading) {
      return <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }
    if (user) {
      return (
        <div className="flex items-center justify-between rounded-lg border p-3">
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
      <Button onClick={signIn} className="w-full">
        <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Sessions from GA4</DialogTitle>
          <DialogDescription>
            Sign in with your Google account to import data from Google Analytics 4.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderAuthSection()}
        
          {user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ga4-property-id">GA4 Property ID</Label>
                <Input
                  id="ga4-property-id"
                  placeholder="e.g., 123456789"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

           {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={isLoading || !propertyId || !dateRange?.from || !dateRange?.to || !user}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
