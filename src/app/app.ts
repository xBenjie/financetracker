import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { SupabaseService } from './services/supabase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidenavComponent, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('finance-tracker');
  sidenavCollapsed = false;
  isAuthenticated: Observable<boolean>;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {
    this.isAuthenticated = this.supabase.currentUser.pipe(
      map(user => !!user)
    );
  }

  ngOnInit() {
    // Navigation events are handled by auth guard
  }

  onSidenavToggle(collapsed: boolean) {
    this.sidenavCollapsed = collapsed;
  }
}
