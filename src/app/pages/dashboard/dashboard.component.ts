import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [CommonModule, BaseChartDirective]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dailyChart') dailyChart?: BaseChartDirective;
  @ViewChild('monthlyChart') monthlyChart?: BaseChartDirective;

  totalIncome = 0;
  totalExpenses = 0;
  netBalance = 0;
  transactionsCount = 0;

  recentTransactions: Array<{
    description: string;
    date: Date;
    amount: number;
    type: 'income' | 'expense';
  }> = [];

  dailyChartType = 'line' as const;
  monthlyChartType = 'bar' as const;

  dailyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.2)' } }
    }
  };

  monthlyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.2)' } }
    }
  };

  dailyChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        pointBackgroundColor: '#22c55e',
        pointRadius: 3,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Expense',
        data: [],
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        pointBackgroundColor: '#f87171',
        pointRadius: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  monthlyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        backgroundColor: '#22c55e',
        borderRadius: 10
      },
      {
        label: 'Expense',
        data: [],
        backgroundColor: '#f87171',
        borderRadius: 10
      }
    ]
  };

  private realtimeSub?: Subscription;
  private readonly realtimeIntervalMs = 2000;

  ngOnInit(): void {
    this.loadRealData();
    this.startRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  private loadRealData(): void {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userTransactionsKey = `transactions_${currentUser.id}`;

    const stored = localStorage.getItem(userTransactionsKey);
    let transactions: Transaction[] = [];

    if (stored) {
      transactions = JSON.parse(stored).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }

    this.updateDashboardWithTransactions(transactions);
  }

  private updateDashboardWithTransactions(transactions: Transaction[]): void {
    // Get recent transactions (last 5)
    const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.recentTransactions = sortedTransactions.slice(0, 5).map(t => ({
      description: t.description,
      date: new Date(t.date),
      amount: t.amount,
      type: t.type
    }));

    // Calculate totals
    this.totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.netBalance = this.totalIncome - this.totalExpenses;
    this.transactionsCount = transactions.length;

    // Update charts
    this.updateDailyChart(transactions);
    this.updateMonthlyChart(transactions);
  }

  private updateDailyChart(transactions: Transaction[]): void {
    const last7Days = this.getLast7DaysLabels();
    const incomeData: number[] = new Array(7).fill(0);
    const expenseData: number[] = new Array(7).fill(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff < 7) {
        const index = 6 - daysDiff;
        if (t.type === 'income') {
          incomeData[index] += t.amount;
        } else {
          expenseData[index] += t.amount;
        }
      }
    });

    this.dailyChartData.labels = last7Days;
    this.dailyChartData.datasets[0].data = incomeData;
    this.dailyChartData.datasets[1].data = expenseData;

    this.dailyChart?.update();
  }

  private updateMonthlyChart(transactions: Transaction[]): void {
    const last3Months = this.getLast3MonthsLabels();
    const incomeData: number[] = new Array(3).fill(0);
    const expenseData: number[] = new Array(3).fill(0);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();

      const monthsDiff = (currentYear - transactionYear) * 12 + (currentMonth - transactionMonth);

      if (monthsDiff >= 0 && monthsDiff < 3) {
        const index = 2 - monthsDiff;
        if (t.type === 'income') {
          incomeData[index] += t.amount;
        } else {
          expenseData[index] += t.amount;
        }
      }
    });

    this.monthlyChartData.labels = last3Months;
    this.monthlyChartData.datasets[0].data = incomeData;
    this.monthlyChartData.datasets[1].data = expenseData;

    this.monthlyChart?.update();
  }

  private startRealtimeUpdates(): void {
    this.realtimeSub = interval(this.realtimeIntervalMs).subscribe(() => {
      this.loadRealData();
    });
  }

  private getLast7DaysLabels(): string[] {
    const labels: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      );
    }

    return labels;
  }

  private getLast3MonthsLabels(): string[] {
    const labels: string[] = [];
    const today = new Date();

    for (let i = 2; i >= 0; i -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(
        date.toLocaleDateString('en-US', {
          month: 'short'
        })
      );
    }

    return labels;
  }
}
