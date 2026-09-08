import { Component, input, output } from '@angular/core';
import { Toggle } from '../../../../shared/components/toggle/toggle';
import { Question, QuestionOptionValue } from '../../models/form.models';

@Component({
  imports: [Toggle],
  selector: 'app-multiple-choice-question',
  styleUrl: './multiple-choice-question.scss',
  templateUrl: './multiple-choice-question.html',
})
export class MultipleChoiceQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<string[]>([]);
  invalid = input(false);
  disabled = input(false);
  errorMessage = input<string | null>(null);
  valueChange = output<string[]>();
  touched = output<void>();

  optionId(optionIndex: number): string {
    return `${this.question().id}-toggle-${optionIndex}`;
  }

  checked(value: QuestionOptionValue): boolean {
    return typeof value === 'string' && this.value().includes(value);
  }

  toggle(value: QuestionOptionValue, checked: boolean): void {
    if (typeof value !== 'string') {
      return;
    }

    const values = new Set(this.value());

    if (checked) {
      values.add(value);
    } else {
      values.delete(value);
    }

    this.valueChange.emit([...values]);
    this.touched.emit();
  }
}
