import { Component, input } from '@angular/core';
import {
  ChoiceQuestionStatistic,
  ChoiceStatistic,
  NumberStatistic,
  QuestionStatistic,
  RatingStatistic,
  TextStatistic,
} from '../../models/form.models';

@Component({
  imports: [],
  selector: 'app-question-statistics',
  styleUrl: './question-statistics.scss',
  templateUrl: './question-statistics.html',
})
export class QuestionStatistics {
  statistic = input.required<QuestionStatistic>();

  width(percent: number): string {
    return `${Math.min(100, Math.max(0, percent))}%`;
  }

  textResponses(): string[] {
    return (this.statistic() as TextStatistic).responses;
  }

  numberStat(): NumberStatistic {
    return this.statistic() as NumberStatistic;
  }

  choiceOptions(): ChoiceStatistic[] {
    return (this.statistic() as ChoiceQuestionStatistic).options;
  }

  ratingStat(): RatingStatistic {
    return this.statistic() as RatingStatistic;
  }
}
