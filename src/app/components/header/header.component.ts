import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  greeting = '';
  currentDate = new Date();
  currentUserName: Observable<string>;
  userEmail = '';
  showProfileMenu = false;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {
    this.currentUserName = this.supabase.currentUser.pipe(
      map(user => user?.email?.split('@')[0] || 'User')
    );
  }

  ngOnInit() {
    this.setGreeting();
  }

  private setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/auth']);
  }
}
