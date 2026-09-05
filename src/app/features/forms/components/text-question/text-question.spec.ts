import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextQuestion } from './text-question';
import { Question } from '../../models/form.models';

describe('TextQuestion', () => {
  let component: TextQuestion;
  let fixture: ComponentFixture<TextQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(TextQuestion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders and emits text values', () => {
    const values: string[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'FIAP';
    input.dispatchEvent(new Event('input'));

    expect(values).toEqual(['FIAP']);
  });

  it('shows required validation and blocks disabled interaction', () => {
    const values: string[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'Nao emitir';
    input.dispatchEvent(new Event('input'));

    expect(input.disabled).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Responda esta pergunta obrigatoria');
    expect(values).toEqual([]);
  });
});

const question: Question = {
  id: 'q-text',
  title: 'Nome',
  type: 'TEXT',
  options: [],
  required: true,
};
