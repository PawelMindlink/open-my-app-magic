
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Currency } from "@/lib/types";

type ChartData = {
    name: string;
    Baseline: number;
    Scenario: number;
}

type ProjectionsChartProps = {
    base: any;
    scenarios: any;
    currency: Currency;
}

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
};


export const ProjectionsChart = ({ base, scenarios, currency }: ProjectionsChartProps) => {

    const chartData: ChartData[] = [
        { name: "Mkt. Profit", Baseline: base.marketingProfit, Scenario: scenarios.marketingProfit },
        { name: "Gross Profit", Baseline: base.totalGrossProfit, Scenario: scenarios.totalGrossProfit },
        { name: "Mkt. Cost", Baseline: base.totalMarketingCost, Scenario: scenarios.totalMarketingCost },
    ];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency, notation: 'compact', compactDisplay: 'short' }).format(value);

    const renderCustomizedLabel = (props: any) => {
      const { x, y, width, height, value } = props;
      
      if (height < 10) return null;

      return (
        <text x={x + width / 2} y={y} dy={-4} fill="hsl(var(--foreground))" fontSize={10} textAnchor="middle">
          {formatCurrency(value)}
        </text>
      );
    };


    return (
        <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCurrency} />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: 'var(--radius)' 
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend iconSize={12} wrapperStyle={{fontSize: "14px"}}/>
                    <Bar dataKey="Baseline" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="Baseline" content={renderCustomizedLabel} />
                    </Bar>
                    <Bar dataKey="Scenario" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="Scenario" content={renderCustomizedLabel} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
