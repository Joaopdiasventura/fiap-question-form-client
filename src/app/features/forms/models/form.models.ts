export type QuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'RATING'
  | 'DATE';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export const QUESTION_TYPES: readonly QuestionType[] = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'RATING',
  'DATE',
] as const;

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: FormStatus;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export type AnswerValue = Answer['value'];

export interface Submission {
  id: string;
  formId: string;
  answers: Answer[];
  submittedAt: Date;
}

export interface CreateFormDto {
  title: string;
  description: string;
  questions: Question[];
}

export interface UpdateFormDto extends CreateFormDto {
  status: FormStatus;
}

export interface SubmitFormDto {
  answers: Answer[];
}

export interface FormResponseDto extends Form {
  totalResponses: number;
}

export interface ChoiceStatistic {
  option: string;
  count: number;
  percent: number;
}

export interface TextStatistic {
  question: Question;
  type: 'TEXT' | 'TEXTAREA' | 'DATE';
  totalAnswered: number;
  responses: string[];
}

export interface NumberStatistic {
  question: Question;
  type: 'NUMBER';
  totalAnswered: number;
  average: number;
  min: number;
  max: number;
}

export interface ChoiceQuestionStatistic {
  question: Question;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  totalAnswered: number;
  options: ChoiceStatistic[];
}

export interface RatingStatistic {
  question: Question;
  type: 'RATING';
  totalAnswered: number;
  average: number;
  distribution: ChoiceStatistic[];
}

export type QuestionStatistic =
  | TextStatistic
  | NumberStatistic
  | ChoiceQuestionStatistic
  | RatingStatistic;

export interface PresentationResponseDto {
  form: FormResponseDto;
  responses: Submission[];
  statistics: QuestionStatistic[];
}
