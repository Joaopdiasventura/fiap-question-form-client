import { Component, computed, input, output } from '@angular/core';
import { Question } from '../../models/form.models';
import { Toggle } from '../../../../shared/components/toggle/toggle';

@Component({
  imports: [Toggle],
  selector: 'app-single-choice-question',
  styleUrl: './single-choice-question.scss',
  templateUrl: './single-choice-question.html',
})
export class SingleChoiceQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<string | null>(null);
  invalid = input(false);
  disabled = input(false);
  valueChange = output<string>();
  touched = output<void>();

  protected readonly groupName = computed(() => `single-choice-${this.question().id}`);

  optionId(optionIndex: number): string {
    return `${this.question().id}-option-${optionIndex}`;
  }

  choose(option: string, checked = true): void {
    if (this.disabled() || !checked) {
      return;
    }

    this.valueChange.emit(option);
    this.touched.emit();
  }
}
