import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { FormResponse } from './form-response';
import { FormService } from '../../services/form.service';
import { SubmissionService } from '../../services/submission.service';
import { AnswerValue, FormResponseDto } from '../../models/form.models';
import { FormControl, FormGroup } from '@angular/forms';

describe('FormResponse', () => {
  let component: FormResponse;
  let fixture: ComponentFixture<FormResponse>;
  let submitSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    submitSpy = vi.fn().mockReturnValue(of({ id: 's1', formId: 'form-test', answers: [], submittedAt: new Date() }));

    await TestBed.configureTestingModule({
      imports: [FormResponse],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', 'form-test']]) } } },
        { provide: FormService, useValue: { findById: vi.fn().mockReturnValue(of(formDto)) } },
        { provide: SubmissionService, useValue: { submit: submitSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormResponse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders supported question types', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('textarea')).toBeTruthy();
    expect(compiled.querySelector('input[type="number"]')).toBeTruthy();
    expect(compiled.querySelector('[role="radiogroup"]')).toBeTruthy();
  });

  it('validates required questions before submit', () => {
    component.submit();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('submits a SubmitFormDto and blocks double submit while pending', () => {
    submitSpy.mockReturnValue(NEVER);
    const responseForm = getResponseForm(component);
    responseForm.controls['qText'].setValue('Ana');
    responseForm.controls['qNumber'].setValue('2');
    responseForm.controls['qSingle'].setValue('Noite');
    responseForm.controls['qMultiple'].setValue(['Aulas']);
    responseForm.controls['qRating'].setValue(5);

    component.submit();
    component.submit();

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith('form-test', {
      answers: [
        { questionId: 'qText', value: 'Ana' },
        { questionId: 'qTextarea', value: '' },
        { questionId: 'qNumber', value: 2 },
        { questionId: 'qSingle', value: 'Noite' },
        { questionId: 'qMultiple', value: ['Aulas'] },
        { questionId: 'qRating', value: 5 },
      ],
    });
  });
});

const formDto: FormResponseDto = {
  id: 'form-test',
  title: 'Pesquisa',
  description: 'Descricao',
  status: 'PUBLISHED',
  totalResponses: 0,
  questions: [
    { id: 'qText', title: 'Nome', type: 'TEXT', options: [], required: true },
    { id: 'qTextarea', title: 'Comentario', type: 'TEXTAREA', options: [], required: false },
    { id: 'qNumber', title: 'Usos', type: 'NUMBER', options: [], required: true },
    { id: 'qSingle', title: 'Periodo', type: 'SINGLE_CHOICE', options: ['Manha', 'Noite'], required: true },
    { id: 'qMultiple', title: 'Recursos', type: 'MULTIPLE_CHOICE', options: ['Aulas', 'Notas'], required: false },
    { id: 'qRating', title: 'Nota', type: 'RATING', options: [], required: true },
  ],
};

function getResponseForm(component: FormResponse): FormGroup<Record<string, FormControl<AnswerValue | null>>> {
  return (component as unknown as { responseForm: FormGroup<Record<string, FormControl<AnswerValue | null>>> }).responseForm;
}
