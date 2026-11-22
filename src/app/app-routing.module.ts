import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JournalComponent } from './components/journal/journal.component';
import { EntryListComponent } from './components/entry-list/entry-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/journal', pathMatch: 'full' },
  { path: 'journal', component: JournalComponent },
  { path: 'entries', component: EntryListComponent },
  { path: '**', redirectTo: '/journal' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
