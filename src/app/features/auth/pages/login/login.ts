import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AppHeader } from '../../../../shared/components/app-header/app-header';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [AppHeader, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = new FormGroup({
    email: new FormControl('admin@fiap.com.br', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('fiap123', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin/forms';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
