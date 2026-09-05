import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { TransferState, makeStateKey } from '@angular/core';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { publicFormResolver } from './public-form-resolver';
import { FormService } from '../services/form.service';
import { FormResponseDto } from '../models/form.models';

describe('publicFormResolver', () => {
  const executeResolver: ResolveFn<FormResponseDto> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => publicFormResolver(...resolverParameters));
  let findById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findById = vi.fn().mockReturnValue(of(formDto));
    TestBed.configureTestingModule({
      providers: [
        { provide: FormService, useValue: { findById } },
      ],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });

  it('resolves the public form and stores it for hydration', async () => {
    const result = executeResolver(routeSnapshot(), {} as RouterStateSnapshot);
    const form = (isObservable(result) ? await firstValueFrom(result) : result) as FormResponseDto;

    expect(form.title).toBe('Pesquisa');
    expect(findById).toHaveBeenCalledWith('form-test');
  });

  it('uses transfer state when available', () => {
    const transferState = TestBed.inject(TransferState);
    transferState.set(makeStateKey<FormResponseDto>('public-form-form-test'), formDto);

    const result = executeResolver(routeSnapshot(), {} as RouterStateSnapshot);

    expect(result).toEqual(formDto);
    expect(findById).not.toHaveBeenCalled();
  });
});

function routeSnapshot(): ActivatedRouteSnapshot {
  return {
    paramMap: new Map([['id', 'form-test']]),
  } as unknown as ActivatedRouteSnapshot;
}

const formDto: FormResponseDto = {
  id: 'form-test',
  title: 'Pesquisa',
  description: 'Descricao',
  status: 'PUBLISHED',
  totalResponses: 0,
  questions: [
    { id: 'q1', title: 'Nome', type: 'TEXT', options: [], required: true },
  ],
};
