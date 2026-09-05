import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingQuestion } from './rating-question';
import { Question } from '../../models/form.models';

describe('RatingQuestion', () => {
  let component: RatingQuestion;
  let fixture: ComponentFixture<RatingQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns values between one and five', () => {
    const values: number[] = [];
    component.valueChange.subscribe((value) => values.push(value));

    component.select(3);

    expect(values).toEqual([3]);
  });

  it('fills selected stars', () => {
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';

    expect((text.match(/★/g) || []).length).toBe(3);
    expect((text.match(/☆/g) || []).length).toBe(2);
  });

  it('supports keyboard selection and disabled state', () => {
    const values: number[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'End' }), 1);
    fixture.componentRef.setInput('disabled', true);
    component.select(2);

    expect(values).toEqual([5]);
  });
});

const question: Question = {
  id: 'q-rating',
  title: 'Nota',
  type: 'RATING',
  options: [],
  required: true,
};
