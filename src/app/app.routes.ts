import { Routes } from '@angular/router';
import { StationDisplayComponent } from './components/station-display/station-display.component';

export const routes: Routes = [
  { path: '', component: StationDisplayComponent },
  { path: '**', redirectTo: '' }
];