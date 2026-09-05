import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateQuestion } from './date-question';
import { Question } from '../../models/form.models';

describe('DateQuestion', () => {
  let component: DateQuestion;
  let fixture: ComponentFixture<DateQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(DateQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns date values as YYYY-MM-DD strings', () => {
    const values: Array<string | null> = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = '2026-09-05';
    input.dispatchEvent(new Event('input'));

    expect(values).toEqual(['2026-09-05']);
  });
});

const question: Question = {
  id: 'q-date',
  title: 'Data',
  type: 'DATE',
  options: [],
  required: true,
};
