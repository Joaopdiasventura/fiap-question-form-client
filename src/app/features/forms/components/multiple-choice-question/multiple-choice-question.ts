import { Component, input, output } from '@angular/core';
import { Toggle } from '../../../../shared/components/toggle/toggle';
import { Question } from '../../models/form.models';

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
  valueChange = output<string[]>();
  touched = output<void>();

  optionId(optionIndex: number): string {
    return `${this.question().id}-toggle-${optionIndex}`;
  }

  checked(option: string): boolean {
    return this.value().includes(option);
  }

  toggle(option: string, checked: boolean): void {
    const values = new Set(this.value());

    if (checked) {
      values.add(option);
    } else {
      values.delete(option);
    }

    this.valueChange.emit([...values]);
    this.touched.emit();
  }
}
