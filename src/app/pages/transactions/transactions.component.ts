import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  // Form fields
  showForm = false;
  showDeleteModal = false;
  deletingTransaction: Transaction | null = null;
  editingId: number | null = null;
  description = '';
  amount: number | null = null;
  type: 'income' | 'expense' = 'expense';
  category = '';
  date = new Date().toISOString().split('T')[0];

  // Filter fields
  filterType: 'all' | 'income' | 'expense' = 'all';
  searchText = '';

  categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'],
    expense: ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other Expense']
  };

  constructor(private supabase: SupabaseService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    const { data, error } = await this.supabase.getTransactions();

    if (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
    } else {
      this.transactions = (data || []).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }

    this.applyFilters();
  }

  openForm(transaction?: Transaction): void {
    if (transaction) {
      this.editingId = transaction.id;
      this.description = transaction.description;
      this.amount = transaction.amount;
      this.type = transaction.type;
      this.category = transaction.category;
      this.date = transaction.date.toISOString().split('T')[0];
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
    this.description = '';
    this.amount = null;
    this.type = 'expense';
    this.category = '';
    this.date = new Date().toISOString().split('T')[0];
  }

  async saveTransaction(): Promise<void> {
    if (!this.description || !this.amount || !this.category) {
      return;
    }

    if (this.editingId) {
      await this.updateTransaction();
    } else {
      await this.createTransaction();
    }

    this.closeForm();
  }

  private async createTransaction(): Promise<void> {
    const transaction = {
      description: this.description,
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: new Date(this.date).toISOString()
    };

    const { error } = await this.supabase.createTransaction(transaction);

    if (error) {
      console.error('Error creating transaction:', error);
    } else {
      await this.loadTransactions();
    }
  }

  private async updateTransaction(): Promise<void> {
    const transaction = {
      description: this.description,
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: new Date(this.date).toISOString()
    };

    const { error } = await this.supabase.updateTransaction(this.editingId!, transaction);

    if (error) {
      console.error('Error updating transaction:', error);
    } else {
      await this.loadTransactions();
    }
  }

  openDeleteModal(transaction: Transaction): void {
    this.deletingTransaction = transaction;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingTransaction = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.deletingTransaction) {
      const { error } = await this.supabase.deleteTransaction(this.deletingTransaction.id);

      if (error) {
        console.error('Error deleting transaction:', error);
      } else {
        await this.loadTransactions();
      }

      this.closeDeleteModal();
    }
  }

  applyFilters(): void {
    let result = [...this.transactions];

    // Filter by type
    if (this.filterType !== 'all') {
      result = result.filter(t => t.type === this.filterType);
    }

    // Filter by search text
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => b.date.getTime() - a.date.getTime());

    this.filteredTransactions = result;
  }

  get totalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get netBalance(): number {
    return this.totalIncome - this.totalExpenses;
  }

  getCategoryOptions(): string[] {
    return this.categories[this.type];
  }
}
