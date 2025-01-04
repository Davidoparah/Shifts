import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Location {
  id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface DirectionsResponse {
  routes: {
    legs: {
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: {
        travel_mode: string;
        instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }[];
    }[];
    overview_polyline: { points: string };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getNearbyLocations(latitude: number, longitude: number, radius: number = 10): Observable<Location[]> {
    return this.http.get<Location[]>(`${environment.apiUrl}/api/locations/nearby`, {
      params: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString()
      }
    });
  }

  getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Observable<DirectionsResponse> {
    return this.http.get<DirectionsResponse>(`${environment.apiUrl}/api/locations/directions`, {
      params: {
        origin_lat: origin.latitude.toString(),
        origin_lng: origin.longitude.toString(),
        dest_lat: destination.latitude.toString(),
        dest_lng: destination.longitude.toString(),
        mode
      }
    });
  }

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  }
} 