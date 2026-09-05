import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuestionEditor } from './question-editor';
import { QuestionFormGroup } from '../../models/form-editor.types';
import { QuestionType } from '../../models/form.models';

describe('QuestionEditor', () => {
  let component: QuestionEditor;
  let fixture: ComponentFixture<QuestionEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionEditor);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', createQuestion());
    fixture.componentRef.setInput('index', 0);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds two options when switching to a choice type', () => {
    const question = createQuestion();
    fixture.componentRef.setInput('question', question);
    question.controls.type.setValue('SINGLE_CHOICE');

    component.onTypeChange();

    expect(question.controls.options.length).toBe(2);
  });
});

function createQuestion(): QuestionFormGroup {
  return new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    title: new FormControl('Pergunta', { nonNullable: true }),
    type: new FormControl<QuestionType>('TEXT', { nonNullable: true }),
    required: new FormControl(false, { nonNullable: true }),
    options: new FormArray<FormControl<string>>([]),
  });
}
