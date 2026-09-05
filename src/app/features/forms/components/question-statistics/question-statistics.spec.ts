import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionStatistics } from './question-statistics';
import { QuestionStatistic } from '../../models/form.models';

describe('QuestionStatistics', () => {
  let component: QuestionStatistics;
  let fixture: ComponentFixture<QuestionStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionStatistics],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionStatistics);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('statistic', statistic);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('limits percentage width between zero and one hundred', () => {
    expect(component.width(140)).toBe('100%');
    expect(component.width(-5)).toBe('0%');
  });
});

const statistic: QuestionStatistic = {
  question: {
    id: 'q1',
    title: 'Nota',
    type: 'RATING',
    options: [],
    required: true,
  },
  type: 'RATING',
  totalAnswered: 1,
  average: 5,
  distribution: [
    { option: '1', count: 0, percent: 0 },
    { option: '2', count: 0, percent: 0 },
    { option: '3', count: 0, percent: 0 },
    { option: '4', count: 0, percent: 0 },
    { option: '5', count: 1, percent: 100 },
  ],
};
