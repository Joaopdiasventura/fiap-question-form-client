import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PresentationService } from './presentation.service';
import { SubmissionService } from './submission.service';

describe('PresentationService', () => {
  let service: PresentationService;
  let submissions: SubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentationService);
    submissions = TestBed.inject(SubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calculates distributions, averages and percentages', async () => {
    await firstValueFrom(submissions.submit('form-demo', {
      answers: [
        { questionId: 'q-text', value: 'Rapida' },
        { questionId: 'q-number', value: 2 },
        { questionId: 'q-single', value: 'Noite' },
        { questionId: 'q-multiple', value: ['Aulas', 'Notas'] },
        { questionId: 'q-rating', value: 4 },
      ],
    }));
    await firstValueFrom(submissions.submit('form-demo', {
      answers: [
        { questionId: 'q-text', value: 'Clara' },
        { questionId: 'q-number', value: 4 },
        { questionId: 'q-single', value: 'Noite' },
        { questionId: 'q-multiple', value: ['Aulas'] },
        { questionId: 'q-rating', value: 2 },
      ],
    }));

    let numberAverage = 0;
    let singlePercent = 0;
    let ratingAverage = 0;
    const data = await firstValueFrom(service.generateData('form-demo'));
    const numberStat = data.statistics.find((statistic) => statistic.question.id === 'q-number');
    const singleStat = data.statistics.find((statistic) => statistic.question.id === 'q-single');
    const ratingStat = data.statistics.find((statistic) => statistic.question.id === 'q-rating');
    numberAverage = numberStat?.type === 'NUMBER' ? numberStat.average : 0;
    singlePercent = singleStat?.type === 'SINGLE_CHOICE' ? singleStat.options.find((item) => item.option === 'Noite')?.percent ?? 0 : 0;
    ratingAverage = ratingStat?.type === 'RATING' ? ratingStat.average : 0;

    expect(numberAverage).toBe(3);
    expect(singlePercent).toBe(100);
    expect(ratingAverage).toBe(3);
  });
});
