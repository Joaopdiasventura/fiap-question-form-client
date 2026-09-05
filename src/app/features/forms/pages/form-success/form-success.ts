import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  imports: [],
  selector: 'app-form-success',
  styleUrl: './form-success.scss',
  templateUrl: './form-success.html',
})
export class FormSuccess {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

  back(): void {
    void this.router.navigate(['/admin/forms']);
  }
}
