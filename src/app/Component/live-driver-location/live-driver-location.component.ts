import { Component, OnInit } from '@angular/core';
import { RideTrackingService } from '../../Services/RideTracking/ride-tracking.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-live-driver-location',
  imports: [],
  templateUrl: './live-driver-location.component.html',
  styleUrl: './live-driver-location.component.css'
})
export class LiveDriverLocationComponent implements OnInit {
  private map: any;
  private marker: any;
  private rideID = "ride123";  // Ride ID لازم يكون متوفر عند بدأ الرحلة

  constructor(private trackingService: RideTrackingService) {}

  ngOnInit() {
    this.loadMap();
    this.subscribeToTracking();
    this.startTrackingDriver();
  }

  // 🗺 تحميل الخريطة
  loadMap() {
    this.map = L.map('map').setView([30.0444, 31.2357], 13);  // القاهرة كموقع افتراضي

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([30.0444, 31.2357]).addTo(this.map)
      .bindPopup('Driver Location').openPopup();
  }

  // 📡 متابعة تحديثات الموقع من السائق
  subscribeToTracking() {
    this.trackingService.getDriverLocation().subscribe(location => {
      if (location) {
        const newLatLng = L.latLng(location.lat, location.lng);
        this.marker.setLatLng(newLatLng);
        this.map.setView(newLatLng, 13);
      }
    });
  }

  // 🚗 تشغيل إرسال الموقع تلقائيًا (للسائق فقط)
  startTrackingDriver() {
    if (navigator.geolocation) {
      setInterval(() => {
        navigator.geolocation.getCurrentPosition(position => {
          this.trackingService.sendDriverLocation(this.rideID, position.coords.latitude, position.coords.longitude);
        });
      }, 3000);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }
}
