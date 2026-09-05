import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MockApiStoreService } from '../../../core/mock-api/mock-api-store.service';
import { LoginDto } from '../models/auth.models';

@Service()
export class AuthService {
  private readonly store = inject(MockApiStoreService);
  private readonly tokenState = signal<string | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  login(dto: LoginDto): Observable<string> {
    return this.store.login(dto).pipe(tap((token) => this.tokenState.set(token)));
  }

  logout(): void {
    this.tokenState.set(null);
  }
}
