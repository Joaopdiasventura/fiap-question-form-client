import { Component, input, output, signal } from '@angular/core';
import { Question } from '../../models/form.models';

@Component({
  imports: [],
  selector: 'app-rating-question',
  styleUrl: './rating-question.scss',
  templateUrl: './rating-question.html',
})
export class RatingQuestion {
  question = input.required<Question>();
  index = input(0);
  value = input<number | null>(null);
  invalid = input(false);
  disabled = input(false);
  errorMessage = input<string | null>(null);
  valueChange = output<number>();
  touched = output<void>();

  protected readonly stars = [1, 2, 3, 4, 5] as const;
  protected readonly preview = signal<number | null>(null);

  active(star: number): boolean {
    return star <= (this.preview() ?? this.value() ?? 0);
  }

  select(value: number): void {
    if (this.disabled()) {
      return;
    }

    this.valueChange.emit(value);
    this.touched.emit();
  }

  onKeydown(event: KeyboardEvent, star: number): void {
    if (this.disabled()) {
      return;
    }

    const current = this.value() ?? star;
    const keyActions: Record<string, number> = {
      ArrowRight: Math.min(5, current + 1),
      ArrowUp: Math.min(5, current + 1),
      ArrowLeft: Math.max(1, current - 1),
      ArrowDown: Math.max(1, current - 1),
      Home: 1,
      End: 5,
      Enter: star,
      ' ': star,
    };
    const nextValue = keyActions[event.key];

    if (nextValue) {
      event.preventDefault();
      this.select(nextValue);
    }
  }
}
