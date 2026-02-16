import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  errorMessage = '';

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Signup fields
  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';

  constructor(private router: Router, private supabase: SupabaseService) { }

  ngOnInit(): void {
    // Check if already logged in
    if (this.supabase.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearForms();
  }

  clearForms(): void {
    this.loginEmail = '';
    this.loginPassword = '';
    this.signupName = '';
    this.signupEmail = '';
    this.signupPassword = '';
    this.signupConfirmPassword = '';
    this.errorMessage = '';
  }

  async onLogin(): Promise<void> {
    this.errorMessage = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    const { data, error } = await this.supabase.signIn(this.loginEmail, this.loginPassword);

    if (error) {
      this.errorMessage = error.message || 'Invalid email or password';
    } else if (data.user) {
      this.cleanupOldLocalStorage();
      this.router.navigate(['/dashboard']);
    }
  }

  async onSignup(): Promise<void> {
    this.errorMessage = '';

    if (!this.signupName || !this.signupEmail || !this.signupPassword || !this.signupConfirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.signupPassword !== this.signupConfirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.signupPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    const { data, error } = await this.supabase.signUp(this.signupEmail, this.signupPassword);

    if (error) {
      this.errorMessage = error.message || 'Failed to create account';
    } else if (data.user) {
      this.cleanupOldLocalStorage();
      this.router.navigate(['/dashboard']);
    }
  }

  private cleanupOldLocalStorage(): void {
    // Remove old localStorage keys from previous implementation
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('transactions');
    localStorage.removeItem('budgets');
    localStorage.removeItem('goals');

    // Remove all user-specific keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('transactions_') || key.startsWith('budgets_') || key.startsWith('goals_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
