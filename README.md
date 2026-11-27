# DailyJournal

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Spring Boot API

The Angular application calls the Spring Boot REST API in the sibling `daily-journal-app/` project. The API requires JDK 17 or newer and a running MySQL server.

Create the database once in MySQL:

```sql
CREATE DATABASE daily_journal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Start the API from the Angular project root:

```powershell
Push-Location ..\daily-journal-app
.\mvnw.cmd spring-boot:run
Pop-Location
```

In another terminal, run the Angular application with `ng serve`. Its development proxy forwards `/api` requests to `http://localhost:8080`.

The Angular application uses the API as its source of truth for journal entries. It supports listing, creating, updating, and deleting entries under `/api/entries`; the editor finds an entry by date from the list response. Any older `daily_journal_entries` data already in browser storage is left untouched and is not imported automatically.
