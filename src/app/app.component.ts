import { Component, OnInit } from '@angular/core';

const THEME_STORAGE_KEY = 'daily-journal-theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isDarkTheme = false;

  ngOnInit(): void {
    this.isDarkTheme = localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem(THEME_STORAGE_KEY, this.isDarkTheme ? 'dark' : 'light');
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
