import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/forms/pages/career-survey/career-survey').then(
        (module) => module.CareerSurvey,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
