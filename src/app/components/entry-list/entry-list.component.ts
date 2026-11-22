import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JournalService } from '../../services/journal.service';
import { JournalEntry } from '../../models/journal-entry.model';

@Component({
  selector: 'app-entry-list',
  standalone: false,
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit {
  entries: JournalEntry[] = [];

  constructor(private journalService: JournalService, private router: Router) {}

  ngOnInit(): void {
    this.journalService.entries$.subscribe((entries) => {
      this.entries = entries;
    });
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