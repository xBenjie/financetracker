import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Budget {
  id: number;
  category: string;
  limit_amount: number;
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

  constructor(private supabase: SupabaseService) { }

  ngOnInit(): void {
    this.loadBudgets();
  }

  async loadBudgets(): Promise<void> {
    const { data, error } = await this.supabase.getBudgets();
    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }
    this.budgets = data || [];
  }

  openForm(budget?: Budget): void {
    if (budget) {
      this.editingId = budget.id;
      this.category = budget.category;
      this.limit = budget.limit_amount;
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

  async saveBudget(): Promise<void> {
    if (!this.category || !this.limit) {
      return;
    }

    if (this.editingId) {
      const budgetData = {
        category: this.category,
        limit_amount: this.limit,
        period: this.period
      };
      const { error } = await this.supabase.updateBudget(this.editingId, budgetData);
      if (error) {
        console.error('Error updating budget:', error);
        return;
      }
    } else {
      const newBudget = {
        category: this.category,
        limit_amount: this.limit,
        spent: 0,
        period: this.period,
        color: this.budgetColors[this.budgets.length % this.budgetColors.length]
      };
      const { error } = await this.supabase.createBudget(newBudget);
      if (error) {
        console.error('Error creating budget:', error);
        return;
      }
    }

    await this.loadBudgets();
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

  async confirmDelete(): Promise<void> {
    if (this.deletingBudget) {
      const { error } = await this.supabase.deleteBudget(this.deletingBudget.id);
      if (error) {
        console.error('Error deleting budget:', error);
        return;
      }
      await this.loadBudgets();
      this.closeDeleteModal();
    }
  }

  getPercentage(budget: Budget): number {
    return Math.min((budget.spent / budget.limit_amount) * 100, 100);
  }

  getStatusClass(budget: Budget): string {
    const percentage = this.getPercentage(budget);
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    return 'good';
  }

  getRemainingAmount(budget: Budget): number {
    return Math.max(budget.limit_amount - budget.spent, 0);
  }

  get totalBudgetLimit(): number {
    return this.budgets.reduce((sum, b) => sum + b.limit_amount, 0);
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
