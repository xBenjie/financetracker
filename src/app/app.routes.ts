import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { GoalsComponent } from './pages/goals/goals.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

const authGuard = () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  if (!supabase.currentUserValue) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};

const homeGuard = () => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  if (supabase.currentUserValue) {
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
