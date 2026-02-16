import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidenavComponent, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('finance-tracker');
  sidenavCollapsed = false;
  isAuthenticated = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthStatus();
    
    // Listen to navigation changes to update auth status
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAuthStatus();
    });
  }

  private checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    this.isAuthenticated = !!currentUser;
  }

  onSidenavToggle(collapsed: boolean) {
    this.sidenavCollapsed = collapsed;
  }
}
