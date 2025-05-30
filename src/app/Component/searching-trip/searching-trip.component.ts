import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectDriverService } from '../../Services/ConnectDriver/connect-driver.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';  // تأكد من استيراد مكتبة الـ Routing
import { animate, state, style, transition, trigger } from '@angular/animations';
import { OrderTripService } from '../../Services/OrderTrip/order-trip.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';
import { Router } from '@angular/router';


@Component({
  selector: 'app-searching-trip',
  imports: [CommonModule, FormsModule],
  templateUrl: './searching-trip.component.html',
  styleUrls: ['./searching-trip.component.css'],
  animations: [
    // Animation for navbar links hover
    trigger('hoverAnimation', [
      state('hover', style({ transform: 'translateY(-3px)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' })),
      transition('* => hover', animate('200ms ease-in')),
    ]),
    // Fade-in animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ])
    ]),
    // Modal animation
    trigger('modalAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('slideOut', [
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class SearchingTripComponent implements OnDestroy, OnInit, AfterViewInit {
  isLoading = true;
  trips: { Id: number, name: string, phone: string, destinationLocation: any, pickupLocation: any, Removed: boolean }[] = [];
  filteredTrips: any[] = []; // مصفوفة لتخزين الرحلات المفلترة
  activeMapIndex: number | null = null;
  isMapZoomed = false;  // متغير للتحكم في حالة التكبير
  
  maps: L.Map[] = []; // مصفوفة لتخزين جميع الخرائط
  currentTrip: any; // متغير لتخزين بيانات الرحلة الحالية
  Driverdistances: { driverdistance: string, drivertime: string }[] = [];
  Tripdistances: { userdistance: string, usertime: string }[] = [];
  @ViewChildren('suggestionsScroll') suggestionsScrolls!: QueryList<ElementRef<HTMLDivElement>>;
  prices: number[] = [];
  constructor(private connectdriver: ConnectDriverService, private cdr: ChangeDetectorRef, private orderTrip: OrderTripService, private http: HttpClient , private router : Router) {
    this.orderTrip.GetAvilvableTrips().subscribe({
      next: (data) => {
        console.log(data);
        data.forEach(async (trip: any) => {
          const pickupLocation = await this.getLocationNameFromHere(trip.pickupLatitude, trip.pickupLongitude);
          const DitinationLocation = await this.getLocationNameFromHere(trip.destinationLatitude, trip.destinationLongitude);
          this.addTrip(
            trip.tripId,
            trip.firstName,
            trip.phoneNumber,
            pickupLocation,
            DitinationLocation
          );

          const newTripIndex = this.trips.length - 1;
          this.initializeMap(newTripIndex, trip);
        });

      },
      error: (err) => {
        console.log(err);
      }
    })
    this.trips = this.trips.filter(x => !x.Removed);
  }


  async getLocationNameFromHere(latitude: number, longitude: number): Promise<string> {
    const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k';
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=ar&apiKey=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const address = data.items?.[0]?.address?.label?.replace(/,\s*مصر\s*$/i, '') 
        || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  
      return address;
  
    } catch (error) {
      console.error('Error fetching address from HERE API:', error);
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`; // fallback
    }
  }
  



  ngOnInit(): void {
    this.connectdriver.startConnection();

    this.connectdriver.onNewTrip(async (tripData: any) => {
      this.connectdriver.offNewTrip(); // إلغاء أي Listener قديم
      console.log('Received new trip:', tripData);
      const pickupLocation = await this.getLocationNameFromHere(tripData.pickupLatitude, tripData.pickupLongitude);
      const DitinationLocation = await this.getLocationNameFromHere(tripData.destinationLatitude, tripData.destinationLongitude);
      this.addTrip(
        tripData.tripId,
        tripData.firstName,
        tripData.phoneNumber,
        pickupLocation,
        DitinationLocation
      );
      const newTripIndex = this.trips.length - 1;
      this.initializeMap(newTripIndex, tripData);
    });

    this.connectdriver.onDriverConfirmed(async (tripData : any) => {
      this.connectdriver.offDriverConfirmed();
      this.router.navigateByUrl('/DriverFinalTrip');
      localStorage.setItem("TIndentifier",tripData.tripId);
    });
  }
  ngOnDestroy(): void {
    this.connectdriver.stopConnection();
  // تدمير جميع الخرائط
  this.maps.forEach(map => {
    if (map) {
      map.remove();
    }
  });
  }
  addTrip(Id: number, name: string, phone: string, destinationLocation: any, pickupLocation: any) {
    this.trips.push({ Id, name, phone, destinationLocation, pickupLocation, Removed: false });
    this.cdr.detectChanges();
    console.log(this.trips);
    this.isLoading = false;
  }

  async initializeMap(index: number, trip: any): Promise<void> {
    const mapContainerId = `map-${index}`;

    try {
      const driverCoords = await this.getDriverLocation();
  
      const pickupCoords: [number, number] = [trip.pickupLatitude, trip.pickupLongitude];
      const destination: [number, number] = [trip.destinationLatitude, trip.destinationLongitude];
  
      // إنشاء خريطة جديدة وإضافتها للمصفوفة
      this.maps[index] = L.map(mapContainerId, {
        center: driverCoords,
        zoom: 12,
      });
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.maps[index]);

      // ... (بقية كود إنشاء العلامات والمسارات)

        // حساب حدود جميع النقاط (السائق، نقطة الالتقاط، الوجهة)
        const bounds = L.latLngBounds([
          driverCoords,
          pickupCoords,
          destination
      ]);

      // ضبط مستوى zoom ليتناسب مع المسار
      this.maps[index].fitBounds(bounds, {
          padding: [50, 50], // هامش داخلي
          maxZoom: 16 // أقصى مستوى تكبير (اختياري)
      });
  
      const personIcon = L.icon({
        iconUrl: '../../../assets/images/personMap.png',
        iconSize: [35, 35],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      const personmarker = L.marker(pickupCoords, { icon: personIcon }).addTo(this.maps[index]);
  
      const destinationIcon = L.icon({
        iconUrl: '../../../assets/images/mark.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      const destinationmarker = L.marker(destination, { icon: destinationIcon }).addTo(this.maps[index]);
  
      const carIcon = L.icon({
        iconUrl: '../../../assets/images/car-icon.webp',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      L.marker(driverCoords, { icon: carIcon }).addTo(this.maps[index]);
  
      // استخدام الخريطة الصحيحة من المصفوفة
      const userdistance = await this.getRoute1(pickupCoords, destination, this.maps[index]);
      const price = this.calculateRoundedPrice(userdistance);
      this.prices.push(price);
      const pricessuggestion = this.getPriceSuggestions(price);
      this.suggestedPrices.push({ index, values: pricessuggestion });
      this.minPrices[index] = Math.min(...pricessuggestion) - 5;
      this.maxPrices[index] = Math.max(...pricessuggestion) + 5;

      const usertime = this.calculateTimeBasedOnFixedSpeed(userdistance);
      this.Tripdistances.push({ userdistance, usertime });


      const driverdistance = await this.getRoute2(driverCoords, pickupCoords, this.maps[index]);

      const drivertime = this.calculateTimeBasedOnFixedSpeed(driverdistance);

      const zoom = this.calculateOptimalZoom(userdistance)
      this.maps[index].setZoom(zoom); // تعيين مستوى التكبير المناسب

      this.Driverdistances.push({ driverdistance, drivertime });

      const customPopup2 = L.popup({
        closeButton: false,
        className: 'custom-popup',
      }).setContent(
        `<div class="popup-content">
               <p>${this.Tripdistances[index].usertime}</p> <!-- عرض الزمن -->
               <p>${this.Tripdistances[index].userdistance}</p> <!-- عرض المسافة -->
          </div>`
      );

      // إضافة الـ CSS مباشرة للـ popup في JavaScript
      const style2 = document.createElement('style');
      style2.innerHTML = `
          .custom-popup {
              background-color: #007bff !important; /* اللون الأزرق */
              color:rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              border-radius: 8px; /* تحديد حواف دائرية */
          }
      
          .leaflet-popup {
              background-color: #007bff !important; /* تغيير خلفية الـ popup */
              color:rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              border-radius: 8px !important; /* تحديد الحواف بشكل دائري */
              box-shadow: none !important; /* إزالة الظلال حول الـ popup */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
          }
          .leaflet-popup-content{
          margin:0px;
          line-height: 0.3;
          text-align:
          
          }
          
          .popup-content {
              color: rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              font-size: 12px !important; /* تحديد حجم الخط */
              text-align: center; /* محاذاة النص في المنتصف */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
           }
  
            .popup-content p {
              line-height : 0.3px
              font-family: 'Arial', sans-serif; /* تحديد نوع الخط */
              font-weight:600;
  
           }
      
          .leaflet-popup-content-wrapper {
              background-color: transparent !important; /* إزالة الخلفية البيضاء داخل الـ popup */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
              text-align: -webkit-center;
          }
          
         .leaflet-popup-tip {
          border: none !important; /* إزالة السهم التقليدي */
          height: 6px !important; /* تعيين ارتفاع الخط */
          background-color: #007bff !important; /* لون الخط */
          width: 50px !important; /* تحديد عرض الخط ليكون أصغر */
          margin-top: -5px !important; /* تعديل مكان الخط ليظهر في الأسفل */
        }
      `;
      document.head.appendChild(style2);

      destinationmarker.bindPopup(customPopup2).openPopup();

      const customPopup1 = L.popup({
        closeButton: false,
        className: 'custom-popup',
      }).setContent(
        `<div class="popup-content">
               <p>${this.Driverdistances[index].drivertime}</p> <!-- عرض الزمن -->
               <p>${this.Driverdistances[index].driverdistance}</p> <!-- عرض المسافة -->
          </div>`
      );

      // إضافة الـ CSS مباشرة للـ popup في JavaScript
      const style1 = document.createElement('style');
      style1.innerHTML = `
          .custom-popup {
              background-color: #007bff !important; /* اللون الأزرق */
              color:rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              border-radius: 8px; /* تحديد حواف دائرية */
          }
      
          .leaflet-popup {
              background-color: #007bff !important; /* تغيير خلفية الـ popup */
              color:rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              border-radius: 8px !important; /* تحديد الحواف بشكل دائري */
              box-shadow: none !important; /* إزالة الظلال حول الـ popup */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
          }
             .leaflet-popup-content{
               margin:0px;
               line-height: 0.3;
               text-align:
             }
          
          .popup-content {
              color: rgb(255, 255, 255) !important; /* النص باللون الأبيض */
              font-size: 12px !important; /* تحديد حجم الخط */
              text-align: center; /* محاذاة النص في المنتصف */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
           }
  
            .popup-content p {
              line-height : 0.3px
              font-family: 'Arial', sans-serif; /* تحديد نوع الخط */
              font-weight:600;
  
           }
      
          .leaflet-popup-content-wrapper {
              background-color: transparent !important; /* إزالة الخلفية البيضاء داخل الـ popup */
              width: 50px !important; /* تحديد عرض الـ popup */
              height: 50px !important; /* تحديد عرض الـ popup */
              text-align: -webkit-center;
          }
          
         .leaflet-popup-tip {
          border: none !important; /* إزالة السهم التقليدي */
          height: 6px !important; /* تعيين ارتفاع الخط */
          background-color: #007bff !important; /* لون الخط */
          width: 50px !important; /* تحديد عرض الخط ليكون أصغر */
          margin-top: -5px !important; /* تعديل مكان الخط ليظهر في الأسفل */
        }
      `;
      document.head.appendChild(style1);

      personmarker.bindPopup(customPopup1).openPopup(); 

    } catch (err) {
      console.error('Failed to get location or render map:', err);
    }
  }

  getDriverLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          resolve([pos.coords.latitude, pos.coords.longitude]);

        }, err => {
          reject(err);
        });
      } else {
        reject('Geolocation not supported');
      }
    });
  }

  price : number = 0

  confirmTrip(trip: any, index: number) {

    if(this.selectedPrice[index])
    {
      this.price = this.selectedPrice[index]!;
    }
    if(this.prices[index])
    {
      this.price = this.prices[index];
    }
    const TripData = {
      price: this.price,
      tripId: trip.Id,
      phoneNumber: trip.phone
    }

    console.log(TripData);
    console.log(TripData);
    this.orderTrip.confirmtrip(TripData).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response) => {
        console.log(response);
      }
    })

  }



  getRoute1(start: [number, number], end: [number, number], map: L.Map): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const route = data.routes[0];
          const routeGeoJson = route.geometry;
          const distanceInMeters = route.distance;
  
          const formattedDistance = distanceInMeters < 1000
            ? `${Math.round(distanceInMeters)} M`
            : `${Math.round(distanceInMeters / 1000)} Km`;
  
          const routeCoordinates = routeGeoJson.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
  
          const polyline = L.polyline([], {
            color: 'blue',
            weight: 4,
            opacity: 0.7
          });
  
          polyline.addTo(map);
  
          let currentIndex = 0;
          const totalPoints = routeCoordinates.length;
  
          const distanceInKm = distanceInMeters / 1000;
  
          // ⚡ معادلة تعكس العلاقة: كل ما المسافة تزيد، السرعة تزيد بشكل أوضح
          let stepDuration = 1000 / Math.sqrt(distanceInKm); // أسرع في المسافات الطويلة
          stepDuration = Math.min(Math.max(stepDuration, 2), 2); // بين 2ms و 200ms
  
          const animateRoute = () => {
            if (currentIndex < totalPoints) {
              currentIndex++;
              polyline.setLatLngs(routeCoordinates.slice(0, currentIndex));
              map.panTo(routeCoordinates[currentIndex - 1]);
            } else {
              clearInterval(animationInterval);
              resolve(formattedDistance);
            }
          };
  
          const animationInterval = setInterval(animateRoute, stepDuration);
        })
        .catch(error => {
          console.error('Error fetching route:', error);
          reject(error);
        });
    });
  }
      

getRoute2(start: [number, number], end: [number, number], map: L.Map): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0];
        const routeGeoJson = route.geometry;
        const distanceInMeters = route.distance;
        
        // تعديل هنا لضمان الرقم الصحيح المقرب
        const formattedDistance = distanceInMeters < 1000
          ? `${Math.round(distanceInMeters)} M`  // تقريب الأمتار لعدد صحيح
          : `${Math.round(distanceInMeters / 1000)} Km`;  // تقريب الكيلومترات لعدد صحيح

        const routeCoordinates = routeGeoJson.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        const smoothLine: L.LatLngExpression[] = [];
        const polyline = L.polyline([], {
          color: 'green',
          weight: 4,
          opacity: .9,
          dashArray: '10, 10'
        }).addTo(map);

        let segmentIndex = 0;
        let step = 0;
        const stepsPerSegment = 10;

        const animate = () => {
          if (segmentIndex >= routeCoordinates.length - 1) {
            clearInterval(interval);
            resolve(formattedDistance); // إرجاع السلسلة النصية مع الرقم الصحيح
            return;
          }

          const startPoint = routeCoordinates[segmentIndex];
          const endPoint = routeCoordinates[segmentIndex + 1];

          const lat = startPoint[0] + ((endPoint[0] - startPoint[0]) * step) / stepsPerSegment;
          const lng = startPoint[1] + ((endPoint[1] - startPoint[1]) * step) / stepsPerSegment;

          smoothLine.push([lat, lng]);
          polyline.setLatLngs(smoothLine);
          map.panTo([lat, lng], { animate: false });

          step++;

          if (step > stepsPerSegment) {
            step = 0;
            segmentIndex++;
          }
        };

        const interval = setInterval(animate, 0.1);
      })
      .catch(error => {
        console.error('Error fetching route:', error);
        reject(error);
      });
  });
}

  parseCoordinates(location: string): L.LatLngTuple {
    const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
    return [lat, lon];
  }

  formatDistance(coord1: [number, number], coord2: [number, number]): string {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1) {
      const distanceMeters = distanceKm * 1000;
      return `${distanceMeters.toFixed(0)} M`;
    } else {
      return `${distanceKm.toFixed(2)} Km`;
    }
  }

  calculateTimeBasedOnFixedSpeed(distanceString: string, speed: number = 60): string {
    const distanceParts = distanceString.split(" ");
    const distance = parseFloat(distanceParts[0]);
    const unit = distanceParts[1].toLowerCase();

    let distanceInKm = distance;
    if (unit === "m") {
      distanceInKm = distance / 1000;
    }

    const timeInHours = distanceInKm / speed;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);

    let result = '';

    if (hours > 0) {
      result += `${hours} ساعة `;
    }
    if (minutes > 0 || result === '') { // لو مفيش ساعات خالص، نعرض الدقايق حتى لو كانت 0
      result += `${minutes} دقيقة`;
    }

    return result.trim();
  }

  suggestedPrices: { index: number, values: number[] }[] = [];
  selectedSuggestion: number | null = null;
  selectedPrice: number[] = [];
  minPrices : number[] = [];  // الحد الأدنى للسعر
  maxPrices: number[] = []; // الحد الأقصى للسعر
  showWarning = false;
  warningMessage = '';
  priceInputState = 'normal'; // يمكن أن تكون: 'normal' أو 'pop'
  isDragging = false;
  startX = 0;
  scrollLeftt = 0;

  isLeftArrowDisabled = true;
  isRightArrowDisabled = false;

  ngAfterViewInit() {
    this.trips.forEach((trip: any, index) => {
      this.initializeMap(index, trip).then(() => {
        this.cdr.detectChanges(); // تأكد من تحديث العرض بعد إضافة الخريطة
      });
    });
    this.checkScrollPosition(0);
  }

  // التمرير بالأسهم
  scrollLeft(index: number) {
    const scrollElements = this.suggestionsScrolls.toArray();
    if (!scrollElements[index]) return;

    scrollElements[index].nativeElement.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
    setTimeout(() => this.checkScrollPosition(index), 300);
  }

  validatePrice(index : number) {
    this.showWarning = false;

    if (this.selectedPrice[index] === null) return;

    const inputElement = document.querySelector('.price-input') as HTMLInputElement;

    if (this.selectedPrice[index] < this.minPrices[index]) {
      this.showWarningMessage('The price cannot be less than ' + this.minPrices[index] + ' EGP', inputElement,index);
    }
    else if (this.selectedPrice[index] > this.maxPrices[index]) {
      this.showWarningMessage('The price cannot exceed ' + this.maxPrices[index] + ' EGP', inputElement,index);
    }
  }

  private addVibrationEffect(element: HTMLElement): void {
    element.classList.add('vibrate');
    setTimeout(() => {
      element.classList.remove('vibrate');
    }, 500);
  }

  private animatePriceInput() {
    this.priceInputState = 'pop';
    setTimeout(() => {
      this.priceInputState = 'normal';
    }, 300);
  }

  private animatebuttonInput() {
    this.priceInputState = 'pop';
    setTimeout(() => {
      this.priceInputState = 'normal';
    }, 300);
  }

  checkPriceWhileTyping(event: Event , index : number) {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.selectedPrice[index] = parseInt(value);
      this.validatePrice(index);
    }
  }

  private showWarningMessage(message: string, element: HTMLElement,index:number) {
    this.warningMessage = message;
    this.showWarning = true;
    this.addVibrationEffect(element);

    setTimeout(() => {
      this.selectedPrice[index] = Math.max(this.minPrices[index], Math.min(this.maxPrices[index], this.selectedPrice[index]));
    }, 500);
  }

  scrollRight(index: number) {
    const scrollElements = this.suggestionsScrolls.toArray();
    if (!scrollElements[index]) return;

    scrollElements[index].nativeElement.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
    setTimeout(() => this.checkScrollPosition(index), 300);
  }

  currentDragIndex: number | null = null;
  // التمرير بالسحب
  startDrag(event: MouseEvent | TouchEvent, index: number) {
    const scrollElements = this.suggestionsScrolls.toArray();
    if (!scrollElements[index]) return;

    this.currentDragIndex = index;
    this.isDragging = true;
    const scrollElement = scrollElements[index].nativeElement;

    this.startX = this.getClientX(event) - scrollElement.offsetLeft;
    this.scrollLeftt = scrollElement.scrollLeft;
  }

  endDrag() {
    this.isDragging = false;
    this.currentDragIndex = null;
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || this.currentDragIndex === null) return;
    event.preventDefault();

    const scrollElements = this.suggestionsScrolls.toArray();
    if (!scrollElements[this.currentDragIndex]) return;

    const scrollElement = scrollElements[this.currentDragIndex].nativeElement;
    const x = this.getClientX(event) - scrollElement.offsetLeft;
    const walk = (x - this.startX) * 2;

    scrollElement.scrollLeft = this.scrollLeftt - walk;
    this.checkScrollPosition(this.currentDragIndex);
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  // التحقق من موضع التمرير
  checkScrollPosition(index: number) {
    const scrollElements = this.suggestionsScrolls.toArray();
    if (!scrollElements[index]) return;

    const element = scrollElements[index].nativeElement;
    const maxScroll = element.scrollWidth - element.clientWidth;

    this.isLeftArrowDisabled = element.scrollLeft <= 0;
    this.isRightArrowDisabled = element.scrollLeft >= maxScroll;
  }

  selectSuggestion(suggestion: number, event: MouseEvent,index:number) {
    this.selectedSuggestion = suggestion;
    this.selectedPrice[index] = suggestion;
    this.animatePriceInput();
    this.animatebuttonInput();


    // تأثير اهتزاز بسيط
    const element = event.target as HTMLElement;
    element.classList.add('vibrate');
    setTimeout(() => {
      element.classList.remove('vibrate');
    }, 300);
  }
  currentTripIndex: number = 0;
  // للتعامل مع تغير حجم الشاشة

  calculateRoundedPrice(distanceStr: string): number {
    const distance = parseFloat(distanceStr.replace(/[^\d.]/g, ''));

    if (isNaN(distance)) {
      throw new Error("Invalid distance format");
    }

    const baseFare = 5;
    const ratePerKm = 4;

    const total = baseFare + (distance * ratePerKm);
    const roundedTotal = Math.round(total); // التقريب لأقرب جنيه

    return roundedTotal ;
  }

  getPriceSuggestions(priceStr: number): number[] {

    const suggestions: number[] = [];

    const minPrice = Math.max(priceStr - 10, 0); // ماينفعش ننزل تحت الصفر
    const maxPrice = priceStr + 15;

    for (let p = minPrice; p <= maxPrice; p++) {
      if (p !== priceStr) {
        suggestions.push(p);
      }
    }

    return suggestions;
  }
  private calculateOptimalZoom(distanceString: string): number {
    const regex = /([\d.]+)\s*(km|m)/i;
    const match = distanceString.match(regex);

    if (!match) {
        throw new Error("Invalid distance format. Use formats like '3.5 Km' or '700 M'.");
    }

    let value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    let distanceInMeters = unit === "km" ? value * 1000 : value;

    if (distanceInMeters < 1000) {
        return 16;
    } else if (distanceInMeters < 5000) {
        return 14;
    } else if (distanceInMeters < 20000) {
        return 12;
    } else {
        return 10;
    }
}


  rejectTrip(index: number) {
    if (this.maps[index]) {
      this.maps[index].remove(); // تدمير الخريطة
      this.maps.splice(index, 1); // إزالة من المصفوفة
    }
    this.trips[index].Removed = true;
    this.trips.splice(index, 1);

    if(this.trips.every(trip => trip.Removed)) {
      this.isLoading = true; // إعادة تعيين حالة التحميل
    }
  }

}
