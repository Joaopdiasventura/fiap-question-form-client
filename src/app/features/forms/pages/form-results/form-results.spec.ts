import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { FormResults } from './form-results';
import { ExportService } from '../../services/export.service';
import { PresentationService } from '../../services/presentation.service';
import { PresentationResponseDto } from '../../models/form.models';

describe('FormResults', () => {
  let component: FormResults;
  let fixture: ComponentFixture<FormResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormResults],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', 'form-test']]) } } },
        { provide: PresentationService, useValue: { generateData: vi.fn().mockReturnValue(of(resultData)) } },
        { provide: ExportService, useValue: { download: vi.fn().mockReturnValue(of(undefined)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders statistics and empty response state', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent || '';

    expect(text).toContain('Sem respostas');
    expect(text).toContain('Nota');
  });
});

describe('FormResults loading', () => {
  it('renders loading while data is pending', async () => {
    await TestBed.configureTestingModule({
      imports: [FormResults],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', 'form-test']]) } } },
        { provide: PresentationService, useValue: { generateData: vi.fn().mockReturnValue(NEVER) } },
        { provide: ExportService, useValue: { download: vi.fn() } },
      ],
    }).compileComponents();

    const loadingFixture = TestBed.createComponent(FormResults);
    loadingFixture.detectChanges();

    expect((loadingFixture.nativeElement as HTMLElement).textContent).toContain('Gerando estatisticas');
  });
});

const resultData: PresentationResponseDto = {
  form: {
    id: 'form-test',
    title: 'Pesquisa',
    description: '',
    status: 'PUBLISHED',
    questions: [{ id: 'q1', title: 'Nota', type: 'RATING', options: [], required: true }],
    totalResponses: 0,
  },
  responses: [],
  statistics: [
    {
      question: { id: 'q1', title: 'Nota', type: 'RATING', options: [], required: true },
      type: 'RATING',
      totalAnswered: 0,
      average: 0,
      distribution: [
        { option: '1', count: 0, percent: 0 },
        { option: '2', count: 0, percent: 0 },
        { option: '3', count: 0, percent: 0 },
        { option: '4', count: 0, percent: 0 },
        { option: '5', count: 0, percent: 0 },
      ],
    },
  ],
};
