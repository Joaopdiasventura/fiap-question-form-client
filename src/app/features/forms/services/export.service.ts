import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PresentationService } from './presentation.service';

@Service()
export class ExportService {
  private readonly presentation = inject(PresentationService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  exportCsv(formId: string): Observable<Blob> {
    return this.presentation.generateData(formId).pipe(
      map(({ form, responses }) => {
        const header = ['submissionId', 'submittedAt', ...form.questions.map((question) => question.title)];
        const rows = responses.map((submission) => [
          submission.id,
          submission.submittedAt.toISOString(),
          ...form.questions.map((question) => {
            const answer = submission.answers.find((item) => item.questionId === question.id);
            const value = answer?.value ?? '';
            return Array.isArray(value) ? value.join('|') : String(value);
          }),
        ]);

        return new Blob([this.toCsv([header, ...rows])], { type: 'text/csv;charset=utf-8' });
      }),
    );
  }

  download(formId: string): Observable<void> {
    return this.exportCsv(formId).pipe(
      map((blob) => {
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = this.document.createElement('a');
        anchor.href = url;
        anchor.download = `fiap-form-${formId}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      }),
    );
  }

  private toCsv(rows: string[][]): string {
    return rows.map((row) => row.map((cell) => this.escapeCell(cell)).join(',')).join('\n');
  }

  private escapeCell(value: string): string {
    const normalized = value.replaceAll('"', '""');
    return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
  }
}
