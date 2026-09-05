import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AnswerValue, Question } from '../../models/form.models';

type ResponseFormGroup = FormGroup<Record<string, FormControl<AnswerValue | null>>>;

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-question-renderer',
  styleUrl: './question-renderer.scss',
  templateUrl: './question-renderer.html',
})
export class QuestionRenderer {
  question = input.required<Question>();
  form = input.required<ResponseFormGroup>();
  submitted = input(false);

  control() {
    return this.form().controls[this.question().id];
  }

  showError(): boolean {
    const control = this.control();
    return Boolean(control?.invalid && (control.touched || this.submitted()));
  }

  selectedOptions(): string[] {
    const value = this.control()?.value;
    return Array.isArray(value) ? value : [];
  }

  toggleOption(option: string, checked: boolean): void {
    const values = new Set(this.selectedOptions());

    if (checked) {
      values.add(option);
    } else {
      values.delete(option);
    }

    this.control()?.setValue([...values]);
    this.control()?.markAsTouched();
  }

  setRating(value: number): void {
    this.control()?.setValue(value);
    this.control()?.markAsTouched();
  }

  onRatingKeydown(event: KeyboardEvent, value: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setRating(value);
    }
  }
}
