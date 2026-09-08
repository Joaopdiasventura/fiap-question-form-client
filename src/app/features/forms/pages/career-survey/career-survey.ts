import {
  AfterRenderRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FieldTree,
  email,
  form as createSignalForm,
  max,
  min,
  required,
  requiredError,
  schema,
  validate,
} from '@angular/forms/signals';
import { MultipleChoiceQuestion } from '../../components/multiple-choice-question/multiple-choice-question';
import { NumberQuestion } from '../../components/number-question/number-question';
import { RatingQuestion } from '../../components/rating-question/rating-question';
import { SingleChoiceQuestion } from '../../components/single-choice-question/single-choice-question';
import { TextQuestion } from '../../components/text-question/text-question';
import { TextareaQuestion } from '../../components/textarea-question/textarea-question';
import { Question, QuestionOption, QuestionOptionValue } from '../../models/form.models';

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

interface SurveyAnswers extends Omit<
  SurveyFormModel,
  'marketConfidence' | 'recommendationScore' | 'age' | 'salaryExpectation'
> {
  marketConfidence: number;
  recommendationScore: number;
  age: number;
  salaryExpectation: number;
}

type SurveyControlName = keyof SurveyFormModel;
type SurveyField =
  FieldTree<string> | FieldTree<boolean> | FieldTree<number | null> | FieldTree<string[]>;
type SurveySectionId = 'consent' | 'profile' | 'career' | 'success';
type TransitionDirection = 'forward' | 'backward';
type ShareStatus = 'idle' | 'copied' | 'error';

interface SurveySection {
  id: SurveySectionId;
  title: string;
  controlNames: SurveyControlName[];
}

interface PriorityDragState {
  pointerId: number;
  value: string;
  listElement: HTMLElement;
  ownerDocument: Document;
  offsetX: number;
  offsetY: number;
  moveListener: (event: PointerEvent) => void;
  endListener: (event: PointerEvent) => void;
}

interface PriorityDragPreview {
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

const requiredPriorities = ['salary', 'remoteWork', 'purpose', 'stability', 'learning'] as const;

const initialSurveyModel = (): SurveyFormModel => ({
  participationConsent: false,
  academicUseConsent: false,
  name: '',
  email: '',
  currentSituation: '',
  interestArea: '',
  experienceLevel: '',
  technologies: [],
  marketConfidence: null,
  careerPriorities: [...requiredPriorities],
  recommendationScore: null,
  age: null,
  salaryExpectation: null,
  usesAi: false,
  additionalComments: '',
});

const surveySchema = schema<SurveyFormModel>((path) => {
  required(path.name);
  required(path.email);
  email(path.email);
  required(path.currentSituation);
  required(path.interestArea);
  required(path.experienceLevel);
  required(path.marketConfidence);
  required(path.recommendationScore);
  required(path.age);
  min(path.age, 1);
  max(path.age, 120);
  required(path.salaryExpectation);
  min(path.salaryExpectation, 1);
  validate(path.participationConsent, ({ value }) => (value() ? undefined : requiredError()));
  validate(path.academicUseConsent, ({ value }) => (value() ? undefined : requiredError()));
  validate(path.technologies, ({ value }) => (value().length > 0 ? undefined : requiredError()));
  validate(path.careerPriorities, ({ value }) =>
    isValidRanking(value()) ? undefined : requiredError(),
  );
});

function isValidRanking(value: string[]): boolean {
  if (value.length !== requiredPriorities.length) {
    return false;
  }

  const values = new Set(value);
  return requiredPriorities.every((priority) => values.has(priority));
}

@Component({
  imports: [
    MultipleChoiceQuestion,
    NumberQuestion,
    RatingQuestion,
    SingleChoiceQuestion,
    TextQuestion,
    TextareaQuestion,
  ],
  selector: 'app-career-survey',
  styleUrl: './career-survey.scss',
  templateUrl: './career-survey.html',
})
export class CareerSurvey implements OnDestroy {
  protected readonly submitted = signal(false);
  protected readonly currentSectionIndex = signal(0);
  protected readonly highestAvailableSectionIndex = signal(0);
  protected readonly transitionDirection = signal<TransitionDirection>('forward');
  protected readonly draggedPriority = signal<string | null>(null);
  protected readonly dragPreview = signal<PriorityDragPreview | null>(null);
  protected readonly shareStatus = signal<ShareStatus>('idle');
  protected readonly recommendationScores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
  protected readonly priorityLabels = new Map<string, string>([
    ['salary', 'Salário'],
    ['remoteWork', 'Modelo remoto'],
    ['purpose', 'Propósito'],
    ['stability', 'Estabilidade'],
    ['learning', 'Aprendizado'],
  ]);
  protected readonly sections: SurveySection[] = [
    {
      id: 'consent',
      title: 'Consentimento',
      controlNames: ['participationConsent', 'academicUseConsent'],
    },
    {
      id: 'profile',
      title: 'Perfil',
      controlNames: [
        'name',
        'email',
        'currentSituation',
        'interestArea',
        'experienceLevel',
        'technologies',
      ],
    },
    {
      id: 'career',
      title: 'Mercado e carreira',
      controlNames: [
        'marketConfidence',
        'careerPriorities',
        'recommendationScore',
        'age',
        'salaryExpectation',
        'usesAi',
        'additionalComments',
      ],
    },
    {
      id: 'success',
      title: 'Final',
      controlNames: [],
    },
  ];
  protected readonly activeSection = computed(() => this.sections[this.currentSectionIndex()]);
  protected readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  protected readonly isLastSection = computed(
    () => this.currentSectionIndex() === this.sections.length - 1,
  );
  protected readonly isFinalSurveySection = computed(() => this.activeSection().id === 'career');
  protected readonly isSuccessSection = computed(() => this.activeSection().id === 'success');

  private dragState: PriorityDragState | null = null;
  private scrollFrame = 0;
  private priorityAnimationFrames: number[] = [];
  private scrollRenderRef: AfterRenderRef | null = null;
  private readonly injector = inject(Injector);

  protected readonly formModel = signal<SurveyFormModel>(initialSurveyModel());
  protected readonly form = createSignalForm(this.formModel, surveySchema);

  protected readonly questions: Record<SurveyControlName, Question> = {
    participationConsent: this.choiceQuestion(
      'participationConsent',
      'Você concorda em participar desta pesquisa?',
      [
        { value: true, label: 'Concordo em participar' },
        { value: false, label: 'Não concordo em participar' },
      ],
      'Para continuar, é necessário concordar em participar.',
    ),
    academicUseConsent: this.choiceQuestion(
      'academicUseConsent',
      'Você autoriza o uso das suas respostas neste trabalho acadêmico de Estatística da FIAP?',
      this.yesNoOptions(),
      'Para continuar, é necessário autorizar o uso acadêmico das respostas.',
    ),
    name: this.textQuestion('name', 'Qual é o seu nome?', 'Informe seu nome.'),
    email: this.textQuestion('email', 'Qual é o seu e-mail?', 'Informe um e-mail válido.'),
    currentSituation: this.choiceQuestion('currentSituation', 'Qual é a sua situação atual?', [
      { value: 'student', label: 'Estudante' },
      { value: 'workingProfessional', label: 'Profissional já atuando' },
      { value: 'studentAndWorkingProfessional', label: 'Ambos' },
      { value: 'seekingOpportunity', label: 'Buscando oportunidade' },
    ]),
    interestArea: this.areaQuestion('interestArea', 'Qual área você atua ou pretende atuar?'),
    experienceLevel: this.choiceQuestion(
      'experienceLevel',
      'Quanto tempo de experiência você possui na área?',
      [
        { value: 'noExperience', label: 'Sem experiência' },
        { value: 'upToTwoYears', label: 'Até 2 anos' },
        { value: 'twoToFiveYears', label: '2 a 5 anos' },
        { value: 'moreThanFiveYears', label: 'Mais de 5 anos' },
      ],
    ),
    technologies: {
      id: 'technologies',
      title: 'Quais linguagens você utiliza?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { value: 'java', label: 'Java' },
        { value: 'cSharp', label: 'C#' },
        { value: 'python', label: 'Python' },
        { value: 'javascript/typescript', label: 'javascript/typescript' },
        { value: 'sql', label: 'SQL' },
        { value: 'other', label: 'Outra' },
      ],
      required: true,
      errorMessage: 'Escolha pelo menos uma tecnologia.',
    },
    marketConfidence: {
      id: 'marketConfidence',
      title:
        'Qual seu nível de confiança em se manter ou entrar no mercado de TI até o fim de 2026?',
      type: 'RATING',
      options: [],
      required: true,
      errorMessage: 'Selecione seu nível de confiança.',
    },
    careerPriorities: {
      id: 'careerPriorities',
      title: 'Classifique por ordem de importância:',
      type: 'MULTIPLE_CHOICE',
      options: [],
      required: true,
      errorMessage: 'Mantenha todos os itens na classificação.',
    },
    recommendationScore: {
      id: 'recommendationScore',
      title:
        'De 1 a 10, qual a chance de você recomendar a área de TI para alguém que está decidindo a carreira?',
      type: 'RATING',
      options: [],
      required: true,
      errorMessage: 'Selecione uma nota de 1 a 10.',
    },
    age: this.numberQuestion('age', 'Qual sua idade?', 'Informe uma idade válida.'),
    salaryExpectation: this.numberQuestion(
      'salaryExpectation',
      'Qual sua pretensão salarial mensal?',
      'Informe uma pretensão salarial válida.',
    ),
    usesAi: this.choiceQuestion(
      'usesAi',
      'Você usa IA nos seus estudos ou no seu trabalho hoje?',
      this.yesNoOptions(),
    ),
    additionalComments: {
      id: 'additionalComments',
      title: 'Deixe sua opinião sobre o mercado de TI em 2026 (opcional).',
      type: 'TEXTAREA',
      options: [],
      required: false,
    },
  };
  private readonly activeSectionElement =
    viewChild<ElementRef<HTMLElement>>('activeSectionElement');

  ngOnDestroy(): void {
    this.stopPriorityDrag(false);
    this.cancelQueuedScroll();
    this.cancelPriorityAnimationFrames();
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.form().markAsTouched();

    if (this.form().invalid()) {
      this.goToFirstInvalidSection();
      return;
    }

    const value = this.form().value();
    const surveyAnswers: SurveyAnswers = {
      participationConsent: value.participationConsent,
      academicUseConsent: value.academicUseConsent,
      name: value.name.trim(),
      email: value.email.trim(),
      currentSituation: value.currentSituation,
      interestArea: value.interestArea,
      experienceLevel: value.experienceLevel,
      technologies: value.technologies,
      marketConfidence: Number(value.marketConfidence),
      careerPriorities: value.careerPriorities,
      recommendationScore: Number(value.recommendationScore),
      age: Number(value.age),
      salaryExpectation: Number(value.salaryExpectation),
      usesAi: value.usesAi,
      additionalComments: value.additionalComments.trim(),
    };

    console.log(surveyAnswers);
    this.highestAvailableSectionIndex.set(this.sections.length - 1);
    this.activateSection(this.sections.length - 1);
  }

  protected goToSection(index: number): void {
    if (!this.isSectionAvailable(index) || index === this.currentSectionIndex()) {
      return;
    }

    this.activateSection(index);
  }

  protected continueFromSection(): void {
    const sectionIndex = this.currentSectionIndex();

    if (
      !this.validateSection(sectionIndex) ||
      this.isFinalSurveySection() ||
      this.isLastSection()
    ) {
      return;
    }

    const nextIndex = sectionIndex + 1;
    this.highestAvailableSectionIndex.update((value) => Math.max(value, nextIndex));
    this.activateSection(nextIndex);
  }

  protected previousSection(): void {
    if (this.isFirstSection()) {
      return;
    }

    this.activateSection(this.currentSectionIndex() - 1);
  }

  protected isSectionAvailable(index: number): boolean {
    return index <= this.highestAvailableSectionIndex();
  }

  protected sectionButtonClass(index: number): string {
    return index === this.currentSectionIndex()
      ? 'stepper__button stepper__button--active'
      : 'stepper__button';
  }

  protected showError<T>(field: FieldTree<T>): boolean {
    const state = field();
    return state.invalid() && (state.touched() || this.submitted());
  }

  protected setTextValue(field: FieldTree<string>, value: string): void {
    field().value.set(value);
    field().markAsTouched();
  }

  protected setStringChoiceValue(field: FieldTree<string>, value: QuestionOptionValue): void {
    if (typeof value !== 'string') {
      return;
    }

    this.setTextValue(field, value);
  }

  protected setBooleanValue(field: FieldTree<boolean>, value: boolean): void {
    field().value.set(value);
    field().markAsTouched();
  }

  protected setBooleanChoiceValue(field: FieldTree<boolean>, value: QuestionOptionValue): void {
    if (typeof value !== 'boolean') {
      return;
    }

    this.setBooleanValue(field, value);
  }

  protected setNumberValue(field: FieldTree<number | null>, value: number | null): void {
    field().value.set(value);
    field().markAsTouched();
  }

  protected setMultipleChoiceValue(field: FieldTree<string[]>, value: string[]): void {
    field().value.set(value);
    field().markAsTouched();
  }

  protected markTouched<T>(field: FieldTree<T>): void {
    field().markAsTouched();
  }

  protected chooseRecommendationScore(value: number): void {
    this.form.recommendationScore().value.set(value);
    this.form.recommendationScore().markAsTouched();
  }

  protected onRecommendationKeydown(event: KeyboardEvent, score: number): void {
    const currentValue = this.form.recommendationScore().value() ?? score;
    const keyActions: Record<string, number> = {
      ArrowRight: Math.min(10, currentValue + 1),
      ArrowUp: Math.min(10, currentValue + 1),
      ArrowLeft: Math.max(0, currentValue - 1),
      ArrowDown: Math.max(0, currentValue - 1),
      Home: 0,
      End: 10,
      Enter: score,
      ' ': score,
    };
    const nextValue = keyActions[event.key];

    if (nextValue !== undefined) {
      event.preventDefault();
      this.chooseRecommendationScore(nextValue);
    }
  }

  protected movePriority(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= this.form.careerPriorities().value().length) {
      return;
    }

    this.reorderPriority(index, nextIndex);
  }

  protected priorityLabel(value: string): string {
    return this.priorityLabels.get(value) ?? value;
  }

  protected priorityDragTransform(preview: PriorityDragPreview): string {
    return `translate3d(${preview.x}px, ${preview.y}px, 0)`;
  }

  protected startPriorityDrag(
    event: PointerEvent,
    value: string,
    listElement: HTMLElement,
    itemElement: HTMLElement,
  ): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.stopPriorityDrag(false);

    const ownerDocument = listElement.ownerDocument;
    const itemRect = itemElement.getBoundingClientRect();
    const offsetX = event.clientX - itemRect.left;
    const offsetY = event.clientY - itemRect.top;
    const moveListener = (moveEvent: PointerEvent) => this.updatePriorityDrag(moveEvent);
    const endListener = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== this.dragState?.pointerId) {
        return;
      }

      endEvent.preventDefault();
      this.stopPriorityDrag();
    };

    this.dragState = {
      pointerId: event.pointerId,
      value,
      listElement,
      ownerDocument,
      offsetX,
      offsetY,
      moveListener,
      endListener,
    };
    this.draggedPriority.set(value);
    this.dragPreview.set({
      label: this.priorityLabel(value),
      width: itemRect.width,
      height: itemRect.height,
      x: event.clientX - offsetX,
      y: event.clientY - offsetY,
    });
    ownerDocument.addEventListener('pointermove', moveListener, { passive: false });
    ownerDocument.addEventListener('pointerup', endListener);
    ownerDocument.addEventListener('pointercancel', endListener);
  }

  protected async shareSurvey(): Promise<void> {
    const shareData: ShareData = {
      title: 'Pesquisa de Carreira no Mercado de TI em 2026',
      text: 'Participe da pesquisa acadêmica da FIAP sobre carreira e mercado de TI em 2026.',
      url: this.currentUrl(),
    };

    this.shareStatus.set('idle');

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
          if (error.name === 'AbortError') {
            return;
          }
        }
      }
    }

    await this.copySurveyLink();
  }

  protected async copySurveyLink(): Promise<void> {
    this.shareStatus.set('idle');
    const copied = await this.copyToClipboard(this.currentUrl());
    this.shareStatus.set(copied ? 'copied' : 'error');
  }

  private textQuestion(id: SurveyControlName, title: string, errorMessage: string): Question {
    return {
      id,
      title,
      type: 'TEXT',
      options: [],
      required: true,
      errorMessage,
    };
  }

  private numberQuestion(id: SurveyControlName, title: string, errorMessage: string): Question {
    return {
      id,
      title,
      type: 'NUMBER',
      options: [],
      required: true,
      errorMessage,
    };
  }

  private choiceQuestion(
    id: SurveyControlName,
    title: string,
    options: QuestionOption[],
    errorMessage?: string,
  ): Question {
    return {
      id,
      title,
      type: 'SINGLE_CHOICE',
      options,
      required: true,
      errorMessage,
    };
  }

  private areaQuestion(id: SurveyControlName, title: string): Question {
    return this.choiceQuestion(id, title, [
      { value: 'artificialIntelligence', label: 'Inteligência Artificial' },
      { value: 'data', label: 'Dados' },
      { value: 'development', label: 'Desenvolvimento' },
      { value: 'cybersecurity', label: 'Cybersecurity' },
      { value: 'cloud', label: 'Cloud' },
      { value: 'other', label: 'Outra' },
    ]);
  }

  private yesNoOptions(): QuestionOption[] {
    return [
      { value: true, label: 'Sim' },
      { value: false, label: 'Não' },
    ];
  }

  private currentUrl(): string {
    if (typeof location === 'undefined') {
      return 'https://fiap-question-form.joaopdias.dev.br/';
    }

    return location.href;
  }

  private async copyToClipboard(value: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        return this.copyWithTemporaryInput(value);
      }
    }

    return this.copyWithTemporaryInput(value);
  }

  private copyWithTemporaryInput(value: string): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      input.remove();
    }
  }

  private validateSection(index: number): boolean {
    const section = this.sections[index];

    section.controlNames.forEach((controlName) => this.fieldByName(controlName)().markAsTouched());

    return section.controlNames.every((controlName) => this.fieldByName(controlName)().valid());
  }

  private goToFirstInvalidSection(): void {
    const invalidSectionIndex = this.sections.findIndex((section) =>
      section.controlNames.some((controlName) => this.fieldByName(controlName)().invalid()),
    );

    if (invalidSectionIndex >= 0) {
      this.highestAvailableSectionIndex.update((value) => Math.max(value, invalidSectionIndex));
      this.activateSection(invalidSectionIndex);
    }
  }

  private updatePriorityDrag(event: PointerEvent): void {
    const state = this.dragState;

    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();
    this.dragPreview.update((preview) =>
      preview
        ? {
            ...preview,
            x: event.clientX - state.offsetX,
            y: event.clientY - state.offsetY,
          }
        : preview,
    );

    const priorities = this.form.careerPriorities().value();
    const currentIndex = priorities.indexOf(state.value);

    if (currentIndex < 0) {
      return;
    }

    const items = Array.from(state.listElement.querySelectorAll<HTMLElement>('[data-priority-id]'));
    const preview = this.dragPreview();
    const draggedCenterY = preview ? preview.y + preview.height / 2 : event.clientY;
    const nextItem = items[currentIndex + 1];
    const previousItem = items[currentIndex - 1];
    let targetIndex = currentIndex;

    if (nextItem && draggedCenterY > this.itemLayoutCenterY(nextItem, state.listElement)) {
      targetIndex = currentIndex + 1;
    } else if (
      previousItem &&
      draggedCenterY < this.itemLayoutCenterY(previousItem, state.listElement)
    ) {
      targetIndex = currentIndex - 1;
    }

    if (targetIndex !== currentIndex) {
      this.reorderPriority(currentIndex, targetIndex);
    }
  }

  private reorderPriority(fromIndex: number, toIndex: number): void {
    const currentPriorities = this.form.careerPriorities().value();

    if (fromIndex === toIndex) {
      return;
    }

    const priorities = [...currentPriorities];
    const [movedPriority] = priorities.splice(fromIndex, 1);

    priorities.splice(toIndex, 0, movedPriority);

    if (priorities.every((priority, index) => priority === currentPriorities[index])) {
      return;
    }

    this.animatePriorityLayout(() => {
      this.form.careerPriorities().value.set(priorities);
      this.form.careerPriorities().markAsTouched();
    });
  }

  private itemLayoutCenterY(itemElement: HTMLElement, listElement: HTMLElement): number {
    return (
      listElement.getBoundingClientRect().top + itemElement.offsetTop + itemElement.offsetHeight / 2
    );
  }

  private animatePriorityLayout(applyChange: () => void): void {
    const listElement = this.dragState?.listElement;

    if (!listElement) {
      applyChange();
      return;
    }

    this.cancelPriorityAnimationFrames();
    const previousRects = this.priorityItemRects(listElement);

    applyChange();

    this.queuePriorityAnimationFrame(() => {
      const items = Array.from(listElement.querySelectorAll<HTMLElement>('[data-priority-id]'));

      items.forEach((item) => {
        const id = item.dataset['priorityId'];
        const previousRect = id ? previousRects.get(id) : undefined;

        if (!previousRect) {
          return;
        }

        const nextRect = item.getBoundingClientRect();
        const deltaY = previousRect.top - nextRect.top;

        if (deltaY === 0) {
          return;
        }

        item.style.transition = 'none';
        item.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      });

      this.queuePriorityAnimationFrame(() => {
        items.forEach((item) => {
          item.style.transition = '';
          item.style.transform = '';
        });
      });
    });
  }

  private priorityItemRects(listElement: HTMLElement): Map<string, DOMRect> {
    const rects = new Map<string, DOMRect>();
    const items = Array.from(listElement.querySelectorAll<HTMLElement>('[data-priority-id]'));

    items.forEach((item) => {
      const id = item.dataset['priorityId'];

      if (id) {
        rects.set(id, item.getBoundingClientRect());
      }
    });

    return rects;
  }

  private activateSection(index: number): void {
    this.transitionDirection.set(index > this.currentSectionIndex() ? 'forward' : 'backward');
    this.currentSectionIndex.set(index);
    this.queueSectionScroll();
  }

  private queueSectionScroll(): void {
    this.cancelQueuedScroll();
    this.scrollRenderRef = afterNextRender(
      {
        read: () => {
          this.scrollFrame = this.queueFrame(() => {
            this.activeSectionElement()?.nativeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            this.scrollFrame = 0;
          });
          this.scrollRenderRef = null;
        },
      },
      { injector: this.injector },
    );
  }

  private cancelQueuedScroll(): void {
    this.scrollRenderRef?.destroy();
    this.scrollRenderRef = null;

    if (!this.scrollFrame) {
      return;
    }

    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = 0;
  }

  private queueFrame(callback: FrameRequestCallback): number {
    if (typeof requestAnimationFrame === 'function') {
      return requestAnimationFrame(callback);
    }

    callback(0);
    return 0;
  }

  private queuePriorityAnimationFrame(callback: FrameRequestCallback): void {
    let frame = 0;
    frame = this.queueFrame((time) => {
      if (frame) {
        this.priorityAnimationFrames = this.priorityAnimationFrames.filter(
          (value) => value !== frame,
        );
      }
      callback(time);
    });

    if (frame) {
      this.priorityAnimationFrames.push(frame);
    }
  }

  private cancelPriorityAnimationFrames(): void {
    this.priorityAnimationFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.priorityAnimationFrames = [];
  }

  private stopPriorityDrag(markTouched = true): void {
    const state = this.dragState;

    if (!state) {
      return;
    }

    state.ownerDocument.removeEventListener('pointermove', state.moveListener);
    state.ownerDocument.removeEventListener('pointerup', state.endListener);
    state.ownerDocument.removeEventListener('pointercancel', state.endListener);
    this.dragState = null;
    this.draggedPriority.set(null);
    this.dragPreview.set(null);

    if (markTouched) {
      this.form.careerPriorities().markAsTouched();
    }
  }

  private fieldByName(controlName: SurveyControlName): SurveyField {
    switch (controlName) {
      case 'participationConsent':
        return this.form.participationConsent;
      case 'academicUseConsent':
        return this.form.academicUseConsent;
      case 'name':
        return this.form.name;
      case 'email':
        return this.form.email;
      case 'currentSituation':
        return this.form.currentSituation;
      case 'interestArea':
        return this.form.interestArea;
      case 'experienceLevel':
        return this.form.experienceLevel;
      case 'technologies':
        return this.form.technologies;
      case 'marketConfidence':
        return this.form.marketConfidence;
      case 'careerPriorities':
        return this.form.careerPriorities;
      case 'recommendationScore':
        return this.form.recommendationScore;
      case 'age':
        return this.form.age;
      case 'salaryExpectation':
        return this.form.salaryExpectation;
      case 'usesAi':
        return this.form.usesAi;
      case 'additionalComments':
        return this.form.additionalComments;
    }
  }
}
