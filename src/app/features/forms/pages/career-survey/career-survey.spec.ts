import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { CareerSurvey } from './career-survey';

interface SurveyFormModel {
  participationConsent: boolean;
  academicUseConsent: boolean;
  name: string;
  email: string;
  currentSituation: string;
  interestArea: string;
  experienceLevel: string;
  technologies: string[];
  marketConfidence: number | null;
  careerPriorities: string[];
  recommendationScore: number | null;
  age: number | null;
  salaryExpectation: number | null;
  usesAi: boolean;
  additionalComments: string;
}

interface CareerSurveyTestApi {
  form: FieldTree<SurveyFormModel>;
  formModel: WritableSignal<SurveyFormModel>;
  dragPreview(): { label: string; width: number; height: number; x: number; y: number } | null;
  shareStatus(): 'idle' | 'copied' | 'error';
  submit(event: Event): void;
  shareSurvey(): Promise<void>;
  copySurveyLink(): Promise<void>;
  continueFromSection(): void;
  goToSection(index: number): void;
  movePriority(index: number, direction: -1 | 1): void;
  startPriorityDrag(
    event: PointerEvent,
    value: string,
    listElement: HTMLElement,
    itemElement: HTMLElement,
  ): void;
  currentSectionIndex(): number;
  highestAvailableSectionIndex(): number;
}

describe('CareerSurvey', () => {
  let fixture: ComponentFixture<CareerSurvey>;
  let component: CareerSurveyTestApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerSurvey],
    }).compileComponents();

    fixture = TestBed.createComponent(CareerSurvey);
    component = fixture.componentInstance as unknown as CareerSurveyTestApi;
    fixture.detectChanges();
  });

  it('renders the academic survey title', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';

    expect(text).toContain('Mercado de TI em 2026');
  });

  it('does not log when consent or required fields are invalid', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const event = new Event('submit');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.submit(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs one clean object when the survey is valid', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    patchFormValues(component, validFormValues());

    component.submit(new Event('submit'));

    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith({
      participationConsent: true,
      academicUseConsent: true,
      name: 'Joao',
      email: 'joao@example.com',
      currentSituation: 'student',
      interestArea: 'data',
      experienceLevel: 'upToTwoYears',
      technologies: ['python', 'sql'],
      marketConfidence: 4,
      careerPriorities: ['learning', 'salary', 'stability', 'remoteWork', 'purpose'],
      recommendationScore: 9,
      age: 28,
      salaryExpectation: 7000,
      usesAi: true,
      additionalComments: 'Boa pesquisa',
    });
    expect(component.currentSectionIndex()).toBe(3);
  });

  it('shows the thank-you section and scrolls it into view after valid submit', async () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    patchFormValues(component, validFormValues());
    component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    await nextFrame();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';

    expect(text).toContain('Obrigado por participar!');
    expect(text).toContain('Compartilhar pesquisa');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('validates only the current section before moving forward', () => {
    component.continueFromSection();

    expect(component.currentSectionIndex()).toBe(0);
    expect(component.highestAvailableSectionIndex()).toBe(0);

    patchFormValues(component, {
      participationConsent: true,
      academicUseConsent: true,
    });
    component.continueFromSection();

    expect(component.currentSectionIndex()).toBe(1);
    expect(component.highestAvailableSectionIndex()).toBe(1);
  });

  it('keeps values when navigating back to completed sections', () => {
    patchFormValues(component, {
      participationConsent: true,
      academicUseConsent: true,
    });
    component.continueFromSection();
    patchFormValues(component, { name: 'Joao' });
    component.goToSection(0);
    component.goToSection(1);

    expect(component.currentSectionIndex()).toBe(1);
    expect(component.form.name().value()).toBe('Joao');
  });

  it('scrolls the newly selected section into view after navigation', async () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    patchFormValues(component, {
      participationConsent: true,
      academicUseConsent: true,
    });
    component.continueFromSection();
    fixture.detectChanges();
    await fixture.whenStable();
    await nextFrame();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const restoreShare = mockNavigatorProperty('share', share);
    const restoreClipboard = mockNavigatorProperty('clipboard', { writeText });

    await component.shareSurvey();

    expect(share).toHaveBeenCalledWith({
      title: 'Pesquisa de Carreira no Mercado de TI em 2026',
      text: 'Participe da pesquisa acadêmica da FIAP sobre carreira e mercado de TI em 2026.',
      url: location.href,
    });
    expect(writeText).not.toHaveBeenCalled();

    restoreShare();
    restoreClipboard();
  });

  it('copies the survey link when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const restoreShare = mockNavigatorProperty('share', undefined);
    const restoreClipboard = mockNavigatorProperty('clipboard', { writeText });

    await component.shareSurvey();

    expect(writeText).toHaveBeenCalledWith(location.href);
    expect(component.shareStatus()).toBe('copied');

    restoreShare();
    restoreClipboard();
  });

  it('reorders career priorities with the accessible controls', () => {
    component.movePriority(0, 1);

    expect(component.form.careerPriorities().value()).toEqual([
      'remoteWork',
      'salary',
      'purpose',
      'stability',
      'learning',
    ]);
  });

  it('reorders career priorities with mouse pointer drag', () => {
    const list = createPriorityList(['salary', 'remoteWork', 'purpose', 'stability', 'learning']);

    component.startPriorityDrag(
      createPointerEvent('pointerdown', { pointerType: 'mouse', clientX: 12, clientY: 5 }),
      'salary',
      list,
      list.children[0] as HTMLElement,
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 400 }),
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 400 }),
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 400 }),
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 400 }),
    );

    expect(component.dragPreview()).toEqual({
      label: 'Salário',
      width: 300,
      height: 50,
      x: 0,
      y: 395,
    });

    document.dispatchEvent(
      createPointerEvent('pointerup', { pointerType: 'mouse', clientX: 12, clientY: 400 }),
    );

    expect(component.form.careerPriorities().value()).toEqual([
      'remoteWork',
      'purpose',
      'stability',
      'learning',
      'salary',
    ]);
  });

  it('does not reorder before the dragged item center crosses the next item midpoint', () => {
    const list = createPriorityList(['salary', 'remoteWork', 'purpose', 'stability', 'learning']);

    component.startPriorityDrag(
      createPointerEvent('pointerdown', { pointerType: 'mouse', clientX: 12, clientY: 5 }),
      'salary',
      list,
      list.children[0] as HTMLElement,
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 64 }),
    );

    expect(component.form.careerPriorities().value()).toEqual([
      'salary',
      'remoteWork',
      'purpose',
      'stability',
      'learning',
    ]);

    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'mouse', clientX: 12, clientY: 66 }),
    );

    expect(component.form.careerPriorities().value()).toEqual([
      'remoteWork',
      'salary',
      'purpose',
      'stability',
      'learning',
    ]);

    document.dispatchEvent(
      createPointerEvent('pointerup', { pointerType: 'mouse', clientX: 12, clientY: 36 }),
    );
  });

  it('reorders career priorities with touch pointer drag', () => {
    const list = createPriorityList(['salary', 'remoteWork', 'purpose', 'stability', 'learning']);

    component.startPriorityDrag(
      createPointerEvent('pointerdown', { pointerType: 'touch', clientX: 12, clientY: 245 }),
      'learning',
      list,
      list.children[4] as HTMLElement,
    );
    document.dispatchEvent(
      createPointerEvent('pointermove', { pointerType: 'touch', clientX: 12, clientY: 0 }),
    );
    document.dispatchEvent(
      createPointerEvent('pointercancel', { pointerType: 'touch', clientX: 12, clientY: 0 }),
    );

    expect(component.form.careerPriorities().value()).toEqual([
      'salary',
      'remoteWork',
      'purpose',
      'learning',
      'stability',
    ]);
  });
});

function patchFormValues(component: CareerSurveyTestApi, value: Partial<SurveyFormModel>): void {
  component.formModel.update((current) => ({ ...current, ...value }));
}

function validFormValues(): SurveyFormModel {
  return {
    participationConsent: true,
    academicUseConsent: true,
    name: 'Joao',
    email: 'joao@example.com',
    currentSituation: 'student',
    interestArea: 'data',
    experienceLevel: 'upToTwoYears',
    technologies: ['python', 'sql'],
    marketConfidence: 4,
    careerPriorities: ['learning', 'salary', 'stability', 'remoteWork', 'purpose'],
    recommendationScore: 9,
    age: 28,
    salaryExpectation: 7000,
    usesAi: true,
    additionalComments: 'Boa pesquisa',
  };
}

function mockNavigatorProperty(property: keyof Navigator, value: unknown): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, property);

  Object.defineProperty(navigator, property, {
    configurable: true,
    value,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(navigator, property, descriptor);
      return;
    }

    Reflect.deleteProperty(navigator, property);
  };
}

function createPriorityList(values: string[]): HTMLElement {
  const list = document.createElement('ol');

  values.forEach((value, index) => {
    const item = document.createElement('li');
    item.setAttribute('data-priority-id', value);
    Object.defineProperties(item, {
      offsetHeight: { value: 50 },
      offsetTop: { value: index * 60 },
    });
    item.getBoundingClientRect = () =>
      ({
        x: 0,
        y: index * 60,
        width: 300,
        height: 50,
        top: index * 60,
        right: 300,
        bottom: index * 60 + 50,
        left: 0,
        toJSON: () => undefined,
      }) satisfies DOMRect;
    list.append(item);
  });

  return list;
}

function createPointerEvent(
  type: string,
  options: {
    pointerType: 'mouse' | 'touch';
    clientX: number;
    clientY: number;
    pointerId?: number;
    button?: number;
  },
): PointerEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;

  Object.defineProperties(event, {
    button: { value: options.button ?? 0 },
    clientX: { value: options.clientX },
    clientY: { value: options.clientY },
    pointerId: { value: options.pointerId ?? 1 },
    pointerType: { value: options.pointerType },
  });

  return event;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
