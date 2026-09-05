import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuestionType } from './form.models';

export type QuestionFormGroup = FormGroup<{
  id: FormControl<string>;
  title: FormControl<string>;
  type: FormControl<QuestionType>;
  required: FormControl<boolean>;
  options: FormArray<FormControl<string>>;
}>;

export type EditorFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  status: FormControl<'DRAFT' | 'PUBLISHED' | 'CLOSED'>;
  questions: FormArray<QuestionFormGroup>;
}>;
