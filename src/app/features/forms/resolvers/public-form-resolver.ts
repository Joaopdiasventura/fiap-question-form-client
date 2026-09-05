import { TransferState, inject, makeStateKey } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { tap } from 'rxjs';
import { FormResponseDto } from '../models/form.models';
import { FormService } from '../services/form.service';

export const publicFormResolver: ResolveFn<FormResponseDto> = (route) => {
  const forms = inject(FormService);
  const transferState = inject(TransferState);
  const formId = route.paramMap.get('id') || '';
  const stateKey = makeStateKey<FormResponseDto>(`public-form-${formId}`);
  const cachedForm = transferState.get(stateKey, null);

  if (cachedForm) {
    transferState.remove(stateKey);
    return cachedForm;
  }

  return forms.findById(formId).pipe(tap((form) => transferState.set(stateKey, form)));
};
