import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Budget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
  color: string;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];

  // Form fields
  showForm = false;
  showDeleteModal = false;
  deletingBudget: Budget | null = null;
  editingId: number | null = null;
  category = '';
  limit: number | null = null;
  period: 'monthly' | 'weekly' = 'monthly';

  availableCategories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Fitness',
    'Personal Care'
  ];

  budgetColors = [
    '#6366f1',
    '#f87171',
    '#22c55e',
    '#f59e0b',
    '#a78bfa',
    '#f472b6',
    '#60a5fa',
    '#fb923c'
  ];

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userBudgetsKey = `budgets_${currentUser.id}`;

    const stored = localStorage.getItem(userBudgetsKey);
    if (stored) {
      this.budgets = JSON.parse(stored);
    } else {
      // Initialize with empty array for new users
      this.budgets = [];
      this.saveBudgets();
    }
  }

  saveBudgets(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userBudgetsKey = `budgets_${currentUser.id}`;
    localStorage.setItem(userBudgetsKey, JSON.stringify(this.budgets));
  }

  openForm(budget?: Budget): void {
    if (budget) {
      this.editingId = budget.id;
      this.category = budget.category;
      this.limit = budget.limit;
      this.period = budget.period;
    } else {
      this.resetForm();
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingId = null;
    this.category = '';
    this.limit = null;
    this.period = 'monthly';
  }

  saveBudget(): void {
    if (!this.category || !this.limit) {
      return;
    }

    if (this.editingId) {
      const index = this.budgets.findIndex(b => b.id === this.editingId);
      if (index !== -1) {
        this.budgets[index] = {
          ...this.budgets[index],
          category: this.category,
          limit: this.limit,
          period: this.period
        };
      }
    } else {
      const newBudget: Budget = {
        id: Date.now(),
        category: this.category,
        limit: this.limit,
        spent: 0,
        period: this.period,
        color: this.budgetColors[this.budgets.length % this.budgetColors.length]
      };
      this.budgets.push(newBudget);
    }

    this.saveBudgets();
    this.closeForm();
  }

  openDeleteModal(budget: Budget): void {
    this.deletingBudget = budget;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingBudget = null;
  }

  confirmDelete(): void {
    if (this.deletingBudget) {
      this.budgets = this.budgets.filter(b => b.id !== this.deletingBudget!.id);
      this.saveBudgets();
      this.closeDeleteModal();
    }
  }

  getPercentage(budget: Budget): number {
    return Math.min((budget.spent / budget.limit) * 100, 100);
  }

  getStatusClass(budget: Budget): string {
    const percentage = this.getPercentage(budget);
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    return 'good';
  }

  getRemainingAmount(budget: Budget): number {
    return Math.max(budget.limit - budget.spent, 0);
  }

  get totalBudgetLimit(): number {
    return this.budgets.reduce((sum, b) => sum + b.limit, 0);
  }

  get totalSpent(): number {
    return this.budgets.reduce((sum, b) => sum + b.spent, 0);
  }

  get overallPercentage(): number {
    return this.totalBudgetLimit > 0 ? (this.totalSpent / this.totalBudgetLimit) * 100 : 0;
  }

  getAvailableCategories(): string[] {
    const usedCategories = this.budgets.map(b => b.category);
    return this.availableCategories.filter(c =>
      this.editingId ? true : !usedCategories.includes(c)
    );
  }
}
