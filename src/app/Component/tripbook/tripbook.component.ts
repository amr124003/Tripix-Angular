import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild , ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClientModule } from '@angular/common/http'; // ✅ استيراد HttpClientModule
import 'leaflet-routing-machine';
import { log } from 'console';
import { TripRequestComponent } from "../trip-request/trip-request.component";
import { OrderTripService } from '../../Services/OrderTrip/order-trip.service';
import { ConnectUserService } from '../../Services/ConnectUser/connect-user.service';





@Component({
  selector: 'app-tripbook',
  imports: [FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule, TripRequestComponent],
  templateUrl: './tripbook.component.html',
  styleUrl: './tripbook.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TripbookComponent implements AfterViewInit, OnInit {
  rideForm: FormGroup;
  private map!: L.Map;
  private userMarker!: L.Marker;
  isModalOpen = false;
  private defaultLocation: L.LatLngExpression = [30.0444, 31.2357]; // موقع افتراضي (القاهرة)
  startLocation: string = '';
  destination: string = '';
  private selectedMarker: L.Marker | null = null;
  private selectedMarker2 : L.Marker<any> | null = null;
  showStartSuggestions: boolean = false;
  showDestinationSuggestions: boolean = false;
  selectedType: 'start' | 'destination' | null = null;
  hasUserInputStart: boolean = false;
  hasUserInputDestination: boolean = false;
  startPoint: L.LatLng | null = null;
  endPoint: L.LatLng | null = null;
  routingControl!: any;
  startAddressSuggestions: string[] = [];
  destinationAddressSuggestions: string[] = [];
  address! : string;
  pickupMarker!: L.Marker;
  destinationMarker!: L.Marker;
  pickupLocation!: L.LatLng;
  destinationLocation!: L.LatLng;
  @ViewChild('pickupInput', { static: false }) pickupInput!: ElementRef;
  @ViewChild('destinationInput', { static: false }) destinationInput!: ElementRef;
  @ViewChild('windowdate') dateInput!: ElementRef;
  estimatedDistance: number = 0;
  estimatedTime: number = 0;
  estimatedCost: number = 0;
  minDate! : string
  lat : any 
  lng : any
  TripModalOpen = false;
  pickupLatitude: any = 0; 
  pickupLongitude: any = 0; 
  destinationLatitude: any = 0;
  destinationLongitude: any = 0;
  Tripconuter = 0;
  
  

  private startMarker!: L.Marker;
  private endMarker!: L.Marker;
  

  constructor(private http: HttpClient , private fb: FormBuilder , private triporder : OrderTripService , private connectuserservice : ConnectUserService) {
    this.rideForm = this.fb.group({
      passengerType: ['me', Validators.required],
      firstName: [''],
      lastName: [''],
      phone: ['']
    });
  }

  closeModal()
  {
    this.TripModalOpen = false;
    this.isDialogOpen = false;
  }

  TripOrder = {
    pickupLatitude: '',
    pickupLongitude: '',
    destinationLatitude: '',
    destinationLongitude: '',
    dateTime: '',
    firstName: '',
    lastName: '',
    phone: ''
  }
  // عند تغيير نوع الركاب
 
  onSubmit() {

    if (this.isForSomeoneElse) {
      this.rideForm.get('firstName')?.markAsTouched();
      this.rideForm.get('lastName')?.markAsTouched();
      this.rideForm.get('phone')?.markAsTouched();
    }

    


  
    if (this.isForSomeoneElse && this.rideForm.invalid) {
      return; // مش هيكمل التنفيذ وهيظهر الأخطاء
    }

    this.TripOrder = {
      pickupLatitude: this.pickupLatitude,
      pickupLongitude: this.pickupLongitude,
      destinationLatitude: this.destinationLatitude,
      destinationLongitude: this.destinationLongitude,
      dateTime: this.selectedDateTime,
      firstName: this.rideForm.get('firstName')?.value,
      lastName: this.rideForm.get('lastName')?.value,
      phone: this.rideForm.get('phone')?.value
    }

    if(this.Tripconuter != 0) {this.TripModalOpen = true; return;}

    
    if (this.rideForm.valid && this.startLocation && this.destination && this.Tripconuter == 0) {

      console.log(this.TripOrder);
      this.triporder.OrderTrip(this.TripOrder).subscribe({
        next: (response) => {
          console.log('تم إرسال الطلب بنجاح:', response);
          this.TripModalOpen = true;
          this.Tripconuter++;
        },
        error: (error) => {
          console.error('حدث خطأ أثناء إرسال الطلب:', error);
        }
      })
      
    }
  }

  validateForm() {
    console.log('Form submitted:', this.rideForm.value);
    if (this.isForSomeoneElse) {
      
      this.rideForm.get('firstName')?.markAsTouched();
      this.rideForm.get('lastName')?.markAsTouched();
      this.rideForm.get('phone')?.markAsTouched();
    }
  }

  hideSuggestions(type: 'start' | 'destination'): void {
    setTimeout(() => {
      if (type === 'start') {
        this.showStartSuggestions = false;
      } else {
        this.showDestinationSuggestions = false;
      }
    }, 200);
  }

  fetchAddressSuggestions(type: 'start' | 'destination'): void {
    if (type === 'start') {
      this.hasUserInputStart = this.startLocation.length > 0;
      this.startAddressSuggestions = this.hasUserInputStart
        ? [`${this.startLocation} شارع التحرير`, `${this.startLocation} ميدان التحرير`, `${this.startLocation} الحي السابع`]
        : [];
    } else {
      this.hasUserInputDestination = this.destination.length > 0;
      this.destinationAddressSuggestions = this.hasUserInputDestination
        ? [`${this.destination} شارع فيصل`, `${this.destination} ميدان الجيزة`, `${this.destination} مول العرب`]
        : [];
    }
  }

  useCurrentLocation(): void {
    const { lat, lng } = this.userMarker.getLatLng(); // استخراج الإحداثيات بشكل صحيح
      navigator.geolocation.getCurrentPosition((position) => {

        this.pickupLatitude = lat;
        this.pickupLongitude = lng;

        const apiKey = "pk.6039c4e6dd18b636bd0c695199dae151";  // استبدل بمفتاحك
        const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`;
      
        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              console.log('hi');
              const address = data.display_name;
              console.log("Start Location:", address);
              this.startLocation = address;
            } else {
              console.error("No address found");
            }
          })
          .catch(error => console.error("Error fetching address:", error));
      
        
        if(this.selectedMarker2)
        { 
          this.selectedMarker2.remove();
          this.selectedMarker2 = null;
        }
        this.updatePickupLocation();
        this.getCurrentLocation();
        this.drawRoute1(this.userMarker.getLatLng(), this.selectedMarker!.getLatLng());
        this.showStartSuggestions = false;
      });
    
  }

  private getCurrentLocation(): void {
    this.startLocation = '';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
  
          if (this.map) {
            this.map.setView(userLocation, 15);
  
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker);
            }
  
            this.userMarker = L.marker(userLocation, {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
              })
            })
              .addTo(this.map)
              .bindPopup('<b>📍 موقعك الحالي</b>')
              .openPopup();

              const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k';
            const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${position.coords.latitude},${position.coords.longitude}&apiKey=${apiKey}`;
  
            fetch(url)
              .then(response => response.json())
              .then(data => {
                if (data.items && data.items.length > 0) {
                  this.address = data.items[0].address.label; // الحصول على العنوان من HERE API
                } else {
                  this.address = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
                }
              });
  
            // 🔹 تحديث موقع الالتقاء عند سحب المؤشر
            this.userMarker.on('dragend', (event: any) => {
              const newCoords = event.target.getLatLng();
              this.startLocation = this.address;
              this.drawRoute1(this.userMarker.getLatLng(), this.selectedMarker!.getLatLng());
            });
          }
        },
        (error) => {
          console.error('❌ Error getting location', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('❌ Geolocation is not supported by this browser.');
    }
  }
  



  selectFromMap(type: 'start' | 'destination'): void {
    this.selectedType = type;

    const customIcon1 = L.icon({
      iconUrl: '../../../assets/images/marker.png', // ضع مسار الصورة هنا
      iconSize: [40, 40], // حجم الأيقونة
      iconAnchor: [30, 40], // نقطة ارتكاز الأيقونة
      popupAnchor: [0, -40] // موقع الـ Popup بالنسبة للأيقونة
    });
    if(!this.selectedMarker2 && this.selectedType == 'start')
    {
      this.selectedMarker2 = L.marker(this.map.getCenter() , {
        draggable:true,
        icon : customIcon1
      }).addTo(this.map);

      this.map.removeLayer(this.userMarker);

      this.selectedMarker2.on('dragend',(event:L.DragEndEvent) => 
      {
        this.selectedType = 'start';
        this.updateInputWithMarker(this.selectedMarker2!.getLatLng())
      })
      this.drawRoute2(this.selectedMarker2.getLatLng(), this.selectedMarker!.getLatLng())
    }

    const customIcon2 = L.icon({
      iconUrl: '../../../assets/images/mark.png', // ضع مسار الصورة هنا
      iconSize: [40, 40], // حجم الأيقونة
      iconAnchor: [20, 40], // نقطة ارتكاز الأيقونة
      popupAnchor: [0, -40] // موقع الـ Popup بالنسبة للأيقونة
    });

    if  (!this.selectedMarker && type=='destination') {
      this.selectedMarker = L.marker(this.map.getCenter(), {
        draggable: true,
        icon: customIcon2 // تعيين الأيقونة الجديدة هنا
      }).addTo(this.map);

      // تحديث العنوان عند سحب المؤشر
      this.selectedMarker.on('dragend', (event: L.DragEndEvent) => {
        this.selectedType = 'destination';
        this.updateInputWithMarker(this.selectedMarker!.getLatLng());
      });
    }
    this.map.setView(this.selectedMarker!.getLatLng(), 15);
  }

  drawRoute1(start: L.LatLngExpression, end: L.LatLngExpression) {
    if (!this.userMarker || !this.selectedMarker) return;

    if (this.routingControl) {
      this.map.removeControl(this.routingControl); // إزالة المسار القديم إن وجد
    }

    
    this.routingControl = (L as any).Routing.control({
      waypoints: [
        this.userMarker.getLatLng(),
        this.selectedMarker.getLatLng()
      ],
      routeWhileDragging: true,
      createMarker: function () { return null; }
    }).addTo(this.map);
  }

  drawRoute2(start: L.LatLngExpression, end: L.LatLngExpression) {
    if (!this.selectedMarker2 || !this.selectedMarker) return;

    if (this.routingControl) {
      this.map.removeControl(this.routingControl); // إزالة المسار القديم إن وجد
    }

    
    this.routingControl = (L as any).Routing.control({
      waypoints: [
        this.selectedMarker2.getLatLng(),
        this.selectedMarker.getLatLng()
      ],
      routeWhileDragging: true,
      createMarker: function () { return null; }
    }).addTo(this.map);
  }

  async updateInputWithMarker(latlng: L.LatLng): Promise<void> {
    const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k';
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latlng.lat},${latlng.lng}&lang=ar&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // استخراج العنوان من بيانات HERE API
        const address = data.items?.[0]?.address?.label || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;

        if (this.selectedType === 'start') {
            this.startLocation = address;
            this.pickupLatitude = latlng.lat;
            this.pickupLongitude = latlng.lng; 
            this.showStartSuggestions = false;
        } else if (this.selectedType === 'destination') {
            this.destination = address;
            this.destinationLatitude = latlng.lat;
            this.destinationLongitude = latlng.lng;
            this.showDestinationSuggestions = false;
        }

        // رسم المسار بين النقاط
        if (this.selectedMarker && this.userMarker) {
            if (this.selectedMarker2) {
                this.drawRoute2(this.selectedMarker2.getLatLng(), this.selectedMarker.getLatLng());
            } else {
                this.drawRoute1(this.userMarker.getLatLng(), this.selectedMarker.getLatLng());
            }
        }
    } catch (error) {
        console.error('Error fetching address from HERE API:', error);
    }
}


  openSavedPlacesModal(type: 'start' | 'destination'): void {
    console.log(`فتح نافذة الأماكن المحفوظة لـ ${type}`);
    if (type === 'start') {
      this.showStartSuggestions = false;
    } else {
      this.showDestinationSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string, type: 'start' | 'destination'): void {
    if (type === 'start') {
      this.startLocation = suggestion;
      this.showStartSuggestions = false;
    } else {
      this.destination = suggestion;
      this.showDestinationSuggestions = false;
    }
  }

  ngOnInit(): void {
    this.initMap();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // التأكد أن الرقم مكون من خانتين
    const day = String(today.getDate()).padStart(2, '0'); // التأكد أن الرقم مكون من خانتين
    this.minDate = `${year}-${month}-${day}`;

     // راقب تغيير passengerType
     this.rideForm.get('passengerType')?.valueChanges.subscribe(value => {
      if (value === 'someoneElse') {
        this.isForSomeoneElse = true;
        this.rideForm.get('firstName')?.setValidators(Validators.required);
        this.rideForm.get('lastName')?.setValidators(Validators.required);
        this.rideForm.get('phone')?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]{10}$') // التحقق من أن الرقم مكون من 10 أرقام
        ]);
      } else {
        this.isForSomeoneElse = false;
        this.rideForm.get('firstName')?.clearValidators();
        this.rideForm.get('lastName')?.clearValidators();
        this.rideForm.get('phone')?.clearValidators();
      }

      // تحديث القيم بعد تغيير الفاليديشن
      this.rideForm.get('firstName')?.updateValueAndValidity();
      this.rideForm.get('lastName')?.updateValueAndValidity();
      this.rideForm.get('phone')?.updateValueAndValidity();
    });

   

    
  }

  getSuggestions(type: string): void {
    const inputElement = document.getElementById(type) as HTMLInputElement;
    const query = inputElement.value.trim();

    navigator.geolocation.getCurrentPosition((position) => {
       this.lat = position.coords.latitude;
       this.lng = position.coords.longitude;
    });
  
    if (query.length < 3) return; // يبدأ البحث بعد إدخال 3 أحرف
  
    const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k'; // استبدلها بمفتاح الـ API الخاص بك
    const apiUrl = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${query}&apiKey=${apiKey}&countryCode=EGY&at=${this.lat},${this.lng}&limit=5`;
  
    this.http.get<{ items: { title: string }[] }>(apiUrl).subscribe(
      (response) => {
        const suggestions = response.items?.map((item) => item.title) || [];
        this.updateDatalist(type, suggestions);
      },
      (error) => {
        console.error('Error fetching suggestions:', error);
      }
    );
  }  
  updateDatalist(type: string, suggestions: string[]): void {
    const datalist = document.getElementById(`${type}-suggestions`) as HTMLDataListElement;
    datalist.innerHTML = ''; // مسح الاقتراحات السابقة
    suggestions.forEach(suggestion => {
      const option = document.createElement('option');
      option.value = suggestion;
      datalist.appendChild(option);
    });
  }
  ngAfterViewInit(): void {
    this.initMap();
    this.getCurrentLocation();
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove(); // إزالة أي خريطة سابقة
    }
    this.map = L.map('map').setView(this.defaultLocation, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // حدث عند الضغط على الخريطة
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      if (this.selectedMarker) {
        this.selectedMarker.setLatLng(event.latlng);
        this.updateInputWithMarker(event.latlng);
      }
    });


    setTimeout(() => {
      this.map.invalidateSize(); // إعادة ضبط حجم الخريطة إذا لم تظهر كاملة
    }, 500);
  }

  updatePickupLocation() {
    const address = this.pickupInput.nativeElement.value;
    if(!this.selectedMarker2)
    {
      this.getCoordinatesFromAddress(address).then((coords) => {
        if (coords) {
          this.pickupLocation = coords;
          this.userMarker.setLatLng(coords);
          this.map.setView(coords, 14);
          this.drawRoute1(this.userMarker.getLatLng(),this.selectedMarker!.getLatLng());
          this.calculateRoute();
        }
      });
    }
    else if (this.selectedMarker2)
    {
      this.getCoordinatesFromAddress(address).then((coords) => {
        if (coords) {
          this.pickupLocation = coords;
          this.selectedMarker2!.setLatLng(coords);
          this.map.setView(coords, 14);
          this.drawRoute2(this.selectedMarker2!.getLatLng(),this.selectedMarker!.getLatLng());
          this.calculateRoute();
        }
      });
    }
    
  }

  getCoordinatesFromAddress(address: string): Promise<L.LatLng | null> {
    return new Promise((resolve) => {
      const apiKey = 'F-eM4RxG1ML45_pmm6oYLneiSTFX9e-ELW8MYCpqz6k';
      fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          if (data.items && data.items.length > 0) {
            const lat = data.items[0].position.lat;
            const lon = data.items[0].position.lng;
            resolve(new L.LatLng(lat, lon));
          } else {
            resolve(null);
          }
        })
        .catch(() => resolve(null));
    });
  }


  updateDestinationLocation() {
    this.selectFromMap('destination');
    const address = this.destinationInput.nativeElement.value;
    if(address == '')
    {
      this.map.removeLayer(this.selectedMarker!);  
      this.selectedMarker = null;
      if (this.routingControl) {
        this.map.removeControl(this.routingControl); // إزالة المسار القديم إن وجد
      }
    }
    this.getCoordinatesFromAddress(address).then((coords) => {
      if (coords) {
        this.destinationLocation = coords;
        this.selectedMarker!.setLatLng(coords);
      
        this.map.setView(coords, 14);
        this.drawRoute1(this.userMarker.getLatLng(),this.selectedMarker!.getLatLng());
        this.calculateRoute();
      }
    });
  }

  calculateRoute() {
    if (!this.userMarker || !this.selectedMarker) return;

    const distance = this.pickupLocation.distanceTo(this.destinationLocation) / 1000; // تحويل إلى كيلومترات
    this.estimatedDistance = parseFloat(distance.toFixed(2));

    const averageSpeed = 40; // متوسط سرعة السيارة بالكيلومتر في الساعة
    this.estimatedTime = parseFloat((this.estimatedDistance / averageSpeed * 60).toFixed(0)); // الزمن بالدقائق

    const baseFare = 10; // سعر بدء الرحلة
    const costPerKm = 3; // تكلفة لكل كيلومتر
    this.estimatedCost = parseFloat((baseFare + (this.estimatedDistance * costPerKm)).toFixed(2));
  }


  

  isDialogOpen = false;
  selectedDateTime = ''; // لحفظ التاريخ والوقت المختارين
  selectedDate: string = '';
  selectedTime: string = '';
  availableHours: string[] = []; // لحفظ الساعات المتاحة

  openDialog() {
    this.isDialogOpen = true;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableHours = this.generateHours();
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  confirmDateTime() {
    if (this.selectedDate && this.selectedTime) {
      const dateObj = new Date(this.selectedDate);
      const monthName = dateObj.toLocaleString('ar', { month: 'long' }); // استخراج اسم الشهر
      const day = dateObj.getDate();
      
      this.selectedDateTime = `${monthName} ${day}, ${this.selectedTime}`;
      this.closeDialog();
    }
  }

  filterHours() {
    if (this.selectedDate === this.getTodayDate()) {
      // لو التاريخ اليوم، فلتر الساعات المتاحة
      this.availableHours = this.generateHours(true);
    } else {
      this.availableHours = this.generateHours();
    }
  }

  generateHours(filterToday: boolean = false): string[] {
    const now = new Date();
    const currentHour = now.getHours();
    let hours: string[] = [];
  
    for (let i = 0; i < 24; i++) {
      // تحويل الساعة إلى نظام 12 ساعة
      let hour12 = i % 12 || 12; // تحويل 00:00 و 12:00 إلى 12
      let period = i < 12 ? 'AM' : 'PM';
      let formattedHour = `${hour12}:00 ${period}`;
  
      if (!filterToday || i > currentHour) {
        hours.push(formattedHour);
      }
    }
    return hours;
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  passengerType: string = 'me'; // القيمة الافتراضية "لي"
  isForSomeoneElse = false;

  

  onPassengerTypeChange() {
    console.log('Passenger type changed:', this.rideForm.get('passengerType')?.value);
    this.isForSomeoneElse = this.rideForm.get('passengerType')?.value === 'someoneElse';
  }

  deletemarker(event:any)
  {
    var value = event.target.value;

    if(value === '')
    {
      this.selectedMarker2?.remove();
      this.selectedMarker2 = null;
    }
  }


  /*------------------------------------------------------------------------------------*/

   
      
}

  
 
