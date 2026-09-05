import { Component, input, output } from '@angular/core';
import { Question } from '../../models/form.models';

@Component({
  imports: [],
  selector: 'app-text-question',
  styleUrl: './text-question.scss',
  templateUrl: './text-question.html',
})
export class TextQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<string | null>(null);
  invalid = input(false);
  disabled = input(false);
  valueChange = output<string>();
  touched = output<void>();

  onInput(event: Event): void {
    if (this.disabled()) {
      return;
    }

    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
