import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaQuestion } from './textarea-question';
import { Question } from '../../models/form.models';

describe('TextareaQuestion', () => {
  let component: TextareaQuestion;
  let fixture: ComponentFixture<TextareaQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders and emits textarea values', () => {
    const values: string[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const textarea = (fixture.nativeElement as HTMLElement).querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Resposta longa';
    textarea.dispatchEvent(new Event('input'));

    expect(values).toEqual(['Resposta longa']);
  });
});

const question: Question = {
  id: 'q-textarea',
  title: 'Comentario',
  type: 'TEXTAREA',
  options: [],
  required: false,
};
