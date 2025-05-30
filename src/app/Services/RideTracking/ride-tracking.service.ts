import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import signalR, { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideTrackingService {

  private hubConnection: HubConnection;
  private tripSubject = new BehaviorSubject<any>(null);
  public trip$ = this.tripSubject.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/RideHub', {
        withCredentials: true
      })
      .build();

    this.startConnection();
  }

  private startConnection() {
    this.hubConnection.start()
      .then(() => console.log('SignalR connection established'))
      .catch(err => console.log('Error while establishing connection: ' + err));
  }

  private registerListeners() {
    this.hubConnection.on('ReceiveTrip', (tripData) => {
      console.log('Trip received:', tripData);
      // هنا ممكن تبعت البيانات للـ component
      this.tripSubject.next(tripData);
    });
  }
}
