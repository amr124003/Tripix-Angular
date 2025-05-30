import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { data } from 'jquery';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MotorbikesService {

  getmotorbikesUrl = 'https://localhost:7012/api/Motorbikes/GetMotorbikes';
  getmotorbikebrands = 'https://localhost:7012/api/Motorbikes/GetMotorbikesBrands';

  constructor(private http : HttpClient) { }

  GetMotorbikes(Data : any):Observable<any>
  {
    return this.http.post(this.getmotorbikesUrl,Data);
  }

  GetBrands():Observable<any>
  {
    return this.http.get(this.getmotorbikebrands);
  }
}
