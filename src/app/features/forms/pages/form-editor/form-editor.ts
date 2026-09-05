import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppHeader } from '../../../../shared/components/app-header/app-header';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { QuestionEditor } from '../../components/question-editor/question-editor';
import { EditorFormGroup, QuestionFormGroup } from '../../models/form-editor.types';
import { FormResponseDto, FormStatus, Question, QuestionType } from '../../models/form.models';
import { FormService } from '../../services/form.service';

@Component({
  imports: [AppHeader, LoadingState, QuestionEditor, ReactiveFormsModule, RouterLink],
  selector: 'app-form-editor',
  styleUrl: './form-editor.scss',
  templateUrl: './form-editor.html',
})
export class FormEditor {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly forms = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formId = this.route.snapshot.paramMap.get('id');

  protected readonly loading = signal(Boolean(this.formId));
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly saved = signal('');
  protected readonly isEdit = computed(() => Boolean(this.formId));
  protected readonly editorForm: EditorFormGroup = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    status: new FormControl<FormStatus>('DRAFT', { nonNullable: true }),
    questions: new FormArray<QuestionFormGroup>([]),
  });

  constructor() {
    if (this.formId) {
      this.load(this.formId);
    } else {
      this.addQuestion();
    }
  }

  questions() {
    return this.editorForm.controls.questions;
  }

  addQuestion(question?: Partial<Question>): void {
    this.questions().push(this.createQuestionGroup(question));
  }

  removeQuestion(index: number): void {
    this.questions().removeAt(index);

    if (!this.questions().length) {
      this.addQuestion();
    }
  }

  moveQuestion(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= this.questions().length) {
      return;
    }

    const control = this.questions().at(index);
    this.questions().removeAt(index);
    this.questions().insert(nextIndex, control);
  }

  save(): void {
    this.error.set('');
    this.saved.set('');
    this.editorForm.markAllAsTouched();

    if (this.editorForm.invalid || this.hasInvalidChoiceOptions()) {
      this.error.set('Revise os campos obrigatorios e as opcoes das perguntas.');
      return;
    }

    const dto = this.toPayload();
    this.saving.set(true);
    const request = this.formId ? this.forms.update(this.formId, dto) : this.forms.create(dto);

    request.pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (form) => this.handleSaved(form),
      error: (error: Error) => this.error.set(error.message),
    });
  }

  optionValidationMessage(): string {
    return this.hasInvalidChoiceOptions() ? 'Perguntas de escolha precisam ter pelo menos duas opcoes preenchidas.' : '';
  }

  private load(id: string): void {
    this.loading.set(true);
    this.forms.findById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (form) => {
        this.editorForm.controls.title.setValue(form.title);
        this.editorForm.controls.description.setValue(form.description);
        this.editorForm.controls.status.setValue(form.status);
        this.questions().clear();
        form.questions.forEach((question) => this.addQuestion(question));
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  private handleSaved(form: FormResponseDto): void {
    this.saved.set('Formulario salvo com sucesso.');

    if (!this.formId) {
      void this.router.navigate(['/admin/forms', form.id, 'edit']);
    }
  }

  private createQuestionGroup(question?: Partial<Question>): QuestionFormGroup {
    return new FormGroup({
      id: new FormControl(question?.id ?? '', { nonNullable: true }),
      title: new FormControl(question?.title ?? '', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl<QuestionType>(question?.type ?? 'TEXT', { nonNullable: true }),
      required: new FormControl(question?.required ?? false, { nonNullable: true }),
      options: new FormArray<FormControl<string>>((question?.options ?? []).map((option) => new FormControl(option, { nonNullable: true }))),
    });
  }

  private hasInvalidChoiceOptions(): boolean {
    return this.questions().controls.some((question) => {
      const type = question.controls.type.value;
      const options = question.controls.options.controls.map((option) => option.value.trim()).filter(Boolean);
      return (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && options.length < 2;
    });
  }

  private toPayload() {
    const value = this.editorForm.getRawValue();

    return {
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      questions: value.questions.map((question) => ({
        id: question.id,
        title: question.title.trim(),
        type: question.type,
        required: question.required,
        options: question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE'
          ? question.options.map((option) => option.trim()).filter(Boolean)
          : [],
      })),
    };
  }
}
