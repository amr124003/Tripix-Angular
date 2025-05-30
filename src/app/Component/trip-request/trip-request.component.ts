import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ConnectUserService } from '../../Services/ConnectUser/connect-user.service';
import { OrderTripService } from '../../Services/OrderTrip/order-trip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-request.component.html',
  styleUrl: './trip-request.component.css'
})
export class TripRequestComponent implements  OnInit {



  constructor(private connectuserservice: ConnectUserService ,private orderTrip : OrderTripService,private router : Router) {
    
  }


  ngOnInit(): void {



    this.connectuserservice.startConnection();

    this.connectuserservice.onNewDriver(async (DriverData: any) => {
      this.connectuserservice.offNewDriver(); // إلغاء أي Listener قديم
      console.log('Received new Driver:', DriverData);

      await this.AddDriver(DriverData);
    });

    this.connectuserservice.onNewDriverLocation(async (DriverData: any) => {
      this.connectuserservice.offNewDriverLocation(); // إلغاء أي Listener قديم
      console.log('Received new Driver Location:', DriverData);
      this.updateDriverLocation(DriverData.latitude, DriverData.longitude , DriverData.id);
    });

  }

  showModal = false;
  showMap = false;
  map!: L.Map;
  mapInitialized = false;
  ProductsLoading = true;
  DriverCords: [number, number] = [0, 0];
  DriverMarker!: L.Marker;
  SelectedDriver : any;
  routeLayer: any;
  Drivers: {driverId : string , carName: string, driverlocation: string, driverName: string, DriverphoneNumber: string, price: number, tripId: number , driverLatitude : number  , driverLongitude : number , userLatitude : number , userLogitude : number , UserPhoneNumber : string}[] = [];
  Loading = [
    {
      driverId: "123",
      carName: "Toyota",
      driverlocation: "Cairo",
      driverName: "Ahmed",
      DriverphoneNumber: "01000000000",
      price: 100,
      tripId: 456,
      driverLatitude: 30.0444,
      driverLongitude: 31.2357,
      userLatitude: 30.0500,
      userLogitude: 31.2400,
      UserPhoneNumber: "01111111111"
    },
    {
      driverId: "123",
      carName: "Toyota",
      driverlocation: "Cairo",
      driverName: "Ahmed",
      DriverphoneNumber: "01000000000",
      price: 100,
      tripId: 456,
      driverLatitude: 30.0444,
      driverLongitude: 31.2357,
      userLatitude: 30.0500,
      userLogitude: 31.2400,
      UserPhoneNumber: "01111111111"
    },
    {
      driverId: "123",
      carName: "Toyota",
      driverlocation: "Cairo",
      driverName: "Ahmed",
      DriverphoneNumber: "01000000000",
      price: 100,
      tripId: 456,
      driverLatitude: 30.0444,
      driverLongitude: 31.2357,
      userLatitude: 30.0500,
      userLogitude: 31.2400,
      UserPhoneNumber: "01111111111"
    }
  ];
  async AddDriver(DriverData: any) {
    console.log(DriverData);
    const DriverLocation = await this.getLocationNameFromHere(DriverData.driverLatitude, DriverData.driverLongitude);
    this.Drivers.push({
      driverId : DriverData.driverId,
      carName: DriverData.carName,
      driverlocation: DriverLocation,
      driverLatitude : DriverData.driverLatitude,
      driverLongitude: DriverData.driverLongitude,
      userLatitude : DriverData.userLatitude,
      userLogitude : DriverData.userLongitude,
      driverName: DriverData.driverName,
      DriverphoneNumber: DriverData.driverPhoneNumber,
      UserPhoneNumber : DriverData.userPhoneNumber,
      price: DriverData.price,
      tripId: DriverData.tripId
    });
    this.ProductsLoading = false;
    this.Loading = [];
  }




  // ألوان borders
  borderColors = ['#00aaff', '#ffaa00', '#00ffaa', '#ff0077'];

  updateDriverLocation(newLat: number, newLng: number,DriverId : string) {
    const driverIndex = this.Drivers.findIndex(driver => driver.driverId == DriverId);
    this.Drivers[driverIndex].driverLatitude = newLat;
    this.Drivers[driverIndex].driverLongitude = newLng;
    const userCoords : [number , number] = [this.Drivers[driverIndex].userLatitude,this.Drivers[driverIndex].userLogitude];
    this.DriverCords = [newLat, newLng];
    if (this.DriverMarker) {
      this.DriverMarker.setLatLng(this.DriverCords);
      this.routeLayer.setWaypoints([
        L.latLng(newLat, newLng),
        L.latLng(userCoords) // خزنها في متغير أثناء initMap
      ]);
    }
  }


  goBack() {
    this.showMap = false;
  }

  selectDriver(driver: any) {
    this.showMap = true;
    this.SelectedDriver = driver;

    setTimeout(() => {
      this.initMap(driver);
    }, 200); // بسيط عشان المودال يظهر الأول
  }

  initMap(Driver : any) {
    if (!navigator.geolocation) {
      alert("الموقع غير مدعوم في المتصفح!");
      return;
    }
    
      const userCoords: [number, number] = [Driver.userLatitude, Driver.userLogitude];
      const driver: [number, number] = [Driver.driverLatitude, Driver.driverLongitude] ;

      // إنشاء الخريطة
      this.map = L.map('map').setView(userCoords as [number, number], 13);

      // إضافة طبقة OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // تعريف أيقونة مخصصة للموقع الحالي
      const userIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', // ضع المسار الصحيح للصورة
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // إضافة ماركر للموقع الحالي باستخدام الأيقونة المخصصة
      const uermarker = L.marker(userCoords as [number, number], { icon: userIcon }).addTo(this.map)
        .openPopup();

      // تعريف أيقونة مخصصة للوجهة
      const destinationIcon = L.divIcon({
        className: 'car-icon', // الفئة الخاصة بأيقونة السيارة
        html: `<img src="../../../assets/images/car-icon.webp" style="width: 50px; height: 50px; transform-origin: center;" />`, // HTML للأيقونة مع خاصية التدوير
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50]
      });

      // إضافة ماركر للوجهة باستخدام الأيقونة المخصصة
      this.DriverMarker = L.marker(driver as [number, number], { icon: destinationIcon }).addTo(this.map)
        .openPopup();

      // رسم الاتجاهات بين الموقع الحالي والوجهة


      // متابعة تحديث موقع السائق على المسار
      this.routeLayer = (L as any).Routing.control({
        waypoints: [L.latLng(driver), L.latLng(userCoords)],
        routeWhileDragging: true,
        createMarker: () => null // إخفاء الماركرات التلقائية للمسار
      }).addTo(this.map);
  }

  async getLocationNameFromHere(latitude: number, longitude: number): Promise<string> {
    const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k';
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=ar&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const address = data.items?.[0]?.address?.label || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      return address;

    } catch (error) {
      console.error('Error fetching address from HERE API:', error);
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`; // fallback
    }
  }

  // حساب الزاوية بين نقطتين
  calculateAngle(p1: [number, number], p2: [number, number]): number {
    const dx = p2[1] - p1[1];
    const dy = p2[0] - p1[0];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  }


  getRoute(start: [number, number], end: [number, number]) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (this.routeLayer) {
          this.map.removeLayer(this.routeLayer);
        }

        const route = L.geoJSON(data.routes[0].geometry, {
          style: { color: 'blue', weight: 4 }
        });

        this.routeLayer = route;
        route.addTo(this.map);
      })
      .catch(error => console.error('Error fetching route:', error));
  }

  requestTrip() {
    const TripData = {
      PhoneNumber : this.SelectedDriver.UserPhoneNumber,
      DriverId : this.SelectedDriver.driverId,
      PickupLatitude : this.SelectedDriver.userLatitude,
      PickupLongitude : this.SelectedDriver.userLogitude,
      DriverLatitude : this.SelectedDriver.driverLatitude,
      DriverLongitude : this.SelectedDriver.driverLongitude,
      Price : this.SelectedDriver.price
    };

    console.log(TripData);
    this.router.navigateByUrl('/UserFinalTrip');
  
    this.orderTrip.confirmDriver(TripData).subscribe({
      next:(Response) => {
        localStorage.setItem("TIdentifier",Response.tripId);
        localStorage.setItem("DIdentifier" , Response.driverId);
        console.log(Response);
      },
      error:(Err) => 
      {
        console.log(Err);
      }
    });
  }
}