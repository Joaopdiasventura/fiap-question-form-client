import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  open = input(false);
  title = input('Confirmar acao');
  message = input('Deseja continuar?');
  confirmed = output<void>();
  cancelled = output<void>();
}
