import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
  { label: 'Usuarios', path: '/users', icon: 'users' },
  { label: 'Sucursales', path: '/branches', icon: 'building' },
  { label: 'Equipos', path: '/assets', icon: 'box' },
  { label: 'Solicitudes', path: '/requests', icon: 'ticket' },
  { label: 'Visitas', path: '/maintenance-visits', icon: 'clipboard' },
  { label: 'Reportes', path: '/reports', icon: 'chart' },
];

const ROLE_NAV_PATHS: Record<string, string[]> = {
  admin: ALL_NAV_ITEMS.map(i => i.path),
  tecnico: ['/dashboard', '/assets', '/requests', '/maintenance-visits'],
  solicitante: ['/dashboard', '/requests'],
};

const SEARCHABLE_ROUTES = ['/assets', '/requests', '/maintenance-visits', '/branches'];

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
  showSearch = false;

  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (res) => {
        this.user = res;
        const allowedPaths = ROLE_NAV_PATHS[res.role] || ['/dashboard'];
        this.navItems = ALL_NAV_ITEMS.filter(item => allowedPaths.includes(item.path));
      },
      error: () => {},
    });

    this.showSearch = SEARCHABLE_ROUTES.includes(this.router.url.split('?')[0]);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.searchTerm = '';
        this.searchService.setTerm('');
        this.sidebarOpen = false;
      }
      if (event instanceof NavigationEnd) {
        this.showSearch = SEARCHABLE_ROUTES.includes(event.urlAfterRedirects.split('?')[0]);
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
