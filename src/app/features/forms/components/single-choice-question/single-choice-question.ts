import { Component, computed, input, output } from '@angular/core';
import { Question, QuestionOptionValue } from '../../models/form.models';
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
  value = input<QuestionOptionValue | null>(null);
  invalid = input(false);
  disabled = input(false);
  errorMessage = input<string | null>(null);
  valueChange = output<QuestionOptionValue>();
  touched = output<void>();

  protected readonly groupName = computed(() => `single-choice-${this.question().id}`);

  optionId(optionIndex: number): string {
    return `${this.question().id}-option-${optionIndex}`;
  }

  choose(value: QuestionOptionValue, checked = true): void {
    if (this.disabled() || !checked) {
      return;
    }

    this.valueChange.emit(value);
    this.touched.emit();
  }
}
