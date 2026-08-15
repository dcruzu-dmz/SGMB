import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart } from '@angular/router';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private searchService = inject(SearchService);

  user: CurrentUser | null = null;
  searchTerm = '';
  sidebarOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { label: 'Usuarios', path: '/users', icon: 'users' },
    { label: 'Sucursales', path: '/branches', icon: 'building' },
    { label: 'Equipos', path: '/assets', icon: 'box' },
    { label: 'Solicitudes', path: '/requests', icon: 'ticket' },
    { label: 'Preventivos', path: '/preventive', icon: 'calendar' },
    { label: 'Reportes', path: '/reports', icon: 'chart' },
  ];

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (res) => (this.user = res),
      error: () => {},
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.searchTerm = '';
        this.searchService.setTerm('');
        this.sidebarOpen = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchService.setTerm(this.searchTerm);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get initials(): string {
    if (!this.user?.name) return '?';
    return this.user.name
      .split(' ')
      .map(p => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
