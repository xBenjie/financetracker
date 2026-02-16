import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    this.loadTransactions();
    this.applyFilters();
  }

  loadTransactions(): void {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userTransactionsKey = `transactions_${currentUser.id}`;

    // Load from localStorage
    const stored = localStorage.getItem(userTransactionsKey);
    if (stored) {
      this.transactions = JSON.parse(stored).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    } else {
      // Initialize with empty array for new users
      this.transactions = [];
      this.saveTransactions();
    }
  }

  saveTransactions(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userTransactionsKey = `transactions_${currentUser.id}`;
    localStorage.setItem(userTransactionsKey, JSON.stringify(this.transactions));
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

  saveTransaction(): void {
    if (!this.description || !this.amount || !this.category) {
      return;
    }

    if (this.editingId) {
      // Edit existing
      const index = this.transactions.findIndex(t => t.id === this.editingId);
      if (index !== -1) {
        this.transactions[index] = {
          id: this.editingId,
          description: this.description,
          amount: this.amount,
          type: this.type,
          category: this.category,
          date: new Date(this.date)
        };
      }
    } else {
      // Add new
      const newTransaction: Transaction = {
        id: Date.now(),
        description: this.description,
        amount: this.amount,
        type: this.type,
        category: this.category,
        date: new Date(this.date)
      };
      this.transactions.unshift(newTransaction);
    }

    this.saveTransactions();
    this.applyFilters();
    this.closeForm();
  }

  openDeleteModal(transaction: Transaction): void {
    this.deletingTransaction = transaction;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingTransaction = null;
  }

  confirmDelete(): void {
    if (this.deletingTransaction) {
      this.transactions = this.transactions.filter(t => t.id !== this.deletingTransaction!.id);
      this.saveTransactions();
      this.applyFilters();
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
