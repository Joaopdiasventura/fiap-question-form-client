export type QuestionType =
  'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RATING';

export type QuestionOptionValue = string | boolean;

export interface QuestionOption {
  value: QuestionOptionValue;
  label: string;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  options: QuestionOption[];
  required: boolean;
  errorMessage?: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean;
}

export type AnswerValue = Answer['value'];
