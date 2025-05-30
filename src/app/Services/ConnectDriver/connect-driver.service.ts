import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectDriverService {

  private hubConnection: signalR.HubConnection;

  RegisterDriverUrl = 'https://localhost:7012/api/Driver/RegisterDriver';

  constructor(private http : HttpClient) {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || "";

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7012/ridehub', {
        accessTokenFactory: () => {
          return token || '';
        },
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();
  }

  startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started!');
        this.startLocationTracking(); // نبدأ نراقب اللوكيشن أول ما الاتصال يبدأ
      })
      .catch(err => console.error('Connection error: ', err));
  }

  RegisterDriver(Data : any):Observable<any>
  {
    return this.http.post(this.RegisterDriverUrl,Data);
  }

  

  stopConnection(): void {
    this.hubConnection.stop();
  }

  onReceiveLocation(callback: (data: any) => void): void {
    this.hubConnection.on('ReceiveLocation', callback);
  }

 
  // هنا بعت اللوكيشن الجديد للـ Hub
  
  sendLocation(location: { latitude: number, longitude: number }): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UpdateLocation', location)
        .catch(err => console.error('Error sending location: ', err));
    } else {
      console.warn('Hub connection is not active.');
    }
  }

  onNewMessage(callback: (Message: any) => void): void {
    this.hubConnection.on('UserMSG', (Message: any) => {
      callback(Message);  
    });
  }
  

  onNewTrip(callback: (tripData: any) => void): void {
    this.hubConnection.off('NewTrip'); // مهم: يلغي أي Listener قديم
    this.hubConnection.on('NewTrip', (tripData: any) => {
      callback(tripData);  
    });
  }

  offNewTrip() {
    this.hubConnection.off('NewTrip'); // مهم: يلغي أي Listener قديم
  }

  onDriverConfirmed(callback: (tripData: any) => void): void {
    this.hubConnection.off('DriverConfirmed'); // مهم: يلغي أي Listener قديم
    this.hubConnection.on('DriverConfirmed', (tripData: any) => {
      callback(tripData);  
    });
  }
  offDriverConfirmed()
  {
    this.hubConnection.off("DriverConfirmed");
  }

  private startLocationTracking(): void {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('Sending new location:', location);
          this.sendLocation(location);
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 2000
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
}
