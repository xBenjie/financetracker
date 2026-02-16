import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Goal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: Date;
  category: string;
  color: string;
  completed: boolean;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];

  // Form fields
  showForm = false;
  showContributeModal = false;
  showDeleteModal = false;
  deletingGoal: Goal | null = null;
  editingId: number | null = null;
  contributingGoal: Goal | null = null;

  title = '';
  targetAmount: number | null = null;
  currentAmount: number | null = null;
  deadline = '';
  category = '';
  contributeAmount: number | null = null;

  categories = [
    'Emergency Fund',
    'Vacation',
    'Home Purchase',
    'Car Purchase',
    'Education',
    'Retirement',
    'Investment',
    'Wedding',
    'Business',
    'Other'
  ];

  goalColors = [
    '#6366f1',
    '#22c55e',
    '#f59e0b',
    '#f87171',
    '#a78bfa',
    '#f472b6',
    '#60a5fa',
    '#84cc16'
  ];

  constructor(private supabase: SupabaseService) { }

  ngOnInit(): void {
    this.loadGoals();
  }

  async loadGoals(): Promise<void> {
    const { data, error } = await this.supabase.getGoals();
    if (error) {
      console.error('Error loading goals:', error);
      return;
    }
    this.goals = (data || []).map((g: any) => ({
      ...g,
      deadline: new Date(g.deadline)
    }));
  }

  openForm(goal?: Goal): void {
    if (goal) {
      this.editingId = goal.id;
      this.title = goal.title;
      this.targetAmount = goal.target_amount;
      this.currentAmount = goal.current_amount;
      this.deadline = goal.deadline.toISOString().split('T')[0];
      this.category = goal.category;
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
    this.title = '';
    this.targetAmount = null;
    this.currentAmount = 0;
    this.deadline = '';
    this.category = '';
  }

  async saveGoal(): Promise<void> {
    if (!this.title || !this.targetAmount || !this.deadline || !this.category) {
      return;
    }

    if (this.editingId) {
      const goalData = {
        title: this.title,
        target_amount: this.targetAmount,
        current_amount: this.currentAmount || 0,
        deadline: this.deadline,
        category: this.category
      };
      const { error } = await this.supabase.updateGoal(this.editingId, goalData);
      if (error) {
        console.error('Error updating goal:', error);
        return;
      }
    } else {
      const newGoal = {
        title: this.title,
        target_amount: this.targetAmount,
        current_amount: this.currentAmount || 0,
        deadline: this.deadline,
        category: this.category,
        color: this.goalColors[this.goals.length % this.goalColors.length],
        completed: false
      };
      const { error } = await this.supabase.createGoal(newGoal);
      if (error) {
        console.error('Error creating goal:', error);
        return;
      }
    }

    await this.loadGoals();
    this.closeForm();
  }

  openDeleteModal(goal: Goal): void {
    this.deletingGoal = goal;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingGoal = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.deletingGoal) {
      const { error } = await this.supabase.deleteGoal(this.deletingGoal.id);
      if (error) {
        console.error('Error deleting goal:', error);
        return;
      }
      await this.loadGoals();
      this.closeDeleteModal();
    }
  }

  openContributeModal(goal: Goal): void {
    this.contributingGoal = goal;
    this.contributeAmount = null;
    this.showContributeModal = true;
  }

  closeContributeModal(): void {
    this.showContributeModal = false;
    this.contributingGoal = null;
    this.contributeAmount = null;
  }

  async addContribution(): Promise<void> {
    if (!this.contributingGoal || !this.contributeAmount || this.contributeAmount <= 0) {
      return;
    }

    const goal = this.goals.find(g => g.id === this.contributingGoal!.id);
    if (goal) {
      const newCurrentAmount = goal.current_amount + this.contributeAmount;
      const goalData = {
        current_amount: newCurrentAmount,
        completed: newCurrentAmount >= goal.target_amount
      };
      const { error } = await this.supabase.updateGoal(goal.id, goalData);
      if (error) {
        console.error('Error updating contribution:', error);
        return;
      }
      await this.loadGoals();
    }

    this.closeContributeModal();
  }

  getPercentage(goal: Goal): number {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  }

  getRemainingAmount(goal: Goal): number {
    return Math.max(goal.target_amount - goal.current_amount, 0);
  }

  getDaysRemaining(goal: Goal): number {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStatusClass(goal: Goal): string {
    if (goal.completed) return 'completed';

    const daysRemaining = this.getDaysRemaining(goal);
    const percentage = this.getPercentage(goal);

    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining < 30 && percentage < 80) return 'urgent';
    if (percentage >= 80) return 'on-track';
    return 'in-progress';
  }

  get activeGoals(): Goal[] {
    return this.goals.filter(g => !g.completed);
  }

  get completedGoals(): Goal[] {
    return this.goals.filter(g => g.completed);
  }

  get totalTargetAmount(): number {
    return this.activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
  }

  get totalCurrentAmount(): number {
    return this.activeGoals.reduce((sum, g) => sum + g.current_amount, 0);
  }

  get totalRemaining(): number {
    return this.totalTargetAmount - this.totalCurrentAmount;
  }
}
