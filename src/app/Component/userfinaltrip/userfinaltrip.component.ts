import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { UserChatComponent } from '../user-chat/user-chat.component';
import { OrderTripService } from '../../Services/OrderTrip/order-trip.service';
import { ConnectUserService } from '../../Services/ConnectUser/connect-user.service';

@Component({
  selector: 'app-userfinaltrip',
  imports: [CommonModule, FormsModule, UserChatComponent],
  templateUrl: './userfinaltrip.component.html',
  styleUrl: './userfinaltrip.component.css',
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
export class UserfinaltripComponent implements OnInit, AfterViewChecked, AfterViewInit {

  driverName = 'Ahmed Mohamed';
  driverPhone = '01234567890';
  distance: string = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  DriverData: any;
  driverMarker: L.Marker | null = null;
  driverToPickupPolyline: L.Polyline | null = null;

  constructor(private orderTrip: OrderTripService, private connectuserservice: ConnectUserService) {
  }
  ngAfterViewInit(): void {

  }

  map!: L.Map;
  isChatVisible: boolean = false;
  shouldScrollToChat = false;


  ngOnInit(): void {
    this.connectuserservice.startConnection();
    const TripData = {
      TripId: localStorage.getItem("TIdentifier"),
      DriverId: localStorage.getItem("DIdentifier")
    }

    this.orderTrip.GetUserTripDetials(TripData).subscribe({
      next: async (Response) => {
        console.log(Response);
        this.DriverData = Response;
        
        console.log(this.DriverData);
        const pickupLocation = await this.getLocationNameFromHere(this.DriverData.pickupLatitude, this.DriverData.pickupLongitude);
        const DistinationLocation = await this.getLocationNameFromHere(this.DriverData.distinationLatitude, this.DriverData.distinationLongitude);
        this.DriverData.pickupLocation = pickupLocation;
        this.DriverData.DistinationLocation = DistinationLocation;

        this.initMap(this.DriverData);
      }
    })


    this.connectuserservice.onNewDriverLocation(async (DriverData: any) => {
      console.log(DriverData);
      await this.updateDriverLocation([DriverData.latitude, DriverData.longitude], [this.DriverData.pickupLatitude, this.DriverData.pickupLongitude]);
    });

    this.connectuserservice.onNewMessage(async (DriverData: any) => {
      console.log('Received new Driver Message:', DriverData);
    });

  }



  ngAfterViewChecked(): void {
    if (this.shouldScrollToChat && this.chatContainer) {
      this.chatContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScrollToChat = false; // نعملها false بعد أول مرة
    }
  }


  async initMap(DriverData: any): Promise<void> {

    if (!DriverData ||
      !DriverData.driverLatitude || !DriverData.driverLongitude ||
      !DriverData.pickupLatitude || !DriverData.pickupLongitude ||
      !DriverData.distinationLatitude || !DriverData.distinationLongitude) {
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
      const driverCoords: [number, number] = [DriverData.driverLatitude, DriverData.driverLongitude];
      const pickupCoords: [number, number] = [DriverData.pickupLatitude, DriverData.pickupLongitude]; // Fixed this line
      const destination: [number, number] = [DriverData.distinationLatitude, DriverData.distinationLongitude];

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
      // ... (بقية كود إنشاء العلامات والمسارات)

      // حساب حدود جميع النقاط (السائق، نقطة الالتقاط، الوجهة)
      const bounds = L.latLngBounds([
        driverCoords,
        pickupCoords,
        destination
      ]);

      // ضبط مستوى zoom ليتناسب مع المسار
      this.map.fitBounds(bounds, {
        padding: [50, 50], // هامش داخلي
        maxZoom: 16 // أقصى مستوى تكبير (اختياري)
      });

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

      this.driverMarker = L.marker(driverCoords, { icon: carIcon }).addTo(this.map);

      // استخدام الخريطة الصحيحة من المصفوفة
      const userdistance = await this.getRoute1(pickupCoords, destination, this.map);
      const usertime = this.calculateTimeBasedOnFixedSpeed(userdistance);


      const driverdistance = await this.getRoute2(driverCoords, pickupCoords, this.map);
      const drivertime = this.calculateTimeBasedOnFixedSpeed(driverdistance);
      this.distance = userdistance;



      const zoom = this.calculateOptimalZoom(driverdistance)
      this.map.setZoom(zoom); // تعيين مستوى التكبير المناسب


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

  

  private lastUpdateTime = 0;

  private lastPosition: [number, number] | null = null;
private animationFrameId: number | null = null;

async updateDriverLocation(newDriverCoords: [number, number], pickupCoords: [number, number]): Promise<void> {
  if (!this.map || !this.driverMarker) return;

  // إلغاء أي حركة سابقة إذا كانت قيد التنفيذ
  if (this.animationFrameId) {
    cancelAnimationFrame(this.animationFrameId);
  }

  // إذا كانت هذه أول حركة، ننقل العلامة مباشرة
  if (!this.lastPosition) {
    this.driverMarker.setLatLng(newDriverCoords);
    this.lastPosition = newDriverCoords;
    await this.updateRoute(newDriverCoords, pickupCoords);
    return;
  }

  // حساب المسافة والاتجاه للحركة السلسة
  const startPos = this.lastPosition;
  const endPos = newDriverCoords;
  const duration = 1000; // مدة الحركة بالمللي ثانية

  // بدء الحركة المتدرجة
  const startTime = performance.now();
}

private easeOutQuad(t: number): number {
  return t * (2 - t);
}

private rotateMarkerTowards(marker: L.Marker, targetPos: [number, number]): void {
  const currentPos = marker.getLatLng();
  const dx = targetPos[1] - currentPos.lng;
  const dy = targetPos[0] - currentPos.lat;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const icon = marker.getIcon() as L.Icon;
  if (icon) {
    const element = marker.getElement();
    if (element) {
      element.style.transform = `rotate(${angle + 90}deg)`;
      element.style.transition = 'transform 0.3s ease-out';
    }
  }
}

private async updateRoute(startPos: [number, number], endPos: [number, number]): Promise<void> {
  if (!this.map) return;

  // إزالة المسار القديم إذا كان موجوداً
  if (this.driverToPickupPolyline) {
    this.map.removeLayer(this.driverToPickupPolyline);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startPos[1]},${startPos[0]};${endPos[1]},${endPos[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    const route = data.routes[0];
    
    const routeCoordinates = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
    );

    // إنشاء مسار متدرج للحركة السلسة
    this.driverToPickupPolyline = L.polyline([], {
      color: '#4285F4',
      weight: 5,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(this.map);

    // رسم المسار تدريجياً
    this.animatePolyline(this.driverToPickupPolyline, routeCoordinates, 1000);
    
    // حساب المسافة الجديدة
    const distanceInMeters = route.distance;

  } catch (error) {
    console.error('Error updating route:', error);
  }
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