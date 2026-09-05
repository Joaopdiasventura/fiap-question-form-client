import { Component, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateQuestion } from '../date-question/date-question';
import { MultipleChoiceQuestion } from '../multiple-choice-question/multiple-choice-question';
import { NumberQuestion } from '../number-question/number-question';
import { RatingQuestion } from '../rating-question/rating-question';
import { SingleChoiceQuestion } from '../single-choice-question/single-choice-question';
import { TextQuestion } from '../text-question/text-question';
import { TextareaQuestion } from '../textarea-question/textarea-question';
import { AnswerValue, Question } from '../../models/form.models';

type ResponseFormGroup = FormGroup<Record<string, FormControl<AnswerValue | null>>>;

@Component({
  imports: [
    DateQuestion,
    MultipleChoiceQuestion,
    NumberQuestion,
    RatingQuestion,
    SingleChoiceQuestion,
    TextQuestion,
    TextareaQuestion,
  ],
  selector: 'app-question-renderer',
  styleUrl: './question-renderer.scss',
  templateUrl: './question-renderer.html',
})
export class QuestionRenderer {
  question = input.required<Question>();
  index = input(0);
  form = input.required<ResponseFormGroup>();
  submitted = input(false);

  control() {
    return this.form().controls[this.question().id];
  }

  showError(): boolean {
    const control = this.control();
    return Boolean(control?.invalid && (control.touched || this.submitted()));
  }

  value(): AnswerValue | null {
    return this.control()?.value ?? null;
  }

  stringValue(): string | null {
    const value = this.value();
    return typeof value === 'string' ? value : null;
  }

  numberValue(): number | null {
    const value = this.value();
    return typeof value === 'number' ? value : null;
  }

  selectedOptions(): string[] {
    const value = this.control()?.value;
    return Array.isArray(value) ? value : [];
  }

  disabled(): boolean {
    return Boolean(this.control()?.disabled);
  }

  setValue(value: AnswerValue | null): void {
    this.control()?.setValue(value);
    this.control()?.markAsTouched();
  }

  markTouched(): void {
    this.control()?.markAsTouched();
  }
}
