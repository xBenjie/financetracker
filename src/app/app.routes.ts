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

  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    router.navigate(['/auth']);
    return false;
  }

  // Validate that the current user exists in users array
  const usersData = localStorage.getItem('users');
  const users = usersData ? JSON.parse(usersData) : [];

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

const homeGuard = () => {
  const router = inject(Router);
  const currentUser = localStorage.getItem('currentUser');

  if (currentUser) {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/auth']);
  }
  return false;
};

export const routes: Routes = [
  { path: '', canActivate: [homeGuard], children: [] },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'budgets', component: BudgetsComponent, canActivate: [authGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/auth' }
];
