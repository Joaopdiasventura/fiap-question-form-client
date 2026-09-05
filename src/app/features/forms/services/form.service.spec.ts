import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FormService } from './form.service';
import { CreateFormDto } from '../models/form.models';

describe('FormService', () => {
  let service: FormService;
  const dto: CreateFormDto = {
    title: 'Pesquisa real',
    description: 'Coleta oficial',
    questions: [
      {
        id: '',
        title: 'Curso',
        type: 'TEXT',
        required: true,
        options: [],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates and finds a form', async () => {
    const created = await firstValueFrom(service.create(dto));
    const found = await firstValueFrom(service.findById(created.id));

    expect(created.id).toMatch(/^form-/);
    expect(found.title).toBe('Pesquisa real');
  });

  it('updates without mutating the input object', async () => {
    const updateDto = {
      ...dto,
      status: 'PUBLISHED' as const,
      questions: [{ ...dto.questions[0], title: 'Idade', type: 'NUMBER' as const }],
    };

    const created = await firstValueFrom(service.create(dto));
    await firstValueFrom(service.update(created.id, updateDto));
    updateDto.questions[0].title = 'Mutacao externa';

    const found = await firstValueFrom(service.findById(created.id));

    expect(found.questions[0].title).toBe('Idade');
  });

  it('fails when form is not found', async () => {
    let message = '';

    try {
      await firstValueFrom(service.findById('inexistente'));
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe('Formulario nao encontrado');
  });
});
