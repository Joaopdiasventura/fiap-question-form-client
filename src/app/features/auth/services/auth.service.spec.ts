import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns a token for valid credentials', async () => {
    const token = await firstValueFrom(service.login({ email: 'admin@fiap.com.br', password: 'fiap123' }));

    expect(token).toBe('mock-token-admin-1');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('returns an error for invalid credentials', async () => {
    let message = '';

    try {
      await firstValueFrom(service.login({ email: 'admin@fiap.com.br', password: 'errada' }));
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe('Credenciais invalidas');
    expect(service.isAuthenticated()).toBe(false);
  });
});
