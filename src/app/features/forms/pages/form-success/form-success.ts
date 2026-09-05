import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeader } from '../../../../shared/components/app-header/app-header';

@Component({
  imports: [AppHeader, RouterLink],
  selector: 'app-form-success',
  styleUrl: './form-success.scss',
  templateUrl: './form-success.html',
})
export class FormSuccess {}
