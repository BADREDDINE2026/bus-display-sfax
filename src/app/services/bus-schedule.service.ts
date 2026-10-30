import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BusDeparture, OrdsApiResponse } from '../models/bus-departure.model';

@Injectable({
  providedIn: 'root'
})
export class BusScheduleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://197.3.5.106:9280/ords/ti/exploitation/AFFICHEUR_RAED';
  private cacheKey = 'cache_bus_departures';

  getDepartures(): Observable<BusDeparture[]> {
    return this.http.get<OrdsApiResponse>(this.apiUrl).pipe(
      map(response => response.items || []),
      tap(items => {
        localStorage.setItem(this.cacheKey, JSON.stringify(items));
      }),
      catchError(err => {
        console.warn('Erreur réseau, utilisation du cache local localStorage', err);
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          return of(JSON.parse(cached) as BusDeparture[]);
        }
        return of([]);
      })
    );
  }
}