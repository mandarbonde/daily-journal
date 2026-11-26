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
  private readonly destroy$ = new Subject<void>();

  constructor(private journalService: JournalService, private router: Router) {}

  ngOnInit(): void {
    this.journalService.entries$.pipe(takeUntil(this.destroy$)).subscribe((entries) => {
      this.entries = entries;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal'], { queryParams: { date: entry.date } });
  }

  deleteEntry(date: string): void {
    if (!confirm('Delete this journal entry? This cannot be undone.')) {
      return;
    }
    this.journalService.deleteEntry(date);
  }
}