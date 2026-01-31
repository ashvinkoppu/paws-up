import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, Wallet, AlertTriangle, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FinancePanel: React.FC = () => {
  const { state } = useGame();

  const budgetUsedPercent = (state.weeklySpent / state.weeklyBudget) * 100;
  const isOverBudget = state.weeklySpent > state.weeklyBudget;
  const remainingBudget = state.weeklyBudget - state.weeklySpent;

  // Calculate spending by category
  const spendingByCategory = state.transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
      return accumulator;
    }, {} as Record<string, number>);

  const recentTransactions = state.transactions.slice(-5).reverse();

  const categoryIcons: Record<string, string> = {
    food: '🍖',
    toy: '🎾',
    grooming: '✨',
    medicine: '💊',
    other: '📦',
  };

  return (
    <div className="space-y-5">
      {/* Balance Card */}
      <Card className={cn(
        "glass-card rounded-2xl transition-all duration-300 overflow-hidden",
        state.money < 20 ? "ring-2 ring-destructive/30" : ""
      )}>
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-30%] right-[-20%] w-[50%] h-[80%] bg-primary/3 blob-shape" />
        </div>

        <CardHeader className="pb-2 relative">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="font-serif">Current Balance</span>
            </span>
            {state.money < 20 && (
              <span className="text-xs text-destructive flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                Low funds
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-mono font-bold text-foreground mb-2">
            ${state.money.toFixed(2)}
          </div>
          {state.careStreak >= 3 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full text-secondary text-sm">
              <Flame className="w-4 h-4" />
              <span className="font-medium">{state.careStreak}-day streak bonus available!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 bg-chart-1/10 rounded-xl">
              <TrendingDown className="w-4 h-4 text-chart-1" />
            </div>
            <span className="font-serif">Weekly Budget</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-mono font-semibold text-foreground">${state.weeklySpent.toFixed(2)}</span>
          </div>

          {/* Progress bar */}
          <div className="h-3.5 bg-accent/40 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 relative",
                isOverBudget ? "bg-destructive" : "bg-chart-1"
              )}
              style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Budget: ${state.weeklyBudget}</span>
            <span className={cn(
              "text-sm font-semibold px-3 py-1 rounded-full",
              isOverBudget
                ? "bg-destructive/15 text-destructive"
                : "bg-secondary/15 text-secondary"
            )}>
              {isOverBudget
                ? `Over by $${Math.abs(remainingBudget).toFixed(2)}`
                : `$${remainingBudget.toFixed(2)} left`
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Spending Breakdown */}
      {Object.keys(spendingByCategory).length > 0 && (
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <DollarSign className="w-4 h-4 text-secondary" />
              </div>
              <span className="font-serif">Spending Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(spendingByCategory).map(([category, amount], index) => (
                <div
                  key={category}
                  className="flex justify-between items-center p-3 bg-accent/30 rounded-xl animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[category] || '📦'}</span>
                    <span className="capitalize font-medium text-foreground">{category}</span>
                  </span>
                  <span className="font-mono font-semibold text-muted-foreground">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 rounded-xl hover:bg-accent/30 transition-colors duration-200 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      transaction.type === 'income' ? "bg-secondary/15" : "bg-chart-1/15"
                    )}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-secondary" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-chart-1" />
                      )}
                    </div>
                    <span className="text-sm truncate max-w-[180px] text-foreground">
                      {transaction.description}
                    </span>
                  </div>
                  <span className={cn(
                    "font-mono font-semibold",
                    transaction.type === 'income' ? 'text-secondary' : 'text-muted-foreground'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancePanel;
