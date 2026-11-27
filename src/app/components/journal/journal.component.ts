import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DuplicateJournalEntryError, JournalService } from '../../services/journal.service';
import { MoodOption } from '../../models/journal-entry.model';

const MOODS: MoodOption[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'tired', label: 'Tired', emoji: '😴' }
];

@Component({
  selector: 'app-journal',
  standalone: false,
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, OnDestroy {
  @ViewChild('datePicker') private datePicker!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  moods = MOODS;
  selectedMood = '';
  entryDate = '';
  editMode = false;
  saveError = '';
  saveSuccess = '';
  private editingExistingEntry = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: ['', Validators.required],
      mood: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Default to today's date (local, YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.entryDate = `${yyyy}-${mm}-${dd}`;

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const requestedDate = params.get('date');
      const date = requestedDate || this.entryDate;
      this.entryDate = date;
      this.editingExistingEntry = Boolean(requestedDate);
      this.form.patchValue({ date }, { emitEvent: false });
      this.saveError = '';
      this.saveSuccess = '';

      if (requestedDate) {
        this.loadEntryForDate(date);
      } else {
        this.editMode = false;
        this.selectedMood = '';
        this.form.patchValue({ mood: '', description: '' }, { emitEvent: false });
      }
    });

    this.form.get('date')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((date) => {
      this.entryDate = date;
      this.saveError = '';
      this.saveSuccess = '';
      if (this.editingExistingEntry) {
        this.loadEntryForDate(date);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectMood(value: string): void {
    this.selectedMood = value;
    this.form.patchValue({ mood: value });
  }

  openDatePicker(): void {
    const picker = this.datePicker.nativeElement;
    if (typeof picker.showPicker === 'function') {
      picker.showPicker();
    } else {
      picker.click();
    }
  }

  private loadEntryForDate(date: string): void {
    this.editMode = false;
    this.selectedMood = '';
    this.form.patchValue({ date, mood: '', description: '' }, { emitEvent: false });

    this.journalService.getEntryByDate(date).pipe(takeUntil(this.destroy$)).subscribe({
      next: (entry) => {
        if (this.entryDate !== date) {
          return;
        }

        if (entry) {
          this.editMode = true;
          this.editingExistingEntry = true;
          this.selectedMood = entry.mood;
          this.form.patchValue({
            date: entry.date,
            mood: entry.mood,
            description: entry.description
          }, { emitEvent: false });
        } else {
          this.editMode = false;
          this.editingExistingEntry = false;
        }
      },
      error: (error: unknown) => {
        if (this.entryDate !== date) {
          return;
        }
        console.error('Failed to load journal entry', error);
        this.editingExistingEntry = false;
        this.saveError = 'Unable to load the journal entry. Please try again.';
      }
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, mood, description } = this.form.value;
    const isUpdating = this.editMode;
    const request = isUpdating
      ? this.journalService.updateEntry({ date, mood, description })
      : this.journalService.saveEntry({ date, mood, description });

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.editMode = true;
        this.editingExistingEntry = true;
        this.saveError = '';
        this.saveSuccess = isUpdating ? 'Entry updated successfully.' : '';
      },
      error: (error: unknown) => {
        this.saveSuccess = '';
        if (error instanceof DuplicateJournalEntryError) {
          this.saveError = error.message;
          return;
        }
        console.error('Failed to save journal entry', error);
        this.saveError = 'Unable to save the journal entry. Please try again.';
      }
    });
  }

  goToEntries(): void {
    this.router.navigate(['/entries']);
  }
}