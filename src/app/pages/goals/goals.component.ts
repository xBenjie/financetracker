import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
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

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userGoalsKey = `goals_${currentUser.id}`;

    const stored = localStorage.getItem(userGoalsKey);
    if (stored) {
      this.goals = JSON.parse(stored).map((g: any) => ({
        ...g,
        deadline: new Date(g.deadline)
      }));
    } else {
      // Initialize with empty array for new users
      this.goals = [];
      this.saveGoals();
    }
  }

  saveGoals(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const userGoalsKey = `goals_${currentUser.id}`;
    localStorage.setItem(userGoalsKey, JSON.stringify(this.goals));
  }

  openForm(goal?: Goal): void {
    if (goal) {
      this.editingId = goal.id;
      this.title = goal.title;
      this.targetAmount = goal.targetAmount;
      this.currentAmount = goal.currentAmount;
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

  saveGoal(): void {
    if (!this.title || !this.targetAmount || !this.deadline || !this.category) {
      return;
    }

    if (this.editingId) {
      const index = this.goals.findIndex(g => g.id === this.editingId);
      if (index !== -1) {
        this.goals[index] = {
          ...this.goals[index],
          title: this.title,
          targetAmount: this.targetAmount,
          currentAmount: this.currentAmount || 0,
          deadline: new Date(this.deadline),
          category: this.category
        };
      }
    } else {
      const newGoal: Goal = {
        id: Date.now(),
        title: this.title,
        targetAmount: this.targetAmount,
        currentAmount: this.currentAmount || 0,
        deadline: new Date(this.deadline),
        category: this.category,
        color: this.goalColors[this.goals.length % this.goalColors.length],
        completed: false
      };
      this.goals.push(newGoal);
    }

    this.saveGoals();
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

  confirmDelete(): void {
    if (this.deletingGoal) {
      this.goals = this.goals.filter(g => g.id !== this.deletingGoal!.id);
      this.saveGoals();
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

  addContribution(): void {
    if (!this.contributingGoal || !this.contributeAmount || this.contributeAmount <= 0) {
      return;
    }

    const goal = this.goals.find(g => g.id === this.contributingGoal!.id);
    if (goal) {
      goal.currentAmount += this.contributeAmount;
      if (goal.currentAmount >= goal.targetAmount) {
        goal.completed = true;
      }
      this.saveGoals();
    }

    this.closeContributeModal();
  }

  getPercentage(goal: Goal): number {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  }

  getRemainingAmount(goal: Goal): number {
    return Math.max(goal.targetAmount - goal.currentAmount, 0);
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
    return this.activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }

  get totalCurrentAmount(): number {
    return this.activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }

  get totalRemaining(): number {
    return this.totalTargetAmount - this.totalCurrentAmount;
  }
}
