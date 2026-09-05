import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberQuestion } from './number-question';
import { Question } from '../../models/form.models';

describe('NumberQuestion', () => {
  let component: NumberQuestion;
  let fixture: ComponentFixture<NumberQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns number values', () => {
    const values: Array<number | null> = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));

    expect(values).toEqual([42]);
  });
});

const question: Question = {
  id: 'q-number',
  title: 'Idade',
  type: 'NUMBER',
  options: [],
  required: true,
};
