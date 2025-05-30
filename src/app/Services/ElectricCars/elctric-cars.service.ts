import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElctricCarsService {

  GetElectricCarsUrl = 'https://localhost:7012/api/ElectricCars/GetElectricCars';
  GetBrandsUrl = 'https://localhost:7012/api/ElectricCars/GetBrands';

  constructor(private http : HttpClient) { }

  GetElectricCars(Data : any):Observable<any>
  {
    return this.http.post(this.GetElectricCarsUrl , Data);
  }

  GetBrands():Observable<any>
  {
    return this.http.get(this.GetBrandsUrl);
  }

}
