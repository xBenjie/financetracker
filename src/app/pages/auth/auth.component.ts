import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  
  // Login fields
  loginEmail = '';
  loginPassword = '';
  
  // Signup fields
  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Check if already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
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
  }
  
  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      return;
    }
    
    const users = this.getUsers();
    const user = users.find(u => u.email === this.loginEmail && u.password === this.loginPassword);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));
      this.router.navigate(['/dashboard']);
    } else {
      alert('Invalid email or password');
    }
  }
  
  onSignup(): void {
    if (!this.signupName || !this.signupEmail || !this.signupPassword || !this.signupConfirmPassword) {
      return;
    }
    
    if (this.signupPassword !== this.signupConfirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (this.signupPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    const users = this.getUsers();
    
    if (users.find(u => u.email === this.signupEmail)) {
      alert('Email already exists');
      return;
    }
    
    const newUser = {
      id: Date.now(),
      name: this.signupName,
      email: this.signupEmail,
      password: this.signupPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize empty transactions for new user
    const userTransactionsKey = `transactions_${newUser.id}`;
    localStorage.setItem(userTransactionsKey, JSON.stringify([]));
    
    localStorage.setItem('currentUser', JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }));
    
    this.router.navigate(['/dashboard']);
  }
  
  private getUsers(): any[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }
}
