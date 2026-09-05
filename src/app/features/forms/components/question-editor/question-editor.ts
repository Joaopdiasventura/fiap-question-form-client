import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QUESTION_TYPES, QuestionType } from '../../models/form.models';
import { QuestionFormGroup } from '../../models/form-editor.types';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-question-editor',
  styleUrl: './question-editor.scss',
  templateUrl: './question-editor.html',
})
export class QuestionEditor {
  question = input.required<QuestionFormGroup>();
  index = input.required<number>();
  canMoveUp = input(false);
  canMoveDown = input(false);
  remove = output<void>();
  moveUp = output<void>();
  moveDown = output<void>();

  protected readonly questionTypes = QUESTION_TYPES;

  options() {
    return this.question().controls.options;
  }

  addOption(): void {
    this.options().push(this.createOptionControl(''));
  }

  removeOption(index: number): void {
    this.options().removeAt(index);
  }

  onTypeChange(): void {
    const type = this.question().controls.type.value;

    if (!this.usesOptions(type)) {
      this.options().clear();
      return;
    }

    while (this.options().length < 2) {
      this.addOption();
    }
  }

  usesOptions(type = this.question().controls.type.value): boolean {
    return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';
  }

  typeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      TEXT: 'Texto curto',
      TEXTAREA: 'Texto longo',
      NUMBER: 'Numero',
      SINGLE_CHOICE: 'Escolha unica',
      MULTIPLE_CHOICE: 'Multipla escolha',
      RATING: 'Avaliacao 1 a 5',
    };

    return labels[type];
  }

  private createOptionControl(value: string) {
    return new FormControl(value, { nonNullable: true });
  }
}
