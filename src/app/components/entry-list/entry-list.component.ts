import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { JournalService } from '../../services/journal.service';
import { JournalEntry } from '../../models/journal-entry.model';

@Component({
  selector: 'app-entry-list',
  standalone: false,
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit, OnDestroy {
  entries: JournalEntry[] = [];
  loadError = '';
  deleteError = '';
  private readonly destroy$ = new Subject<void>();

  constructor(private journalService: JournalService, private router: Router) {}

  ngOnInit(): void {
    this.journalService.entries$.pipe(takeUntil(this.destroy$)).subscribe((entries) => {
      this.entries = entries;
    });

    this.journalService.loadEntries().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadError = '';
      },
      error: (error: unknown) => {
        console.error('Failed to load journal entries', error);
        this.loadError = 'Unable to load journal entries. Please check the backend connection.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  openEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal'], { queryParams: { date: entry.date } });
  }

  deleteEntry(date: string): void {
    if (!confirm('Delete this journal entry? This cannot be undone.')) {
      return;
    }

    this.deleteError = '';
    this.journalService.deleteEntry(date).pipe(takeUntil(this.destroy$)).subscribe({
      error: (error: unknown) => {
        console.error('Failed to delete journal entry', error);
        this.deleteError = 'Unable to delete the journal entry. Please try again.';
      }
    });
  }
}