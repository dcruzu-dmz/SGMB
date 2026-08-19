import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './layout/pages/dashboard/dashboard.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { UsersListComponent } from './features/users/pages/users-list/users-list.component';
import { AssetsListComponent } from './features/assets/pages/assets-list/assets-list.component';
import { BranchesListComponent } from './features/branches/pages/branches-list/branches-list.component';
import { CorrectiveRequestListComponent } from './features/corrective-requests/pages/corrective-requests-list/corrective-requests-list.component';
import { ReportsDashboardComponent } from './features/reports/pages/reports-dashboard/reports-dashboard.component';
import { VisitListComponent } from './features/maintenance-visits/pages/visit-list/visit-list.component';
import { VisitFormComponent } from './features/maintenance-visits/pages/visit-form/visit-form.component';
import { VisitDetailComponent } from './features/maintenance-visits/pages/visit-detail/visit-detail.component';
import { VisitScheduleComponent } from './features/maintenance-visits/pages/visit-schedule/visit-schedule.component';
import { BulkBranchAssetsComponent } from './features/assets/pages/bulk-branch-assets/bulk-branch-assets.component';
import { VisitPrintComponent } from './features/maintenance-visits/pages/visit-print/visit-print.component';
import { CorrectiveRequestPrintComponent } from './features/corrective-requests/pages/corrective-request-print/corrective-request-print.component';


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
      { path: 'users', component: UsersListComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'branches', component: BranchesListComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'assets/bulk', component: BulkBranchAssetsComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'assets', component: AssetsListComponent },
      { path: 'requests', component: CorrectiveRequestListComponent },
      { path: 'reports', component: ReportsDashboardComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'maintenance-visits', component: VisitListComponent },
      { path: 'maintenance-visits/new', component: VisitFormComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'maintenance-visits/schedule', component: VisitScheduleComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'maintenance-visits/:id/edit', component: VisitFormComponent },
      { path: 'maintenance-visits/:id', component: VisitDetailComponent },
    ]
  },
  {
    path: 'maintenance-visits/:id/print',
    component: VisitPrintComponent,
    canActivate: [authGuard],
  },
  {
    path: 'requests/:id/print',
    component: CorrectiveRequestPrintComponent,
    canActivate: [authGuard],
  }
];
