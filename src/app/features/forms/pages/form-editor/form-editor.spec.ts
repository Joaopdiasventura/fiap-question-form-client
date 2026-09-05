import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { FormEditor } from './form-editor';
import { FormService } from '../../services/form.service';
import { EditorFormGroup } from '../../models/form-editor.types';

describe('FormEditor', () => {
  let component: FormEditor;
  let fixture: ComponentFixture<FormEditor>;
  let createSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    createSpy = vi.fn().mockReturnValue(of({
      id: 'form-new',
      title: 'Pesquisa',
      description: '',
      status: 'DRAFT',
      questions: [],
      totalResponses: 0,
    }));

    await TestBed.configureTestingModule({
      imports: [FormEditor],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } },
        {
          provide: FormService,
          useValue: {
            create: createSpy,
            update: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditor);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds, removes and moves questions', () => {
    component.addQuestion({ title: 'Segunda' });
    component.moveQuestion(1, -1);

    const form = getEditorForm(component);

    expect(form.controls.questions.length).toBe(2);
    expect(form.controls.questions.at(0).controls.title.value).toBe('Segunda');

    component.removeQuestion(0);

    expect(form.controls.questions.length).toBe(1);
  });

  it('blocks save for choice questions with fewer than two options', () => {
    const form = getEditorForm(component);
    form.controls.title.setValue('Pesquisa');
    form.controls.questions.at(0).controls.title.setValue('Periodo');
    form.controls.questions.at(0).controls.type.setValue('SINGLE_CHOICE');
    form.controls.questions.at(0).controls.options.clear();

    component.save();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('saves a sanitized payload', () => {
    const form = getEditorForm(component);
    form.controls.title.setValue(' Pesquisa ');
    form.controls.description.setValue(' Descricao ');
    form.controls.questions.at(0).controls.title.setValue(' Idade ');
    form.controls.questions.at(0).controls.type.setValue('NUMBER');

    component.save();

    expect(createSpy).toHaveBeenCalledWith({
      title: 'Pesquisa',
      description: 'Descricao',
      status: 'DRAFT',
      questions: [
        {
          id: '',
          title: 'Idade',
          type: 'NUMBER',
          required: false,
          options: [],
        },
      ],
    });
  });

  it('saves date questions without stale options', () => {
    const form = getEditorForm(component);
    form.controls.title.setValue('Pesquisa');
    form.controls.questions.at(0).controls.title.setValue('Data da resposta');
    form.controls.questions.at(0).controls.type.setValue('DATE');
    form.controls.questions.at(0).controls.options.push(new FormControl('Opcao antiga', { nonNullable: true }));

    component.save();

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      questions: [
        expect.objectContaining({
          type: 'DATE',
          options: [],
        }),
      ],
    }));
  });
});

function getEditorForm(component: FormEditor): EditorFormGroup {
  return (component as unknown as { editorForm: EditorFormGroup }).editorForm;
}
