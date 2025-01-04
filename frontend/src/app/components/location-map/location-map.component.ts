import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, Location, DirectionsResponse } from '../../services/location.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-location-map',
  template: `
    <div class="map-container">
      <div #mapElement class="map"></div>
      
      <div class="directions-panel" *ngIf="directions">
        <ion-list>
          <ion-list-header>
            <ion-label>Directions</ion-label>
          </ion-list-header>

          <ion-item *ngFor="let route of directions.routes[0].legs[0].steps">
            <ion-label [innerHTML]="route.instructions"></ion-label>
            <ion-note slot="end">{{route.distance.text}}</ion-note>
          </ion-item>

          <ion-item lines="none">
            <ion-label>
              <p>Total Distance: {{directions.routes[0].legs[0].distance.text}}</p>
              <p>Estimated Time: {{directions.routes[0].legs[0].duration.text}}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div class="travel-mode-selector">
        <ion-segment [(ngModel)]="selectedMode" (ionChange)="onTravelModeChange($event)">
          <ion-segment-button value="driving">
            <ion-icon name="car"></ion-icon>
          </ion-segment-button>
          <ion-segment-button value="transit">
            <ion-icon name="bus"></ion-icon>
          </ion-segment-button>
          <ion-segment-button value="walking">
            <ion-icon name="walk"></ion-icon>
          </ion-segment-button>
          <ion-segment-button value="bicycling">
            <ion-icon name="bicycle"></ion-icon>
          </ion-segment-button>
        </ion-segment>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      height: 100%;
      width: 100%;
    }

    .map {
      height: 100%;
      width: 100%;
    }

    .directions-panel {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      max-height: 100%;
      background: rgba(255, 255, 255, 0.9);
      overflow-y: auto;
      border-radius: 8px;
      margin: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .travel-mode-selector {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    ion-segment {
      background: white;
    }

    @media (max-width: 768px) {
      .directions-panel {
        width: calc(100% - 16px);
        max-height: 40%;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LocationMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  @Input() location!: Location;
  @Output() directionsLoaded = new EventEmitter<DirectionsResponse>();

  private map: any;
  private marker: any;
  private directionsService: any;
  private directionsRenderer: any;
  private userPosition: GeolocationPosition | null = null;
  
  directions: DirectionsResponse | null = null;
  selectedMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving';

  constructor(
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.initMap();
    await this.loadUserLocation();
    if (this.userPosition) {
      await this.getDirections();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
  }

  private async initMap() {
    const mapOptions = {
      center: { lat: this.location.latitude, lng: this.location.longitude },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: false
    });

    this.marker = new google.maps.Marker({
      position: { lat: this.location.latitude, lng: this.location.longitude },
      map: this.map,
      title: this.location.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div>
          <h3>${this.location.name}</h3>
          <p>${this.location.formatted_address}</p>
        </div>
      `
    });

    this.marker.addListener('click', () => {
      infoWindow.open(this.map, this.marker);
    });
  }

  private async loadUserLocation() {
    try {
      this.userPosition = await this.locationService.getCurrentLocation();
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  async onTravelModeChange(event: any) {
    this.selectedMode = event.detail.value;
    await this.getDirections();
  }

  private async getDirections() {
    if (!this.userPosition) return;

    try {
      const directions = await this.locationService.getDirections(
        {
          latitude: this.userPosition.coords.latitude,
          longitude: this.userPosition.coords.longitude
        },
        {
          latitude: this.location.latitude,
          longitude: this.location.longitude
        },
        this.selectedMode
      ).toPromise();

      if (directions) {
        this.directions = directions;
        this.directionsLoaded.emit(directions);
        this.cdr.detectChanges();

        // Update the map with the directions
        const request = {
          origin: { lat: this.userPosition.coords.latitude, lng: this.userPosition.coords.longitude },
          destination: { lat: this.location.latitude, lng: this.location.longitude },
          travelMode: this.selectedMode.toUpperCase()
        };

        this.directionsService.route(request, (result: any, status: string) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result);
          }
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
    }
  }
} 