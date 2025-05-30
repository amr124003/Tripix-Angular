import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GetCarsService {

  getSedanCarsUrl = 'https://localhost:7012/api/Cars/GetCars';
  getBrandsUrl = "https://localhost:7012/api/Cars/GetPrands";

  constructor(private http : HttpClient) { }

  GetSedanCars(Requstfilter : any):Observable<any>
  {
    return this.http.post(this.getSedanCarsUrl,Requstfilter);
  }

  Getbrands():Observable<any>
  {
    return this.http.get(this.getBrandsUrl);
  }
}
