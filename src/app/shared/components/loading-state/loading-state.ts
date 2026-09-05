import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loading-state',
  styleUrl: './loading-state.scss',
  templateUrl: './loading-state.html',
})
export class LoadingState {
  label = input('Carregando dados');
}
