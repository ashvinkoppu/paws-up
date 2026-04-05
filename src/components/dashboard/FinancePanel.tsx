/**
 * @file FinancePanel.tsx
 *
 * Cost of Care Report - an FBLA-ready financial report inside the Manage area.
 *
 * Features:
 * - Summary cards: balance, weekly budget, spending, net, top category
 * - Customization controls: time range (This Week / All Time), type filter, sort order
 * - Spending breakdown by category with percentage bars
 * - Filterable, sortable transaction list with date, description, category, type, amount
 * - Plain-language insights based on currently filtered data
 * - Strong empty states when data is sparse
 */
import React, { useState, useMemo, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UtensilsCrossed,
  Gamepad2,
  Sparkles,
  HeartPulse,
  Zap,
  Package,
  CircleDollarSign,
  Receipt,
  Lightbulb,
  BarChart3,
  PawPrint,
  AlertTriangle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = "week" | "all";
type TransactionFilter = "all" | "expense" | "income";
type SortOrder = "newest" | "amount";

// ─── Constants ────────────────────────────────────────────────────────────────

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hunger: <UtensilsCrossed className="w-4 h-4" />,
  happiness: <Gamepad2 className="w-4 h-4" />,
  cleanliness: <Sparkles className="w-4 h-4" />,
  health: <HeartPulse className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  earnings: <DollarSign className="w-4 h-4" />,
  other: <Package className="w-4 h-4" />,
};

const CATEGORY_BAR_COLORS: Record<string, string> = {
  hunger: "bg-orange-500",
  happiness: "bg-yellow-500",
  cleanliness: "bg-sky-500",
  health: "bg-rose-500",
  energy: "bg-violet-500",
  earnings: "bg-emerald-500",
  other: "bg-slate-400",
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  sub: string;
  urgent?: boolean;
  urgentSub?: string;
  positive?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  sub,
  urgent = false,
  urgentSub,
  positive = false,
}) => (
  <div
    className={cn(
      "relative overflow-hidden bg-background border rounded-xl p-4",
      urgent ? "border-rose-300 dark:border-rose-800" : "border-border",
    )}
  >
    {/* Status accent stripe at top */}
    <div
      className={cn(
        "absolute inset-x-0 top-0 h-0.5",
        urgent
          ? "bg-rose-400"
          : positive
            ? "bg-emerald-400"
            : "bg-primary/25",
      )}
    />
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
      {label}
    </p>
    <p
      className={cn(
        "font-mono font-bold text-xl leading-none",
        urgent
          ? "text-rose-600 dark:text-rose-400"
          : positive
            ? "text-secondary"
            : "text-foreground",
      )}
    >
      {value}
    </p>
    <p
      className={cn(
        "text-xs mt-1.5 leading-tight",
        urgent && urgentSub ? "text-rose-500" : "text-muted-foreground",
      )}
    >
      {urgent && urgentSub ? (
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {urgentSub}
        </span>
      ) : (
        sub
      )}
    </p>
  </div>
);

// ─── Filter Button Group ──────────────────────────────────────────────────────

interface FilterGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex rounded-lg overflow-hidden border border-border">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-accent",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FinancePanel: React.FC = () => {
  const { state } = useGame();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Transactions filtered by selected time range
  const timeFilteredTransactions = useMemo(() => {
    if (timeRange === "week") {
      const cutoff = Date.now() - ONE_WEEK_MS;
      return state.transactions.filter(
        (transaction) => transaction.timestamp >= cutoff,
      );
    }
    return state.transactions;
  }, [state.transactions, timeRange]);

  // Further filtered by type, then sorted
  const displayTransactions = useMemo(() => {
    const typed =
      transactionFilter === "all"
        ? timeFilteredTransactions
        : timeFilteredTransactions.filter(
            (transaction) => transaction.type === transactionFilter,
          );
    return [...typed].sort((a, b) =>
      sortOrder === "newest" ? b.timestamp - a.timestamp : b.amount - a.amount,
    );
  }, [timeFilteredTransactions, transactionFilter, sortOrder]);

  // Aggregate totals for the selected time range
  const { totalIncome, totalExpenses, netAmount, spendingByCategory } =
    useMemo(() => {
      let income = 0;
      let expenses = 0;
      const byCategory: Record<string, number> = {};
      for (const transaction of timeFilteredTransactions) {
        if (transaction.type === "income") {
          income += transaction.amount;
        } else {
          expenses += transaction.amount;
          byCategory[transaction.category] =
            (byCategory[transaction.category] || 0) + transaction.amount;
        }
      }
      return {
        totalIncome: income,
        totalExpenses: expenses,
        netAmount: income - expenses,
        spendingByCategory: byCategory,
      };
    }, [timeFilteredTransactions]);

  const sortedCategories = useMemo(
    () => Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1]),
    [spendingByCategory],
  );

  const topCategory = sortedCategories[0] ?? null;

  // Weekly budget metrics always come from game-engine state for accuracy
  const budgetUsedPercent =
    state.weeklyBudget > 0 ? (state.weeklySpent / state.weeklyBudget) * 100 : 0;
  const isOverBudget = state.weeklySpent > state.weeklyBudget;
  const remainingBudget = state.weeklyBudget - state.weeklySpent;

  // Plain-language insights (up to 2)
  const insights = useMemo(() => {
    const list: string[] = [];

    // Budget health
    if (isOverBudget) {
      list.push(
        `Over budget by $${Math.abs(remainingBudget).toFixed(2)} this week. Pause non-essential purchases.`,
      );
    } else if (budgetUsedPercent >= 80) {
      list.push(
        `You have used ${budgetUsedPercent.toFixed(0)}% of your weekly budget; compare categories before spending more.`,
      );
    } else if (budgetUsedPercent > 0) {
      list.push(
        `You have used ${budgetUsedPercent.toFixed(0)}% of your weekly budget.`,
      );
    }

    // Top category
    if (topCategory) {
      const [category, amount] = topCategory;
      const period = timeRange === "week" ? "this week" : "overall";
      list.push(
        `Most spending is on ${category} ${period} ($${amount.toFixed(2)}).`,
      );
    }

    // Net cashflow (fills a slot if budget insight was skipped)
    if (list.length < 2 && totalIncome > 0 && totalExpenses > 0) {
      if (netAmount > 0) {
        list.push(
          `You are net positive by $${netAmount.toFixed(2)}; income is covering costs.`,
        );
      } else if (netAmount < 0) {
        list.push(
          `You are spending $${Math.abs(netAmount).toFixed(2)} more than you earn.`,
        );
      }
    }

    if (list.length === 0) {
      list.push(
        "Interact with your pet to generate spending data and personalized insights.",
      );
    }

    return list.slice(0, 2);
  }, [
    isOverBudget,
    remainingBudget,
    budgetUsedPercent,
    topCategory,
    timeRange,
    totalIncome,
    totalExpenses,
    netAmount,
  ]);

  const periodLabel = timeRange === "week" ? "This Week" : "All Time";

  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadPdf = useCallback(async () => {
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const element = document.getElementById("finance-report-print");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let y = 0;
    while (y < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
      y += pageHeight;
      if (y < imgHeight) pdf.addPage();
    }
    pdf.save(`cost-of-care-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, []);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div id="finance-report-print" className="space-y-5">
      {/* ── Report Header + Budget Snapshot ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm break-inside-avoid">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-0.5">
                Financial Report
              </p>
              <h3 className="font-serif text-xl font-bold text-foreground">
                Cost of Care Report
              </h3>
              {state.pet && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {state.pet.name} &middot;{" "}
                  {state.pet.species.charAt(0).toUpperCase() +
                    state.pet.species.slice(1)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Generated {printDate}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <button
                onClick={downloadPdf}
                className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-accent border border-border rounded-full text-xs font-semibold text-foreground hover:bg-accent/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                <PawPrint className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Live</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">
            Budget Snapshot
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="Balance"
              value={`$${state.money.toFixed(2)}`}
              sub="Available funds"
              urgent={state.money < 20}
              urgentSub="Low funds"
            />
            <SummaryCard
              label="Weekly Budget"
              value={`$${state.weeklyBudget.toFixed(2)}`}
              sub="Spending limit"
            />
            <SummaryCard
              label="Weekly Spent"
              value={`$${state.weeklySpent.toFixed(2)}`}
              sub={`${budgetUsedPercent.toFixed(0)}% used`}
              urgent={isOverBudget}
            />
            <SummaryCard
              label={isOverBudget ? "Over Budget" : "Budget Left"}
              value={`$${Math.abs(remainingBudget).toFixed(2)}`}
              sub={isOverBudget ? "Reduce spending" : "Remaining this week"}
              urgent={isOverBudget}
              urgentSub="Over budget"
              positive={!isOverBudget}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Period Analysis Cards ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm break-inside-avoid">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-base">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-serif">Period Analysis</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {periodLabel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="Total Income"
              value={`$${totalIncome.toFixed(2)}`}
              sub="Earned this period"
              positive={totalIncome > 0}
            />
            <SummaryCard
              label="Total Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              sub="Spent this period"
            />
            <SummaryCard
              label="Net Amount"
              value={`${netAmount >= 0 ? "+" : ""}$${Math.abs(netAmount).toFixed(2)}`}
              sub={netAmount >= 0 ? "Positive cashflow" : "More out than in"}
              positive={netAmount > 0}
              urgent={netAmount < 0 && totalExpenses > 0}
            />
            <SummaryCard
              label="Top Category"
              value={
                topCategory
                  ? topCategory[0].charAt(0).toUpperCase() +
                    topCategory[0].slice(1)
                  : "-"
              }
              sub={
                topCategory
                  ? `$${topCategory[1].toFixed(2)} spent`
                  : "No expenses yet"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Customization Controls ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm print:hidden break-inside-avoid">
        <CardContent className="pt-4 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Customize Report
          </p>
          <div className="flex flex-wrap gap-4">
            <FilterGroup
              label="Time Range"
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: "week", label: "This Week" },
                { value: "all", label: "All Time" },
              ]}
            />
            <FilterGroup
              label="Show"
              value={transactionFilter}
              onChange={setTransactionFilter}
              options={[
                { value: "all", label: "All" },
                { value: "expense", label: "Expenses" },
                { value: "income", label: "Income" },
              ]}
            />
            <FilterGroup
              label="Sort By"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "newest", label: "Newest" },
                { value: "amount", label: "Highest" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Insights ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm break-inside-avoid">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-serif">Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 bg-accent/30 rounded-xl"
            >
              <span className="shrink-0 mt-0.5 text-amber-500">
                {index === 0 ? (
                  <Lightbulb className="w-4 h-4" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
              </span>
              <p className="text-sm text-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Spending Breakdown ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm break-inside-avoid">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-base">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <BarChart3 className="w-4 h-4 text-secondary" />
              </div>
              <span className="font-serif">Spending Breakdown</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {periodLabel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCategories.length > 0 ? (
            <div className="space-y-4">
              {sortedCategories.map(([category, amount], index) => {
                const percentage =
                  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div
                    key={category}
                    className="space-y-1.5 animate-fade-in-up opacity-0"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        <span className="text-muted-foreground">
                          {CATEGORY_ICONS[category] ?? (
                            <Package className="w-4 h-4" />
                          )}
                        </span>
                        <span className="capitalize font-medium">
                          {category}
                        </span>
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="font-mono font-semibold text-sm text-foreground tabular-nums w-16 text-right">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-accent/40 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          CATEGORY_BAR_COLORS[category] ?? "bg-primary",
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="p-4 bg-accent/30 rounded-full">
                <CircleDollarSign className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No expenses{" "}
                  {timeRange === "week" ? "this week" : "recorded yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Care for your pet to see spending data here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Transaction List ── */}
      <Card className="bg-card border border-border rounded-xl shadow-sm print-break-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-base">
              <div className="p-2 bg-chart-1/10 rounded-xl">
                <Receipt className="w-4 h-4 text-chart-1" />
              </div>
              <span className="font-serif">Transactions</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {displayTransactions.length}{" "}
              {displayTransactions.length === 1 ? "entry" : "entries"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayTransactions.length > 0 ? (
            <div>
              {/* Column headers - desktop only */}
              <div className="hidden sm:grid grid-cols-[72px_1fr_100px_80px] gap-2 px-3 pb-2 border-b border-border/50">
                {(["Date", "Description", "Category", "Amount"] as const).map(
                  (heading) => (
                    <span
                      key={heading}
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60",
                        heading === "Amount" && "text-right",
                      )}
                    >
                      {heading}
                    </span>
                  ),
                )}
              </div>

              <div className="space-y-0.5 mt-1">
                {displayTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex sm:grid sm:grid-cols-[72px_1fr_100px_80px] gap-2 items-center p-3 rounded-xl hover:bg-accent/30 transition-colors duration-150 animate-fade-in-up opacity-0"
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    {/* Date - desktop */}
                    <span className="hidden sm:block text-xs font-mono text-muted-foreground tabular-nums">
                      {formatDate(transaction.timestamp)}
                    </span>

                    {/* Description + mobile date */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
                      <div
                        className={cn(
                          "p-1.5 rounded-lg shrink-0",
                          transaction.type === "income"
                            ? "bg-secondary/15"
                            : "bg-chart-1/15",
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-3 h-3 text-secondary" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-chart-1" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm text-foreground truncate block">
                          {transaction.description}
                        </span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Category - desktop */}
                    <span className="hidden sm:block text-xs px-2 py-0.5 bg-accent/50 rounded-full text-muted-foreground capitalize text-center">
                      {transaction.category}
                    </span>

                    {/* Amount */}
                    <span
                      className={cn(
                        "font-mono font-semibold text-sm ml-auto sm:ml-0 sm:text-right shrink-0",
                        transaction.type === "income"
                          ? "text-secondary"
                          : "text-muted-foreground",
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="p-4 bg-accent/30 rounded-full">
                <Receipt className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {transactionFilter !== "all"
                    ? `No ${transactionFilter === "expense" ? "expense" : "income"} transactions ${timeRange === "week" ? "this week" : ""}`
                    : `No transactions ${timeRange === "week" ? "this week" : "yet"}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {transactionFilter !== "all"
                    ? "Try switching the filter to see other entries."
                    : "Interactions with your pet will appear here."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePanel;
