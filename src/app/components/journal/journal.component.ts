import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JournalService } from '../../services/journal.service';
import { JournalEntry, MoodOption } from '../../models/journal-entry.model';

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
export class JournalComponent implements OnInit {
  form!: FormGroup;
  moods = MOODS;
  selectedMood = '';
  entryDate = '';
  saving = false;
  editMode = false;
  entryId = '';

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private router: Router
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
    this.form.patchValue({ date: this.entryDate });

    this.form.get('date')!.valueChanges.subscribe((date) => {
      this.entryDate = date;
      this.loadEntryForDate(date);
    });
  }

  selectMood(value: string): void {
    this.selectedMood = value;
    this.form.patchValue({ mood: value });
  }

  private loadEntryForDate(date: string): void {
    const entry = this.journalService.getEntryByDate(date);
    if (entry) {
      this.editMode = true;
      this.entryId = entry.id;
      this.selectedMood = entry.mood;
      this.form.patchValue({
        date: entry.date,
        mood: entry.mood,
        description: entry.description
      });
    } else {
      this.editMode = false;
      this.entryId = '';
      this.selectedMood = '';
      this.form.patchValue({
        date,
        mood: '',
        description: ''
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const { date, mood, description } = this.form.value;
    this.journalService.saveEntry({ date, mood, description });
    this.editMode = true;
    this.entryId = this.journalService.getEntryByDate(date)!.id;
    this.saving = false;

    // Small feedback via router so user sees entry saved; navigate back to list optionally
    // Keep user on editor but mark saved state handled by UI
  }

  goToEntries(): void {
    this.router.navigate(['/entries']);
  }
}