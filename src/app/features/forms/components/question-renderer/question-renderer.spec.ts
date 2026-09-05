import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { QuestionRenderer } from './question-renderer';
import { AnswerValue, Question } from '../../models/form.models';

describe('QuestionRenderer', () => {
  let component: QuestionRenderer;
  let fixture: ComponentFixture<QuestionRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionRenderer],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionRenderer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('form', form);
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

    component.toggleOption('A', true);

    expect(form.controls['q1'].value).toEqual(['A']);
  });
});

const question: Question = {
  id: 'q1',
  title: 'Nome',
  type: 'TEXT',
  options: [],
  required: true,
};

const form = new FormGroup<Record<string, FormControl<AnswerValue | null>>>({
  q1: new FormControl<AnswerValue | null>(''),
});
