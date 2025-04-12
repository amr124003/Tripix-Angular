import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideTrackingService {

  private HubConnection: signalR.HubConnection | undefined;
  private APIUrl: string = "https://localhost:7012/api/Ride/Update-location";
  private driverlocation = new BehaviorSubject<{lat : number, lng : number} | null>(null);

  constructor(private http : HttpClient) 
  {
    this.initSignalRConnection();
  }

  // 🏎 السائق يرسل موقعه للـ API
  sendDriverLocation(rideID: string, latitude: number, longitude: number) {
    return this.http.post(this.APIUrl, { rideID, latitude, longitude }).subscribe();
  }

  // 📡 الراكب يستقبل تحديثات الموقع من الـ SignalR
  private initSignalRConnection() {
    this.HubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7012/ridehub")
      .build();

    this.HubConnection.on("ReceiveDriverLocation", (latitude, longitude) => {
      this.driverlocation.next({ lat: latitude, lng: longitude });
    });

    this.HubConnection.start().catch(err => console.error("SignalR Error:", err));
  }

  // ✅ عشان أي Component يقدر يحصل على الموقع المحدث
  getDriverLocation() {
    return this.driverlocation.asObservable();
  }  
}
