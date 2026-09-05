import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  title = input('Nada encontrado');
  message = input('Os dados aparecerao aqui quando existirem registros.');
}
