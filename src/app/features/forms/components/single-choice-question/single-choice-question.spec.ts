import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleChoiceQuestion } from './single-choice-question';
import { Question, QuestionOptionValue } from '../../models/form.models';

describe('SingleChoiceQuestion', () => {
  let component: SingleChoiceQuestion;
  let fixture: ComponentFixture<SingleChoiceQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleChoiceQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleChoiceQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows only one selected option', () => {
    const values: QuestionOptionValue[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    component.choose('morning');
    component.choose('night');

    expect(values).toEqual(['morning', 'night']);
  });

  it('keeps real radio inputs and shows validation', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();

    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="radio"]');

    expect(radios.length).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Escolha uma alternativa');
  });
});

const question: Question = {
  id: 'q-single',
  title: 'Periodo',
  type: 'SINGLE_CHOICE',
  options: [
    { value: 'morning', label: 'Manha' },
    { value: 'night', label: 'Noite' },
  ],
  required: true,
};
