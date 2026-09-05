import { Service, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  Answer,
  ChoiceStatistic,
  FormResponseDto,
  PresentationResponseDto,
  Question,
  QuestionStatistic,
  Submission,
} from '../models/form.models';
import { FormService } from './form.service';
import { SubmissionService } from './submission.service';

@Service()
export class PresentationService {
  private readonly forms = inject(FormService);
  private readonly submissions = inject(SubmissionService);

  generateData(formId: string): Observable<PresentationResponseDto> {
    return forkJoin({
      form: this.forms.findById(formId),
      responses: this.submissions.findByFormId(formId),
    }).pipe(
      map(({ form, responses }) => ({
        form,
        responses,
        statistics: form.questions.map((question) => this.createStatistic(question, responses)),
      })),
    );
  }

  private createStatistic(question: Question, submissions: Submission[]): QuestionStatistic {
    const values = submissions
      .map((submission) => submission.answers.find((answer) => answer.questionId === question.id))
      .filter((answer): answer is Answer => Boolean(answer))
      .map((answer) => answer.value)
      .filter((value) => Array.isArray(value) ? value.length > 0 : value !== '' && value !== null && value !== undefined);

    if (question.type === 'TEXT' || question.type === 'TEXTAREA') {
      return {
        question,
        type: question.type,
        totalAnswered: values.length,
        responses: values.filter((value): value is string => typeof value === 'string'),
      };
    }

    if (question.type === 'NUMBER') {
      const numbers = values.filter((value): value is number => typeof value === 'number');
      return {
        question,
        type: 'NUMBER',
        totalAnswered: numbers.length,
        average: this.average(numbers),
        min: numbers.length ? Math.min(...numbers) : 0,
        max: numbers.length ? Math.max(...numbers) : 0,
      };
    }

    if (question.type === 'RATING') {
      const numbers = values.filter((value): value is number => typeof value === 'number');
      return {
        question,
        type: 'RATING',
        totalAnswered: numbers.length,
        average: this.average(numbers),
        distribution: [1, 2, 3, 4, 5].map((rating) => this.choiceStat(String(rating), numbers.filter((value) => value === rating).length, numbers.length)),
      };
    }

    const flattened = values.flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is string => typeof value === 'string');

    return {
      question,
      type: question.type,
      totalAnswered: values.length,
      options: question.options.map((option) => this.choiceStat(option, flattened.filter((value) => value === option).length, values.length)),
    };
  }

  private average(values: number[]): number {
    if (!values.length) {
      return 0;
    }

    return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
  }

  private choiceStat(option: string, count: number, total: number): ChoiceStatistic {
    return {
      option,
      count,
      percent: total ? Number(((count / total) * 100).toFixed(1)) : 0,
    };
  }
}
