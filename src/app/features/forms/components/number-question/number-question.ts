import { Component, input, output } from '@angular/core';
import { Question } from '../../models/form.models';

@Component({
  imports: [],
  selector: 'app-number-question',
  styleUrl: './number-question.scss',
  templateUrl: './number-question.html',
})
export class NumberQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<number | string | null>(null);
  invalid = input(false);
  disabled = input(false);
  valueChange = output<number | null>();
  touched = output<void>();

  onInput(event: Event): void {
    if (this.disabled()) {
      return;
    }

    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value === '' ? null : Number(value));
  }
}
