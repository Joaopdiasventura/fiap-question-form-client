import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/forms/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/forms/:id/results',
    renderMode: RenderMode.Server,
  },
  {
    path: 'forms/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'forms/:id/success',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];
