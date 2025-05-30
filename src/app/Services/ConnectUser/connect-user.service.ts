import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ConnectUserService {
private hubConnection: signalR.HubConnection;

  constructor() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || "";

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7012/userhub', {
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
      })
      .catch(err => console.error('Connection error: ', err));
  }

  stopConnection(): void {
    this.hubConnection.stop();
  }

  onNewDriver(callback: (DriverData: any) => void): void {
    this.hubConnection.off('NewDriver'); // مهم: يلغي أي Listener قديم
    this.hubConnection.on('NewDriver', (DriverData: any) => {
      callback(DriverData);  
    });
  }

  onNewDriverLocation(callback: (DriverData: any) => void): void {
    this.hubConnection.on('NewDriverLocation', (DriverData: any) => {
      callback(DriverData);  
    });
  }

  onNewMessage(callback: (Message: any) => void): void {
    this.hubConnection.on('DriverMSG', (Message: any) => {
      callback(Message);  
    });
  }

  

  offNewDriverLocation() {
    this.hubConnection.off('NewDriverLocation'); // مهم: يلغي أي Listener قديم
  }

  offNewDriver() {
    this.hubConnection.off('NewDriver'); // مهم: يلغي أي Listener قديم
  }
}
