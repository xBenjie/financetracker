import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
    @Output() toggleChange = new EventEmitter<boolean>();
    collapsed = false;

    navItems: NavItem[] = [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
        { label: 'Transactions', route: '/transactions', icon: 'account_balance_wallet' },
        { label: 'Budgets', route: '/budgets', icon: 'assignment' },
        { label: 'Goals', route: '/goals', icon: 'flag' }
    ];

    toggleSidebar() {
        this.collapsed = !this.collapsed;
        this.toggleChange.emit(this.collapsed);
    }
}
