import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JournalService } from './journal.service';
import { JournalEntry } from '../models/journal-entry.model';

describe('JournalService', () => {
  let service: JournalService;
  let httpMock: HttpTestingController;

  const entries: JournalEntry[] = [
    {
      id: 'later',
      date: '2026-11-28',
      mood: 'happy',
      description: 'A good day',
      createdAt: '2026-11-28T10:00:00Z',
      updatedAt: '2026-11-28T10:00:00Z'
    },
    {
      id: 'earlier',
      date: '2026-11-27',
      mood: 'neutral',
      description: 'A quiet day',
      createdAt: '2026-11-27T10:00:00Z',
      updatedAt: '2026-11-27T10:00:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(JournalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('finds an entry by date from the documented collection endpoint', () => {
    let result: JournalEntry | undefined;
    service.getEntryByDate('2026-11-27').subscribe((entry) => {
      result = entry;
    });

    const request = httpMock.expectOne('/api/entries');
    expect(request.request.method).toBe('GET');
    request.flush(entries);

    expect(result).toEqual(entries[1]);
  });

  it('returns undefined when the collection has no entry for the date', () => {
    let result: JournalEntry | undefined;
    service.getEntryByDate('2026-11-26').subscribe((entry) => {
      result = entry;
    });

    httpMock.expectOne('/api/entries').flush(entries);

    expect(result).toBeUndefined();
  });

  it('deletes an entry through the date endpoint and updates the list', () => {
    let currentEntries: JournalEntry[] = [];
    service.entries$.subscribe((items) => {
      currentEntries = items;
    });

    service.loadEntries().subscribe();
    httpMock.expectOne('/api/entries').flush(entries);

    service.deleteEntry('2026-11-27').subscribe();
    const request = httpMock.expectOne('/api/entries/2026-11-27');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(currentEntries.map((entry) => entry.date)).toEqual(['2026-11-28']);
  });

  it('keeps the entry in the list when deletion fails', () => {
    let currentEntries: JournalEntry[] = [];
    service.entries$.subscribe((items) => {
      currentEntries = items;
    });

    service.loadEntries().subscribe();
    httpMock.expectOne('/api/entries').flush(entries);

    service.deleteEntry('2026-11-27').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/entries/2026-11-27').flush(
      { message: 'No journal entry exists for date 2026-11-27.' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(currentEntries.map((entry) => entry.date)).toEqual(['2026-11-28', '2026-11-27']);
  });
});
