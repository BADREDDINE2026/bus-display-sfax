import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusDeparture, OrdsApiResponse } from '../models/bus-departure.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  // URL de l'API ORDS (redirigée via le proxy vers le serveur de production)
  private apiUrl = '/ords/ti/exploitation/AFFICHEUR_RAED';

  getDepartures(): Observable<BusDeparture[]> {
    return this.http.get<OrdsApiResponse>(this.apiUrl).pipe(
      map(response => {
        // Extrait le tableau 'items' renvoyé par l'API ORDS
        return response.items ? response.items : [];
      })
    );
  }
}