export interface MoodOption {
  value: string;
  label: string;
  emoji: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}