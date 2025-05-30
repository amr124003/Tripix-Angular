import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { DriverChatComponent } from '../driver-chat/driver-chat.component';
import { OrderTripService } from '../../Services/OrderTrip/order-trip.service';
import { ConnectDriverService } from '../../Services/ConnectDriver/connect-driver.service';

@Component({
  selector: 'app-driverfinaltrip',
  imports: [CommonModule, FormsModule, DriverChatComponent],
  templateUrl: './driverfinaltrip.component.html',
  styleUrl: './driverfinaltrip.component.css',
  animations: [
    trigger('slideUpAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class DriverfinaltripComponent implements OnInit, AfterViewChecked {

  distance = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private map!: L.Map | null;
  isChatVisible: boolean = false;
  shouldScrollToChat = false;
  UserDetails: any;
  private positionWatchId: number | null = null;
  private driverMarker: L.Marker | null = null;
  private driverPolyline: L.Polyline | null = null;
  private driverPositionsHistory: [number, number][] = [];
   UserPhoneNumber : string = '';

  constructor(private orderTrip: OrderTripService , private connectdriver : ConnectDriverService) {

  }


  ngOnInit(): void {
    this.connectdriver.startConnection();

    const TripId = localStorage.getItem('TIndentifier');
    const TripData = {
      TripId: TripId
    }

    console.log(TripData);

    this.orderTrip.GetTripDetails(TripData).subscribe({
      next: async (Response) => {

        this.UserDetails = {
          destinationLatitude: Response.destinationLatitude,
          destinationLongitude: Response.destinationLongitude,
          UserPhoneNumber: Response.phoneNumber,
          pickupLongitude: Response.pickupLongitude,
          pickupLatitude: Response.pickupLatitude,
          status: Response.status,
          tripDate: Response.tripDate,
          tripId: Response.tripId,
          userId: Response.userId,
          userName: Response.userName,
          price: Response.price
        }
        this.UserPhoneNumber = this.UserDetails.UserPhoneNumber;
        const pickupLocation = await this.getLocationNameFromHere(this.UserDetails.pickupLatitude, this.UserDetails.pickupLongitude);
        const DistinationLocation = await this.getLocationNameFromHere(this.UserDetails.destinationLatitude, this.UserDetails.destinationLongitude);
        this.UserDetails.pickupLocation = pickupLocation;
        this.UserDetails.DistinationLocation = DistinationLocation;
        this.initMap(this.UserDetails);
        console.log(this.UserDetails);
      }
    })

    

  }





  ngAfterViewChecked(): void {
    if (this.shouldScrollToChat && this.chatContainer) {
      this.chatContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScrollToChat = false; // نعملها false بعد أول مرة
    }
  }



  async initMap(DriverData: any): Promise<void> {
    if (!DriverData ||
      !DriverData.destinationLatitude || !DriverData.destinationLongitude ||
      !DriverData.pickupLatitude || !DriverData.pickupLongitude) {
      console.error('Missing required coordinates in DriverData');
      return;
    }
  
    const mapContainerId = 'map';
    const mapElement = document.getElementById(mapContainerId);
  
    if (!mapElement) {
      console.error(`Map container with id '${mapContainerId}' not found`);
      return;
    }

  
    try {
      // إيقاف أي متابعة سابقة للموقع
      this.stopWatchingPosition();
  
      // الحصول على الموقع الحالي للسائق
      const driverPosition = await this.getCurrentPosition();
      const driverCoords: [number, number] = [driverPosition.latitude, driverPosition.longitude];
      
      const pickupCoords: [number, number] = [DriverData.pickupLatitude, DriverData.pickupLongitude];
      const destination: [number, number] = [DriverData.destinationLatitude, DriverData.destinationLongitude];
  
      // Clear any existing map
      if (this.map) {
        this.map.remove();
      }
  
      // Create new map
      this.map = L.map(mapContainerId, {
        center: driverCoords,
        zoom: 12,
      });
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
  
      // حساب حدود جميع النقاط
      const bounds = L.latLngBounds([
        driverCoords,
        pickupCoords,
        destination
      ]);
  
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      });
  
      // إنشاء العلامات
      const personIcon = L.icon({
        iconUrl: '../../../assets/images/personMap.png',
        iconSize: [35, 35],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      const personmarker = L.marker(pickupCoords, { icon: personIcon }).addTo(this.map);
  
      const destinationIcon = L.icon({
        iconUrl: '../../../assets/images/mark.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      const destinationmarker = L.marker(destination, { icon: destinationIcon }).addTo(this.map);
  
      const carIcon = L.icon({
        iconUrl: '../../../assets/images/car-icon.webp',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
  
      // إنشاء علامة السائق
      this.driverMarker = L.marker(driverCoords, { 
        icon: carIcon,
        draggable: false
      }).addTo(this.map);
  
      // بدء متابعة موقع السائق
      this.startWatchingPosition();
  
      // رسم المسارات
      const userdistance = await this.getRoute1(pickupCoords, destination, this.map);
      const usertime = this.calculateTimeBasedOnFixedSpeed(userdistance);
  
      const driverdistance = await this.getRoute2(driverCoords, pickupCoords, this.map);
      const drivertime = this.calculateTimeBasedOnFixedSpeed(driverdistance);
      this.distance = userdistance;
  
      const zoom = this.calculateOptimalZoom(driverdistance);
      this.map.setZoom(zoom);


      const customPopup2 = L.popup({
        closeButton: false,
        className: 'custom-popup',
      }).setContent(
        `<div class="popup-content">
                    <p>${usertime}</p> <!-- عرض الزمن -->
                    <p>${userdistance}</p> <!-- عرض المسافة -->
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
                    <p>${drivertime}</p> <!-- عرض الزمن -->
                    <p>${driverdistance}</p> <!-- عرض المسافة -->
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

  private startWatchingPosition(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }
  
    this.stopWatchingPosition();
  
    // إعدادات دقة أعلى مع معدل تحديث مناسب
    this.positionWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        
        // استخدام الحركة المتدرجة بدلاً من التحديث المباشر
        this.updateDriverPositionSmoothly(newPos);
        
        // تحديث المسار كل 5 تحديات للموقع لتقليل الحمل
        if (this.driverPositionsHistory.length % 5 === 0) {
          this.updateDriverRoute(newPos);
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      { 
        enableHighAccuracy: true,  // استخدام GPS عالي الدقة
        maximumAge: 1000,         // لا تقبل بيانات أقدم من ثانية واحدة
        timeout: 5000             // مهلة 5 ثواني للحصول على الموقع
      }
    );
  }

  // دالة لإيقاف متابعة الموقع
  private stopWatchingPosition(): void {
    if (this.positionWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.positionWatchId);
      this.positionWatchId = null;
    }
  }
  
  // دالة لتحديث مسار السائق
  private updateDriverRoute(newPos: [number, number]): Promise<void> {
  return new Promise((resolve) => {
    if (!this.map || !this.UserDetails || !this.driverMarker) {
      resolve();
      return;
    }

    const pickupCoords: [number, number] = [
      this.UserDetails.pickupLatitude,
      this.UserDetails.pickupLongitude
    ];

    // إزالة المسار القديم إذا كان موجوداً
    if (this.driverPolyline) {
      this.map.removeLayer(this.driverPolyline);
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${newPos[1]},${newPos[0]};${pickupCoords[1]},${pickupCoords[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0];
        const routeGeoJson = route.geometry;
        
        const routeCoordinates = routeGeoJson.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        // إنشاء مسار متدرج للحركة السلسة
        this.driverPolyline = L.polyline([], {
          color: '#4285F4',
          weight: 5,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round'
        }).addTo(this.map!);

        // تحريك المسار تدريجياً
        this.animatePolyline(this.driverPolyline, routeCoordinates, 2000);
        resolve();
      })
      .catch(error => {
        console.error('Error updating driver route:', error);
        resolve();
      });
  });
}

private animatePolyline(polyline: L.Polyline, coords: [number, number][], duration: number): void {
  let start: number | null = null;
  const totalPoints = coords.length;
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const currentIndex = Math.floor(progress * (totalPoints - 1));
    
    polyline.setLatLngs(coords.slice(0, currentIndex + 1));
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}

private updateDriverPositionSmoothly(newPos: [number, number]): void {
  if (!this.driverMarker) return;

  // حفظ المواقع السابقة للاستخدام في التحسينات
  this.driverPositionsHistory.push(newPos);
  if (this.driverPositionsHistory.length > 5) {
    this.driverPositionsHistory.shift();
  }

  // تطبيق تنعيم للحركة باستخدام متوسط المواقع الأخيرة
  const smoothedPos = this.smoothPosition(this.driverPositionsHistory);
  
  // الحركة المتدرجة للعلامة
  this.driverMarker.setLatLng(smoothedPos);

  // توجيه العلامة حسب اتجاه الحركة
  
}

private smoothPosition(positions: [number, number][]): [number, number] {
  if (positions.length === 0) return [0, 0];
  if (positions.length === 1) return positions[0];

  // متوسط المواقع الأخيرة للتنعيم
  const sum = positions.reduce((acc, pos) => {
    return [acc[0] + pos[0], acc[1] + pos[1]];
  }, [0, 0]);

  return [sum[0] / positions.length, sum[1] / positions.length];
}

  // دالة للحصول على الموقع الحالي
  private getCurrentPosition(): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting current position:', error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
  
  // تأكد من إيقاف المتابعة عند تدمير المكون
  ngOnDestroy(): void {
    this.stopWatchingPosition();
    
    // تنظيف الخريطة والعلامات
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    this.driverMarker = null;
    this.driverPolyline = null;
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

  chatWithDriver() {
    this.isChatVisible = !this.isChatVisible;
    this.shouldScrollToChat = true; // نخليها true علشان نعرف إن لازم نعمل scroll

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

  cancelTrip() {
    console.log('Trip cancelled');
  }
}