import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SubmissionService } from './submission.service';
import { FormService } from './form.service';

describe('SubmissionService', () => {
  let service: SubmissionService;
  let forms: FormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmissionService);
    forms = TestBed.inject(FormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generates a submission and preserves answer types', async () => {
    const submission = await firstValueFrom(service.submit('form-demo', {
      answers: [
        { questionId: 'q-text', value: 'Boa' },
        { questionId: 'q-number', value: 3 },
        { questionId: 'q-multiple', value: ['Aulas', 'Notas'] },
      ],
    }));
    const submissionTypes = `${typeof submission.answers[0].value}|${typeof submission.answers[1].value}|${Array.isArray(submission.answers[2].value)}`;

    expect(submissionTypes).toBe('string|number|true');
  });

  it('blocks submissions for forms that are not published', async () => {
    let message = '';

    const form = await firstValueFrom(forms.create({ title: 'Rascunho', description: '', questions: [] }));
    try {
      await firstValueFrom(service.submit(form.id, { answers: [] }));
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe('Formulario indisponivel para respostas');
  });
});
