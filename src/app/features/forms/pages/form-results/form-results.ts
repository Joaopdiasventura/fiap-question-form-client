import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AppHeader } from '../../../../shared/components/app-header/app-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { QuestionStatistics } from '../../components/question-statistics/question-statistics';
import { PresentationResponseDto } from '../../models/form.models';
import { ExportService } from '../../services/export.service';
import { PresentationService } from '../../services/presentation.service';

@Component({
  imports: [AppHeader, EmptyState, LoadingState, QuestionStatistics, RouterLink],
  selector: 'app-form-results',
  styleUrl: './form-results.scss',
  templateUrl: './form-results.html',
})
export class FormResults {
  private readonly route = inject(ActivatedRoute);
  private readonly presentation = inject(PresentationService);
  private readonly exportService = inject(ExportService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formId = this.route.snapshot.paramMap.get('id') || '';

  protected readonly loading = signal(true);
  protected readonly exporting = signal(false);
  protected readonly error = signal('');
  protected readonly data = signal<PresentationResponseDto | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.presentation.generateData(this.formId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  exportCsv(): void {
    this.exporting.set(true);
    this.exportService.download(this.formId).pipe(
      finalize(() => this.exporting.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
