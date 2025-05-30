import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderTripService {

  private TripOrderUrl = 'https://localhost:7012/api/Tripix/OrderTrip';
  private AvilvableTripsUrl = "https://localhost:7012/api/Driver/GetAvilableTrips";
  private confirmTripUrl = "https://localhost:7012/api/Driver/Confirm-Trip";
  private confirmDriverUrl = "https://localhost:7012/api/Tripix/Confirm-Driver";
  private GetTripDetailsUrl = "https://localhost:7012/api/Tripix/GetTripDetails";
  private GetUserTripDetailsUrl = "https://localhost:7012/api/Account/Get-Trip-Details";

  constructor(private http : HttpClient) { }

  OrderTrip(Data : any):Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('googletoken') || sessionStorage.getItem('token') || sessionStorage.getItem('googletoken');

    if(token == null) {console.log('Token is null')}
    
      const headers = {
        Authorization: `Bearer ${token}`
      };
    
    return this.http.post(this.TripOrderUrl, Data , { withCredentials: true , headers : headers});
  }

  GetAvilvableTrips():Observable<any>
  {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') ;

    if(token == null) {console.log('Token is null')}
    
      const headers = {
        Authorization: `Bearer ${token}`
      };

      return this.http.get(this.AvilvableTripsUrl, { withCredentials: true , headers : headers});
  }

  confirmtrip(TripData : any):Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') ;

    if(token == null) {console.log('Token is null')}
    
      const headers = {
        Authorization: `Bearer ${token}`
      };

    return this.http.post(this.confirmTripUrl, TripData , { withCredentials: true , headers : headers});
  }

  confirmDriver(TripData : any):Observable<any>
  {
    return this.http.post(this.confirmDriverUrl,TripData);
  }

  GetUserTripDetials(TripData :any):Observable<any>
  {
    return this.http.post(this.GetUserTripDetailsUrl,TripData);
  }

  GetTripDetails(TripData : any):Observable<any>
  {
    return this.http.post(this.GetTripDetailsUrl,TripData);
  }
}
