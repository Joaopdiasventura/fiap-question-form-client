import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockApiStoreService } from '../../../core/mock-api/mock-api-store.service';
import { CreateFormDto, FormResponseDto, UpdateFormDto } from '../models/form.models';

@Service()
export class FormService {
  private readonly store = inject(MockApiStoreService);

  create(dto: CreateFormDto): Observable<FormResponseDto> {
    return this.store.createForm(dto);
  }

  findAll(): Observable<FormResponseDto[]> {
    return this.store.findAllForms();
  }

  findById(id: string): Observable<FormResponseDto> {
    return this.store.findFormById(id);
  }

  update(id: string, dto: UpdateFormDto): Observable<FormResponseDto> {
    return this.store.updateForm(id, dto);
  }
}
