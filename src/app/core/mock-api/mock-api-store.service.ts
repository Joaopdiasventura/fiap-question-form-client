import { Service } from '@angular/core';
import { Observable, delay, mergeMap, of, throwError, timer } from 'rxjs';
import { Admin, LoginDto } from '../../features/auth/models/auth.models';
import {
  CreateFormDto,
  Form,
  FormResponseDto,
  Submission,
  SubmitFormDto,
  UpdateFormDto,
} from '../../features/forms/models/form.models';

@Service()
export class MockApiStoreService {
  private readonly latencyMs = 250;
  private idCounter = 100;
  private readonly admins: Admin[] = [
    {
      id: 'admin-1',
      name: 'Administrador FIAP',
      email: 'admin@fiap.com.br',
      passwordHash: 'fiap123',
    },
  ];
  private forms: Form[] = [
    {
      id: 'form-demo',
      title: 'Pesquisa de experiencia FIAPP',
      description: 'Questionario demonstrativo para validar o fluxo antes da coleta real.',
      status: 'PUBLISHED',
      questions: [
        {
          id: 'q-text',
          title: 'Qual palavra resume sua experiencia?',
          type: 'TEXT',
          options: [],
          required: true,
        },
        {
          id: 'q-textarea',
          title: 'Conte o principal ponto de melhoria percebido.',
          type: 'TEXTAREA',
          options: [],
          required: false,
        },
        {
          id: 'q-number',
          title: 'Quantas vezes voce usou a plataforma na ultima semana?',
          type: 'NUMBER',
          options: [],
          required: true,
        },
        {
          id: 'q-single',
          title: 'Em qual periodo voce mais utiliza a plataforma?',
          type: 'SINGLE_CHOICE',
          options: ['Manha', 'Tarde', 'Noite'],
          required: true,
        },
        {
          id: 'q-multiple',
          title: 'Quais recursos voce usa com frequencia?',
          type: 'MULTIPLE_CHOICE',
          options: ['Aulas', 'Atividades', 'Notas', 'Comunicados'],
          required: false,
        },
        {
          id: 'q-rating',
          title: 'Como voce avalia a experiencia geral?',
          type: 'RATING',
          options: [],
          required: true,
        },
      ],
    },
  ];
  private submissions: Submission[] = [];

  login(dto: LoginDto): Observable<string> {
    const admin = this.admins.find((item) => item.email === dto.email && item.passwordHash === dto.password);

    if (!admin) {
      return this.fail('Credenciais invalidas');
    }

    return this.respond(`mock-token-${admin.id}`);
  }

  createForm(dto: CreateFormDto): Observable<FormResponseDto> {
    const form: Form = {
      id: this.nextId('form'),
      title: dto.title,
      description: dto.description,
      status: 'DRAFT',
      questions: dto.questions.map((question) => ({
        ...question,
        id: question.id || this.nextId('question'),
        options: this.usesOptions(question.type) ? [...question.options] : [],
      })),
    };

    this.forms = [...this.forms, this.clone(form)];

    return this.respond(this.toFormResponse(form));
  }

  findAllForms(): Observable<FormResponseDto[]> {
    return this.respond(this.forms.map((form) => this.toFormResponse(form)));
  }

  findFormById(id: string): Observable<FormResponseDto> {
    const form = this.forms.find((item) => item.id === id);

    if (!form) {
      return this.fail('Formulario nao encontrado');
    }

    return this.respond(this.toFormResponse(form));
  }

  updateForm(id: string, dto: UpdateFormDto): Observable<FormResponseDto> {
    const index = this.forms.findIndex((item) => item.id === id);

    if (index < 0) {
      return this.fail('Formulario nao encontrado');
    }

    const form: Form = {
      id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      questions: dto.questions.map((question) => ({
        ...question,
        id: question.id || this.nextId('question'),
        options: this.usesOptions(question.type) ? [...question.options] : [],
      })),
    };

    this.forms = this.forms.map((item, itemIndex) => itemIndex === index ? this.clone(form) : item);

    return this.respond(this.toFormResponse(form));
  }

  submitForm(formId: string, dto: SubmitFormDto): Observable<Submission> {
    const form = this.forms.find((item) => item.id === formId);

    if (!form) {
      return this.fail('Formulario nao encontrado');
    }

    if (form.status !== 'PUBLISHED') {
      return this.fail('Formulario indisponivel para respostas');
    }

    const submission: Submission = {
      id: this.nextId('submission'),
      formId,
      answers: dto.answers.map((answer) => ({ ...answer, value: this.clone(answer.value) })),
      submittedAt: new Date(),
    };

    this.submissions = [...this.submissions, this.clone(submission)];

    return this.respond(submission);
  }

  findSubmissionsByFormId(formId: string): Observable<Submission[]> {
    const form = this.forms.find((item) => item.id === formId);

    if (!form) {
      return this.fail('Formulario nao encontrado');
    }

    return this.respond(this.submissions.filter((submission) => submission.formId === formId));
  }

  resetForTesting(): void {
    this.idCounter = 100;
    this.submissions = [];
    this.forms = this.forms.slice(0, 1);
  }

  private toFormResponse(form: Form): FormResponseDto {
    return {
      ...this.clone(form),
      totalResponses: this.submissions.filter((submission) => submission.formId === form.id).length,
    };
  }

  private respond<T>(value: T): Observable<T> {
    return of(this.clone(value)).pipe(delay(this.latencyMs));
  }

  private fail<T>(message: string): Observable<T> {
    return timer(this.latencyMs).pipe(mergeMap(() => throwError(() => new Error(message))));
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }

  private usesOptions(type: string): boolean {
    return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';
  }
}
