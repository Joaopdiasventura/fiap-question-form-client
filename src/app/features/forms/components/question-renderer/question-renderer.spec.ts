import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { QuestionRenderer } from './question-renderer';
import { AnswerValue, Question } from '../../models/form.models';

describe('QuestionRenderer', () => {
  let component: QuestionRenderer;
  let fixture: ComponentFixture<QuestionRenderer>;
  let responseForm: FormGroup<Record<string, FormControl<AnswerValue | null>>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionRenderer],
    }).compileComponents();

    responseForm = new FormGroup<Record<string, FormControl<AnswerValue | null>>>({
      q1: new FormControl<AnswerValue | null>(''),
    });
    fixture = TestBed.createComponent(QuestionRenderer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('form', responseForm);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the configured question type', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('input')).toBeTruthy();
  });

  it('updates multiple choice values', () => {
    fixture.componentRef.setInput('question', { ...question, type: 'MULTIPLE_CHOICE', options: ['A', 'B'] });

    component.setValue(['A']);

    expect(responseForm.controls['q1'].value).toEqual(['A']);
  });

  it('sets rating values as numbers', () => {
    fixture.componentRef.setInput('question', { ...question, type: 'RATING' });

    component.setValue(4);

    expect(responseForm.controls['q1'].value).toBe(4);
  });

  it('keeps real radio inputs for single choice semantics', () => {
    fixture.componentRef.setInput('question', { ...question, type: 'SINGLE_CHOICE', options: ['A', 'B'] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('input[type="radio"]')).toBeTruthy();
  });

  it('dispatches date questions', () => {
    fixture.componentRef.setInput('question', { ...question, type: 'DATE' });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('input[type="date"]')).toBeTruthy();
  });
});

const question: Question = {
  id: 'q1',
  title: 'Nome',
  type: 'TEXT',
  options: [],
  required: true,
};
