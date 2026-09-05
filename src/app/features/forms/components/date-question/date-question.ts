import { Component, input, output } from '@angular/core';
import { Question } from '../../models/form.models';

@Component({
  imports: [],
  selector: 'app-date-question',
  styleUrl: './date-question.scss',
  templateUrl: './date-question.html',
})
export class DateQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<string | null>(null);
  invalid = input(false);
  disabled = input(false);
  valueChange = output<string | null>();
  touched = output<void>();

  onInput(event: Event): void {
    if (this.disabled()) {
      return;
    }

    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value || null);
  }
}
