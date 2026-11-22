import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JournalEntry } from '../models/journal-entry.model';

const STORAGE_KEY = 'daily_journal_entries';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private entries: JournalEntry[] = [];
  private entriesSubject = new BehaviorSubject<JournalEntry[]>([]);
  public entries$: Observable<JournalEntry[]> = this.entriesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.entries = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load journal entries from localStorage', e);
      this.entries = [];
    }
    this.entriesSubject.next([...this.entries].sort((a, b) => b.date.localeCompare(a.date)));
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.error('Failed to save journal entries to localStorage', e);
    }
    this.entriesSubject.next([...this.entries].sort((a, b) => b.date.localeCompare(a.date)));
  }

  /** Get all entries, newest first. */
  getAllEntries(): JournalEntry[] {
    return [...this.entries].sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Get the entry for a specific date (YYYY-MM-DD), if any. */
  getEntryByDate(date: string): JournalEntry | undefined {
    return this.entries.find((e) => e.date === date);
  }

  /** Save or update an entry. One entry per day is enforced by upserting on `date`. */
  saveEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry {
    const now = new Date().toISOString();
    const existing = this.getEntryByDate(entry.date);

    if (existing) {
      const updated: JournalEntry = {
        ...existing,
        mood: entry.mood,
        description: entry.description,
        updatedAt: now
      };
      this.entries = this.entries.map((e) => (e.id === existing.id ? updated : e));
    } else {
      const created: JournalEntry = {
        id: crypto.randomUUID(),
        date: entry.date,
        mood: entry.mood,
        description: entry.description,
        createdAt: now,
        updatedAt: now
      };
      this.entries = [...this.entries, created];
    }

    this.saveToStorage();
    return this.getEntryByDate(entry.date)!;
  }

  /** Delete the entry for a specific date. */
  deleteEntry(date: string): boolean {
    const existing = this.getEntryByDate(date);
    if (!existing) {
      return false;
    }
    this.entries = this.entries.filter((e) => e.id !== existing.id);
    this.saveToStorage();
    return true;
  }
}