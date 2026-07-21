import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './layout/pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { UsersListComponent } from './features/users/pages/users-list/users-list.component';
import { AssetsListComponent } from './features/assets/pages/assets-list/assets-list.component';
import { BranchesListComponent } from './features/branches/pages/branches-list/branches-list.component';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'assets',
    component: AssetsListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'branches',
    component: BranchesListComponent,
    canActivate: [authGuard]
  }


];