import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) { }


  // Get Delivery Zones
  getDeliveryZones(){
    return this.http.get(`${environment.apiURL}DeliveryZones/Locations`);
  }

  // Get Delivery Zones
  getDeliveryZonesNoGeolocations(){
    return this.http.get(`${environment.apiURL}DeliveryZones/Places`);
  }

  // Get Delivery Zones
  getDeliveryCharges(){
    return this.http.get(`${environment.apiURL}DeliveryCharges/ChooseLists`);
  }
}
