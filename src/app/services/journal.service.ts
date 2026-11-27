import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JournalEntry } from '../models/journal-entry.model';

const API_URL = '/api/entries';
const DUPLICATE_ENTRY_MESSAGE = 'An entry already exists for this date. Please update the existing entry.';

export class DuplicateJournalEntryError extends Error {
  constructor(message = DUPLICATE_ENTRY_MESSAGE) {
    super(message);
    this.name = 'DuplicateJournalEntryError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private readonly entriesSubject = new BehaviorSubject<JournalEntry[]>([]);
  public readonly entries$: Observable<JournalEntry[]> = this.entriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadEntries(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(API_URL).pipe(
      tap((entries) => this.entriesSubject.next(this.sortEntries(entries)))
    );
  }

  getEntryByDate(date: string): Observable<JournalEntry | undefined> {
    return this.loadEntries().pipe(
      map((entries) => entries.find((entry) => entry.date === date))
    );
  }

  saveEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(API_URL, entry).pipe(
      catchError((error: unknown) => this.rethrowDuplicateError(error)),
      tap((created) => this.publishEntry(created))
    );
  }

  updateEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Observable<JournalEntry> {
    return this.http.put<JournalEntry>(`${API_URL}/${encodeURIComponent(entry.date)}`, {
      mood: entry.mood,
      description: entry.description
    }).pipe(
      catchError((error: unknown) => this.rethrowDuplicateError(error)),
      tap((updated) => this.publishEntry(updated))
    );
  }

  deleteEntry(date: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${encodeURIComponent(date)}`).pipe(
      tap(() => {
        this.entriesSubject.next(
          this.entriesSubject.value.filter((entry) => entry.date !== date)
        );
      })
    );
  }

  private rethrowDuplicateError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      const message = typeof error.error?.message === 'string'
        ? error.error.message
        : DUPLICATE_ENTRY_MESSAGE;
      return throwError(() => new DuplicateJournalEntryError(message));
    }
    return throwError(() => error);
  }

  private publishEntry(entry: JournalEntry): void {
    const updatedEntries = this.entriesSubject.value
      .filter((current) => current.date !== entry.date);
    this.entriesSubject.next(this.sortEntries([...updatedEntries, entry]));
  }

  private sortEntries(entries: JournalEntry[]): JournalEntry[] {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date));
  }
}
