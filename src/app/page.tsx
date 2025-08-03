import { ProfitCalculator } from "@/components/profit-calculator";

export default function Home() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
          ProfitPilot
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Analyze your marketing spend and forecast profitability. Adjust inputs and activate "what-if" scenarios to see how different strategies impact your bottom line.
        </p>
      </div>
      <ProfitCalculator />
    </main>
  );
}
