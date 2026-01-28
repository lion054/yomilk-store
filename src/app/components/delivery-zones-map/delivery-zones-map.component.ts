import {Component, OnDestroy, OnInit} from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import {CommonModule} from "@angular/common";
import {GeolocationService} from "../../core/services/location/geolocation.service";

@Component({
  selector: 'app-delivery-zones-map',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  templateUrl: './delivery-zones-map.component.html',
  styleUrl: './delivery-zones-map.component.css'
})
export class DeliveryZonesMapComponent implements OnInit, OnDestroy {
  deliveryLocations: any[] = [];
  zones: any[] = []
  private interactionTimeout: any;

  charges: any = []
  // Leaflet map options
  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 12,
    center: L.latLng(-17.8216, 31.0492) // Center of Harare
  };

  // Map layers
  layers: L.Layer[] = [];
  map: L.Map | null | any = null;



  constructor(private geolocationService: GeolocationService) {}

  ngOnInit(): void {
    // Initialize map with default data first
    this.initializeMap();
    // Enable interactions when clicked


    // Then fetch and update with real data
    this.geolocationService.getDeliveryZones().subscribe({
      next: (response: any) => {
        if (response) {
          // this.deliveryLocations = response.locations;
          this.zones = response
          // Clear existing layers and reinitialize
          this.layers = [];
          this.initializeMap();
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

  onMapReady(map: L.Map): void {
    this.map = map;
    // If we already have data, make sure it's displayed
    if (this.zones.length > 0) {
      this.initializeMap();
    }
  }

  initializeMap(): void {
    // Create a new layers array
    const newLayers: L.Layer[] = [];

    // Create a marker for each suburb with location data
    // this.deliveryLocations.forEach(country => {
    //   country.cities.forEach(city => {
    //     city.suburbs.forEach(suburb => {
    //       if (suburb.location) {
    //         // Create a custom pin icon
    //         const pinIcon = L.divIcon({
    //           className: 'custom-div-icon',
    //           html: `<div class="marker-pin bg-primary" style="width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">📍</div>`,
    //           iconSize: [30, 30],
    //           iconAnchor: [15, 30]
    //         });
    //
    //         const marker = L.marker(
    //           [suburb.location.latitude, suburb.location.longitude],
    //           { icon: pinIcon }
    //         ).bindPopup(`<b>${suburb.name}</b><br>We deliver here!`);
    //
    //         newLayers.push(marker);
    //       }
    //     });
    //   });
    // });

    this.zones.forEach((zone:any) => {

      zone.locations.forEach((location:any) => {
        if (location.latitude) {
          // Create a custom pin icon
          const pinIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pin bg-primary" style="width: 30px; height: 30px; background-color: #191a1c; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;"> 📍</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });

          const marker = L.marker(
            [location.latitude, location.longitude],
            { icon: pinIcon }
          ).bindPopup(`<b>${location.suburb}</b><br>We deliver here in ${location.suburb}!`);

          newLayers.push(marker);
        }
      });
    })




    // Update the layers array
    this.layers = [...newLayers];

    // If the map is already initialized, manually add the layers
    if (this.map) {
      this.disableInteractions();
      // Remove existing layers
      this.map.eachLayer((layer:any) => {
        if (layer instanceof L.Marker) {
          this.map?.removeLayer(layer);
        }
      });

      // Add new layers
      newLayers.forEach(layer => {
        layer.addTo(this.map as L.Map);
      });

      // Fit bounds if we have markers
      if (newLayers.length > 0) {
        const group = L.featureGroup(newLayers);
        this.map.fitBounds(group.getBounds(), { padding: [30, 30] });
      }


      // Enable interactions when clicked
      this.map.on('click', () => this.enableInteractions());
    }
  }

  private enableInteractions(): void {
    this.map.dragging.enable();
    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.touchZoom.enable();

    L.control.zoom().addTo(this.map); // Add zoom control

    // Auto-disable interactions after 5 seconds
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }

    this.interactionTimeout = setTimeout(() => {
      this.disableInteractions();
    }, 5000);
  }

  private disableInteractions(): void {
    this.map.dragging.disable();
    this.map.scrollWheelZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.touchZoom.disable();
  }

  // Calculate the number of suburbs we deliver to
  get totalSuburbs(): number {
    let count = 0;
    this.zones.forEach(zone => {
      // zone.locations.forEach((location:any) => {
      //   count += location.suburbs.length;
      // });
      count += zone.locations.length;
    });
    return count;
    // return this.deliveryLocations.length;
  }


  ngOnDestroy(): void {
  //   if (this.interactionTimeout) {
  //     clearTimeout(this.interactionTimeout);
  //   }
  //   if (this.map) {
  //     this.map.remove();
  //     this.map = null;
  //   }
  //
  //   // 👇 Clear the internal Leaflet ID to allow reuse
  //   const mapContainer:any = document.getElementById('map'); // Replace 'map' with your actual element ID if different
  //   if (mapContainer && mapContainer._leaflet_id) {
  //     mapContainer._leaflet_id = undefined;
  //   }
  }
}
