
import { ProfitCalculator } from "@/components/profit-calculator";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12 flex flex-col items-center">
        <Logo className="w-64 h-auto" />
        <p className="mt-4 text-lg sm:text-xl text-white max-w-3xl mx-auto">
          Analyze marketing spend and forecast profitability.
        </p>
      </div>
      <ProfitCalculator />
    </main>
  );
}
