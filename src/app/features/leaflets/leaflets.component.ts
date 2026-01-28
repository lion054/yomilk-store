import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LeafletsService } from '../../core/services/leaflets/leaflets.service';
import { Leaflet } from '../../core/interfaces/interfaces';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-leaflets',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbComponent],
  templateUrl: './leaflets.component.html'
})
export class LeafletsComponent implements OnInit, OnDestroy {
  leaflets: Leaflet[] = [];
  filteredLeaflets: Leaflet[] = [];
  isLoading = true;
  activeFilter: 'all' | 'weekly-specials' | 'promotions' | 'seasonal' | 'catalogue' = 'all';
  selectedLeaflet: Leaflet | null = null;
  private destroy$ = new Subject<void>();

  categories = [
    { value: 'all', label: 'All Leaflets', icon: '📚' },
    { value: 'weekly-specials', label: 'Weekly Specials', icon: '🔥' },
    { value: 'promotions', label: 'Promotions', icon: '🎉' },
    { value: 'seasonal', label: 'Seasonal', icon: '🌟' },
    { value: 'catalogue', label: 'Catalogues', icon: '📖' }
  ];

  constructor(private leafletsService: LeafletsService) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.loadLeaflets();
  }

  loadLeaflets() {
    this.isLoading = true;
    this.leafletsService.getActiveLeaflets().pipe(
      takeUntil(this.destroy$)
    ).subscribe(leaflets => {
      this.leaflets = leaflets;
      this.applyFilter();
      this.isLoading = false;
    });
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredLeaflets = this.leaflets;
    } else {
      this.filteredLeaflets = this.leaflets.filter(l => l.category === this.activeFilter);
    }
  }

  setFilter(filter: 'all' | 'weekly-specials' | 'promotions' | 'seasonal' | 'catalogue') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  getDaysRemaining(leaflet: Leaflet): number {
    return this.leafletsService.getDaysRemaining(leaflet);
  }

  openLeaflet(leaflet: Leaflet) {
    this.selectedLeaflet = leaflet;
  }

  closeViewer() {
    this.selectedLeaflet = null;
  }

  downloadLeaflet(leaflet: Leaflet) {
    // In production, this would trigger a download
    window.open(leaflet.pdfUrl, '_blank');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
