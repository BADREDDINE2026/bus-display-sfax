import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { ScheduleService } from '../../services/schedule.service';
import { BusDeparture } from '../../models/bus-departure.model';

@Component({
  selector: 'app-station-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="interactive-broadcast-container">
      <!-- Arrière-plan animé interactif : Grille néon & Flux lumineux -->
      <div class="sfax-animated-bg">
        <div class="neon-grid"></div>
        <div class="light-sweep"></div>
        <div class="traffic-pulse-particles">
          <span class="flash-dot f1"></span>
          <span class="flash-dot f2"></span>
          <span class="flash-dot f3"></span>
        </div>
      </div>

      <!-- En-tête avec LOGO ANIMÉ EN MOUVEMENT (Pipe & Centre / Extrême) -->
      <header class="interactive-header">
        <div class="brand-section">
          <!-- Logo central et extrême animé en permanence -->
          <div class="logo-interactive-box moving-logo-anim">
            <img src="/logo.jpeg" alt="SORETRAS" class="soretras-logo-img" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="fallback-logo" style="display: none;">
              <span class="logo-text">SORETRAS</span>
            </div>
            <div class="logo-glow-ring"></div>
          </div>
          <div class="station-title">
            <div class="live-flash-badge">
              <span class="flashing-dot"></span> SORETRAS LIVE KIOSK • SFAX
            </div>
            <h1>محطة الرائد البجاوي - صفاقس</h1>
            <span class="subtitle">Gare Routière Al Raid El Bejaoui • Affichage Dynamique Intelligent</span>
          </div>
        </div>
        <div class="header-right">
          <div class="interactive-clock-box">
            <span class="clock-display">{{ currentTime }}</span>
            <span class="live-status-pill">{{ isOffline ? 'HORS-LIGNE' : 'EN DIRECT (' + departures.length + ')' }}</span>
          </div>
        </div>
      </header>

      <!-- PANNEAU PROCHAIN DÉPART FLASH INTERACTIF -->
      @if (nextDeparture) {
        <section class="flash-banner-card">
          <div class="card-glow-effect"></div>
          <div class="flash-content">
            <div class="flash-left">
              <span class="flash-tag-animated">⚡ PROCHAIN DÉPART IMMINENT</span>
              <span class="quai-badge">QUAI RAED</span>
            </div>
            
            <div class="flash-center-info">
              <div class="destination-group">
                <span class="dest-fr-main">{{ nextDeparture.voyage_fr || nextDeparture.voyage }}</span>
                <span class="dest-ar-sub">{{ nextDeparture.voyage }}</span>
              </div>
              <div class="flash-metrics">
                <div class="metric-box">
                  <span class="m-label">VÉHICULE</span>
                  <span class="m-val">#{{ nextDeparture.bus }}</span>
                </div>
                <div class="metric-box time-highlight">
                  <span class="m-label">DÉPART</span>
                  <span class="m-val">{{ nextDeparture.t_depart }}</span>
                </div>
              </div>
            </div>

            <div class="flash-right">
              <span class="status-flash-pill">{{ nextDeparture.status_fr || nextDeparture.status || 'Programmé' }}</span>
            </div>
          </div>
        </section>
      }

      <!-- Tableau principal interactif -->
      <main class="interactive-body" #scrollContainer>
        @if (departures && departures.length > 0) {
          <table class="interactive-table">
            <thead>
              <tr>
                <th>DESTINATION (FR / AR)</th>
                <th>DÉPART</th>
                <th>ARRIVÉE</th>
                <th>VÉHICULE</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              @for (dep of departures; track dep.bus || $index) {
                <tr [class.flash-row-active]="dep === nextDeparture">
                  <td class="route-info-cell">
                    <div class="line-pill-tag">RAED</div>
                    <div class="names-wrapper">
                      <strong class="route-fr">{{ dep.voyage_fr || dep.voyage }}</strong>
                      <span class="route-ar">{{ dep.voyage }}</span>
                    </div>
                  </td>
                  <td class="time-val-cell dep-time">{{ dep.t_depart || '--:--' }}</td>
                  <td class="time-val-cell arr-time">{{ dep.t_arrivee || '--:--' }}</td>
                  <td><span class="bus-number-pill">#{{ dep.bus || '---' }}</span></td>
                  <td><span class="status-table-pill" [class.active-status]="dep === nextDeparture">{{ dep.status_fr || dep.status || 'Programmé' }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="no-data">
            <div class="spinner"></div>
            <p>Synchronisation des données de la station Sfax...</p>
          </div>
        }
      </main>

      <!-- Pied de page interactif avec Ticker défilant fluide -->
      <footer class="interactive-footer">
        <div class="ticker-wrapper">
          <span class="ticker-label-flash">INFOS SORETRAS</span>
          <div class="ticker-scroll-container">
            <div class="ticker-moving-content">
              <span>🚌 <strong>Bon voyage sur nos lignes.</strong></span>
              <span class="ticker-dot">•</span>
              <span>الشركة الجهوية للنقل بولاية صفاقس تتمنى لكم رحلة ممتعة</span>
              <span class="ticker-dot">•</span>
              <span>Gare Al Raid El Bejaoui Sfax</span>
              <span class="ticker-dot">•</span>
              <span>Système d'affichage en temps réel</span>
              <span class="ticker-dot">•</span>
              <span>Merci de respecter les consignes de sécurité à bord</span>
              <span class="ticker-dot">•</span>
              <span>🚌 <strong>Bon voyage sur nos lignes.</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./station-display.component.scss']
})
export class StationDisplayComponent implements OnInit, OnDestroy {
  departures: BusDeparture[] = [];
  currentTime: string = '';
  isOffline: boolean = false;
  nextDeparture: BusDeparture | null = null;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private scheduleService = inject(ScheduleService);
  private cdr = inject(ChangeDetectorRef);
  private clockSub?: Subscription;
  private apiSub?: Subscription;
  private autoScrollSub?: Subscription;

  ngOnInit(): void {
    this.updateClock();
    this.clockSub = interval(1000).subscribe(() => this.updateClock());

    this.loadDepartures();
    this.apiSub = interval(30000).subscribe(() => this.loadDepartures());

    this.setupAutoScroll();
  }

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
    this.apiSub?.unsubscribe();
    this.autoScrollSub?.unsubscribe();
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.updateNextDeparture();
  }

  loadDepartures(): void {
    this.scheduleService.getDepartures().subscribe({
      next: (data: BusDeparture[]) => {
        this.departures = [...data];
        this.isOffline = false;
        this.updateNextDeparture();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isOffline = true;
        this.cdr.detectChanges();
      }
    });
  }

  private updateNextDeparture(): void {
    if (!this.departures || this.departures.length === 0) {
      this.nextDeparture = null;
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let closestDep: BusDeparture | null = null;
    let minDiff = Infinity;

    for (const dep of this.departures) {
      if (!dep.t_depart) continue;
      const [h, m] = dep.t_depart.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;

      const depMinutes = h * 60 + m;
      const diff = depMinutes - currentMinutes;

      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        closestDep = dep;
      }
    }

    this.nextDeparture = closestDep || this.departures[0];
  }

  private setupAutoScroll(): void {
    let scrollingDown = true;
    this.autoScrollSub = interval(40).subscribe(() => {
      const el = this.scrollContainer?.nativeElement;
      if (!el) return;

      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;

      if (scrollingDown) {
        el.scrollTop += 1.2;
        if (el.scrollTop >= maxScroll) {
          setTimeout(() => { scrollingDown = false; }, 2000);
        }
      } else {
        el.scrollTop -= 2.5;
        if (el.scrollTop <= 0) {
          setTimeout(() => { scrollingDown = true; }, 3000);
        }
      }
    });
  }
}