import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './layout/pages/dashboard/dashboard.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { UsersListComponent } from './features/users/pages/users-list/users-list.component';
import { AssetsListComponent } from './features/assets/pages/assets-list/assets-list.component';
import { BranchesListComponent } from './features/branches/pages/branches-list/branches-list.component';
import { CorrectiveRequestListComponent } from './features/corrective-requests/pages/corrective-requests-list/corrective-requests-list.component';
import { PreventiveListComponent } from './features/preventive/pages/preventive-list/preventive-list.component';
import { ReportsDashboardComponent } from './features/reports/pages/reports-dashboard/reports-dashboard.component';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'branches', component: BranchesListComponent },
      { path: 'assets', component: AssetsListComponent },
      { path: 'requests', component: CorrectiveRequestListComponent },
      { path: 'preventive', component: PreventiveListComponent },
      { path: 'reports', component: ReportsDashboardComponent },
    ]
  }
];
