import { RenderMode } from '@angular/ssr';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

describe('routing', () => {
  it('loads the career survey on the main route', () => {
    const mainRoute = routes.find((route) => route.path === '');

    expect(mainRoute?.loadComponent).toBeDefined();
  });

  it('prerenders the simplified survey application', () => {
    const fallbackServerRoute = serverRoutes.find((route) => route.path === '**');

    expect(fallbackServerRoute?.renderMode).toBe(RenderMode.Prerender);
  });
});
