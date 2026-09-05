import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockApiStoreService } from '../../../core/mock-api/mock-api-store.service';
import { Submission, SubmitFormDto } from '../models/form.models';

@Service()
export class SubmissionService {
  private readonly store = inject(MockApiStoreService);

  submit(formId: string, dto: SubmitFormDto): Observable<Submission> {
    return this.store.submitForm(formId, dto);
  }

  findByFormId(formId: string): Observable<Submission[]> {
    return this.store.findSubmissionsByFormId(formId);
  }
}
