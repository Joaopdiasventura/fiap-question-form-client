import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultipleChoiceQuestion } from './multiple-choice-question';
import { Question } from '../../models/form.models';

describe('MultipleChoiceQuestion', () => {
  let component: MultipleChoiceQuestion;
  let fixture: ComponentFixture<MultipleChoiceQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(MultipleChoiceQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('value', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows independent multiple toggles', () => {
    const values: string[][] = [];
    component.valueChange.subscribe((value) => values.push(value));

    component.toggle('classes', true);
    fixture.componentRef.setInput('value', ['classes']);
    component.toggle('grades', true);
    fixture.componentRef.setInput('value', ['classes', 'grades']);
    component.toggle('classes', false);

    expect(values).toEqual([['classes'], ['classes', 'grades'], ['grades']]);
  });

  it('renders reusable switch toggles with real checkboxes', () => {
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="checkbox"]').length,
    ).toBe(2);
  });
});

const question: Question = {
  id: 'q-multiple',
  title: 'Recursos',
  type: 'MULTIPLE_CHOICE',
  options: [
    { value: 'classes', label: 'Aulas' },
    { value: 'grades', label: 'Notas' },
  ],
  required: false,
};
