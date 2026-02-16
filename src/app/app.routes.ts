import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { GoalsComponent } from './pages/goals/goals.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

const authGuard = () => {
  const router = inject(Router);
  
  // Check if any users exist in the system
  const usersData = localStorage.getItem('users');
  const users = usersData ? JSON.parse(usersData) : [];
  
  // If no users exist, redirect to auth page
  if (users.length === 0) {
    router.navigate(['/auth']);
    return false;
  }
  
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    router.navigate(['/auth']);
    return false;
  }
  
  // Validate that the current user exists in users array
  try {
    const user = JSON.parse(currentUser);
    const userExists = users.some((u: any) => u.email === user.email);
    if (userExists) {
      return true;
    }
  } catch (e) {
    // Invalid currentUser data
  }
  
  // If validation fails, clear invalid data and redirect
  localStorage.removeItem('currentUser');
  router.navigate(['/auth']);
  return false;
};

export const routes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    { path: 'auth', component: AuthComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
    { path: 'budgets', component: BudgetsComponent, canActivate: [authGuard] },
    { path: 'goals', component: GoalsComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }
];
