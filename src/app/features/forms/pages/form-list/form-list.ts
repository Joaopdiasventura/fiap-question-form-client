import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppHeader } from '../../../../shared/components/app-header/app-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { AuthService } from '../../../auth/services/auth.service';
import { FormResponseDto } from '../../models/form.models';
import { FormService } from '../../services/form.service';

@Component({
  imports: [AppHeader, EmptyState, LoadingState, RouterLink],
  selector: 'app-form-list',
  styleUrl: './form-list.scss',
  templateUrl: './form-list.html',
})
export class FormList {
  private readonly formsService = inject(FormService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly forms = signal<FormResponseDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.formsService.findAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (forms) => {
        this.forms.set(forms);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
