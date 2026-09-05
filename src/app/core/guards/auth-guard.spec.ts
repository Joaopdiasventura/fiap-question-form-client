import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('allows authenticated admins', async () => {
    const auth = TestBed.inject(AuthService);
    let result: boolean | UrlTree = false;

    await firstValueFrom(auth.login({ email: 'admin@fiap.com.br', password: 'fiap123' }));
    result = executeGuard({} as ActivatedRouteSnapshot, { url: '/admin/forms' } as RouterStateSnapshot) as boolean | UrlTree;

    expect(result).toBe(true);
  });

  it('redirects anonymous users to login', () => {
    const result = executeGuard({} as ActivatedRouteSnapshot, { url: '/admin/forms' } as RouterStateSnapshot);

    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toContain('/login');
  });
});
