import { RenderMode } from '@angular/ssr';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

describe('routing', () => {
  it('keeps the public response route accessible without authentication', () => {
    const publicRoute = routes.find((route) => route.path === 'forms/:id');

    expect(publicRoute?.canActivate).toBeUndefined();
  });

  it('renders the public response route with server-side rendering', () => {
    const publicServerRoute = serverRoutes.find((route) => route.path === 'forms/:id');

    expect(publicServerRoute?.renderMode).toBe(RenderMode.Server);
  });
});
