import { useFinance } from "@/data/FinanceContext";

export default function StatsCard() {
  const { transactions } = useFinance();

  const totalRevenus = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDépenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const épargne = totalRevenus - totalDépenses;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded-lg">
        <h2 className="text-lg font-semibold">Income</h2>
        <p className="text-2xl font-bold">{totalRevenus} €</p>
      </div>
      <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-lg">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <p className="text-2xl font-bold">{totalDépenses} €</p>
      </div>
      <div className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg">
        <h2 className="text-lg font-semibold">Savings</h2>
        <p className="text-2xl font-bold">{épargne} €</p>
      </div>
    </div>
  );
}
