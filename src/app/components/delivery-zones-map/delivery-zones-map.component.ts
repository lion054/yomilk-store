import {Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import * as L from 'leaflet';

import {GeolocationService} from "../../core/services/location/geolocation.service";

@Component({
  selector: 'app-delivery-zones-map',
  standalone: true,
  imports: [],
  templateUrl: './delivery-zones-map.component.html',
  styleUrl: './delivery-zones-map.component.css'
})
export class DeliveryZonesMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  deliveryLocations: any[] = [];
  zones: any[] = []
  private interactionTimeout: any;
  charges: any = []
  map: L.Map | null = null;
  private markers: L.Marker[] = [];

  constructor(private geolocationService: GeolocationService) {}

  ngOnInit(): void {
    // Fetch delivery zones data
    this.geolocationService.getDeliveryZones().subscribe({
      next: (response: any) => {
        if (response) {
          this.zones = response;
          if (this.map) {
            this.updateMapMarkers();
          }
        }
      },
      error: ({data}) => {
        console.error('Error fetching delivery zones:', data);
      }
    });

    this.geolocationService.getDeliveryCharges().subscribe({
      next: (response: any) => {
        this.charges = response;
      },
      error: ({data}) => {
        console.error('Error fetching delivery charges:', data);
      }
    })
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap(): void {
    if (this.map) {
      return; // Map already initialized
    }

    // Create map instance
    this.map = L.map('delivery-map', {
      center: L.latLng(-17.8216, 31.0492), // Harare center
      zoom: 12,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      zoomControl: false
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add markers if data is already loaded
    if (this.zones.length > 0) {
      this.updateMapMarkers();
    }

    // Enable interactions on click
    this.map.on('click', () => this.enableInteractions());
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Add new markers
    this.zones.forEach((zone: any) => {
      zone.locations.forEach((location: any) => {
        if (location.latitude && location.longitude) {
          // Create custom pin icon
          const pinIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pin bg-primary" style="width: 30px; height: 30px; background-color: #191a1c; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">📍</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });

          const marker = L.marker(
            [location.latitude, location.longitude],
            { icon: pinIcon }
          ).bindPopup(`<b>${location.suburb}</b><br>We deliver here in ${location.suburb}!`);

          if (this.map) {
            marker.addTo(this.map);
            this.markers.push(marker);
          }
        }
      });
    });

    // Fit bounds if we have markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }

    this.disableInteractions();
  }

  private enableInteractions(): void {
    if (!this.map) return;

    this.map.dragging.enable();
    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.touchZoom.enable();

    // Add zoom control if not already present
    if (!this.map.zoomControl) {
      L.control.zoom().addTo(this.map);
    }

    // Auto-disable interactions after 5 seconds
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    this.interactionTimeout = setTimeout(() => {
      this.disableInteractions();
    }, 5000);
  }

  private disableInteractions(): void {
    if (!this.map) return;

    this.map.dragging.disable();
    this.map.scrollWheelZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.touchZoom.disable();
  }

  // Calculate the number of suburbs we deliver to
  get totalSuburbs(): number {
    let count = 0;
    this.zones.forEach(zone => {
      count += zone.locations.length;
    });
    return count;
  }

  ngOnDestroy(): void {
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    if (this.map) {
      // Remove all markers
      this.markers.forEach(marker => marker.remove());
      this.markers = [];

      // Remove map
      this.map.remove();
      this.map = null;
    }
  }
}
