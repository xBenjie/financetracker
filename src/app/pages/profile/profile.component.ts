import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  
  // Form fields
  name = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  errorMessage = '';
  successMessage = '';
  passwordError = '';
  
  showPasswordSection = false;
  showDeleteModal = false;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadUserData();
  }
  
  loadUserData(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      this.name = this.currentUser.name;
      this.email = this.currentUser.email;
    } else {
      this.router.navigate(['/auth']);
    }
  }
  
  saveProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.name || !this.email) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    
    // Update current user
    this.currentUser.name = this.name;
    this.currentUser.email = this.email;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // Update in users array
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].name = this.name;
      users[userIndex].email = this.email;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    this.successMessage = 'Profile updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }
  
  changePassword(): void {
    this.passwordError = '';
    this.successMessage = '';
    
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }
    
    const users = this.getUsers();
    const user = users.find(u => u.id === this.currentUser.id);
    
    if (!user || user.password !== this.currentPassword) {
      this.passwordError = 'Current password is incorrect';
      return;
    }
    
    user.password = this.newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordSection = false;
    
    this.successMessage = 'Password changed successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }
  
  openDeleteModal(): void {
    this.showDeleteModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }
  
  deleteAccount(): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== this.currentUser.id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    this.logout();
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth']);
  }
  
  private getUsers(): any[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }
}
