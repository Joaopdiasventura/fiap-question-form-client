import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin/forms',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((module) => module.Login),
  },
  {
    path: 'admin/forms',
    canActivate: [authGuard],
    loadComponent: () => import('./features/forms/pages/form-list/form-list').then((module) => module.FormList),
  },
  {
    path: 'admin/forms/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/forms/pages/form-editor/form-editor').then((module) => module.FormEditor),
  },
  {
    path: 'admin/forms/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/forms/pages/form-editor/form-editor').then((module) => module.FormEditor),
  },
  {
    path: 'admin/forms/:id/results',
    canActivate: [authGuard],
    loadComponent: () => import('./features/forms/pages/form-results/form-results').then((module) => module.FormResults),
  },
  {
    path: 'forms/:id',
    loadComponent: () => import('./features/forms/pages/form-response/form-response').then((module) => module.FormResponse),
  },
  {
    path: 'forms/:id/success',
    loadComponent: () => import('./features/forms/pages/form-success/form-success').then((module) => module.FormSuccess),
  },
  {
    path: '**',
    redirectTo: 'admin/forms',
  },
];
