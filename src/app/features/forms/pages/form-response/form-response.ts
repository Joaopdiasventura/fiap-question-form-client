import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { AuthService } from '../../../auth/services/auth.service';
import { QuestionRenderer } from '../../components/question-renderer/question-renderer';
import { AnswerValue, FormResponseDto, Question, SubmitFormDto } from '../../models/form.models';
import { FormService } from '../../services/form.service';
import { SubmissionService } from '../../services/submission.service';

type ResponseFormGroup = FormGroup<Record<string, FormControl<AnswerValue | null>>>;

@Component({
  imports: [LoadingState, QuestionRenderer, ReactiveFormsModule],
  selector: 'app-form-response',
  styleUrl: './form-response.scss',
  templateUrl: './form-response.html',
})
export class FormResponse {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissions = inject(SubmissionService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formId = this.route.snapshot.paramMap.get('id') || '';

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');
  protected readonly formData = signal<FormResponseDto | null>(null);
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected responseForm: ResponseFormGroup = new FormGroup<Record<string, FormControl<AnswerValue | null>>>({});

  constructor() {
    const resolvedForm = this.route.snapshot.data['form'] as FormResponseDto | undefined;

    if (resolvedForm) {
      this.applyLoadedForm(resolvedForm);
    } else {
      this.error.set('Formulario nao encontrado');
    }
  }

  submit(): void {
    this.submitted.set(true);
    this.responseForm.markAllAsTouched();

    if (this.responseForm.invalid || this.submitting()) {
      return;
    }

    const form = this.formData();

    if (!form) {
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.submissions.submit(form.id, this.toPayload(form.questions)).pipe(
      finalize(() => this.submitting.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => void this.router.navigate(['/forms', form.id, 'success']),
      error: (error: Error) => this.error.set(error.message),
    });
  }

  back(): void {
    void this.router.navigate(['/admin/forms']);
  }

  private applyLoadedForm(form: FormResponseDto): void {
    if (form.status !== 'PUBLISHED') {
      this.error.set('Formulario indisponivel para respostas.');
      this.loading.set(false);
      return;
    }

    this.formData.set(form);
    this.responseForm = this.createResponseForm(form.questions);
    this.loading.set(false);
  }

  private createResponseForm(questions: Question[]): ResponseFormGroup {
    const controls: Record<string, FormControl<AnswerValue | null>> = {};

    questions.forEach((question) => {
      const initialValue: AnswerValue | null = question.type === 'MULTIPLE_CHOICE' ? [] : null;
      const validators = question.required ? [this.requiredAnswer()] : [];
      controls[question.id] = new FormControl(initialValue, { validators });
    });

    return new FormGroup(controls);
  }

  private toPayload(questions: Question[]): SubmitFormDto {
    return {
      answers: questions.map((question) => {
        const rawValue = this.responseForm.controls[question.id].value;
        return {
          questionId: question.id,
          value: this.normalizeValue(question, rawValue),
        };
      }),
    };
  }

  private normalizeValue(question: Question, value: AnswerValue | null): AnswerValue {
    if (question.type === 'NUMBER' || question.type === 'RATING') {
      return Number(value);
    }

    if (question.type === 'MULTIPLE_CHOICE') {
      return Array.isArray(value) ? value : [];
    }

    return typeof value === 'string' ? value : '';
  }

  private requiredAnswer(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as AnswerValue | null;
      const invalid = Array.isArray(value) ? value.length === 0 : value === null || value === '';
      return invalid ? { required: true } : null;
    };
  }
}
