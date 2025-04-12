import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  state 
} from '@angular/animations';
import { CommonModule, CurrencyPipe } from '@angular/common';
import * as L from 'leaflet';


@Component({
  selector: 'app-vehicle',
  imports: [CommonModule,FormsModule,CurrencyPipe,ReactiveFormsModule],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css',
  schemas : [CUSTOM_ELEMENTS_SCHEMA],
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
    ])
  ]
})
export class VehicleComponent implements OnInit , AfterViewInit{
  currentImageIndex: number = 0;
  showModal: boolean = false;
  selectedColor: string = '#ff0000';
  colors: string[] = ['#ff0000', '#00ff00', '#0000ff'];
  bookingForm1: FormGroup;
  isSubmitted = false;
  navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' }
  ];
  map: any;
  routeLayer: any;
  destination: [number, number] = [30.128360, 31.135258]; // إحداثيات الوجهة (القاهرة كمثال)

  constructor(private fb: FormBuilder)
  {
    this.bookingForm1 = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
      date: ['', [Validators.required]]
    });
  }
  ngAfterViewInit(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.initMap();
          observer.disconnect(); // ميعملش init غير مرة واحدة
        }
      });
    }, {
      threshold: 0.5,
    });

    observer.observe(mapElement);
  }

  initMap(): void {
    if (!navigator.geolocation) {
                alert("الموقع غير مدعوم في المتصفح!");
                return;
            }
            
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
                const destination: [number, number] = [30.045, 31.236]; // استبدلها بموقع الوجهة الفعلي
            
                // إنشاء الخريطة
                this.map = L.map('map').setView(userLocation as [number, number], 13);
            
                // إضافة طبقة OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(this.map);
            
                // تعريف أيقونة مخصصة للموقع الحالي
                const userIcon = L.icon({
                    iconUrl: '../../../assets/images/marker.png', // ضع المسار الصحيح للصورة
                    iconSize: [40, 40], // الحجم
                    iconAnchor: [20, 40], // مركز الأيقونة
                    popupAnchor: [0, -40] // الموقع الذي يظهر فيه البوب أب
                });
            
                // إضافة ماركر للموقع الحالي باستخدام الأيقونة المخصصة
                L.marker(userLocation as [number, number], { icon: userIcon }).addTo(this.map)
                    .bindPopup("موقعك الحالي")
                    .openPopup();
            
                // تعريف أيقونة مخصصة للوجهة
                const destinationIcon = L.icon({
                    iconUrl: '../../../assets/images/mark.png', // ضع المسار الصحيح للصورة
                    iconSize: [40, 40], // الحجم
                    iconAnchor: [20, 40], // مركز الأيقونة
                    popupAnchor: [0, -40] // الموقع الذي يظهر فيه البوب أب
                });
            
                // إضافة ماركر للوجهة باستخدام الأيقونة المخصصة
                L.marker(destination as [number, number], { icon: destinationIcon }).addTo(this.map)
                    .bindPopup("الوجهة")
                    .openPopup();
            
                // رسم الاتجاهات بين الموقع الحالي والوجهة
                this.getRoute(userLocation, destination);
            });
  }

  getRoute(start: [number, number], end: [number, number]) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (this.routeLayer) {
                this.map.removeLayer(this.routeLayer);
            }

            // الحصول على المسار
            const routeGeoJson = data.routes[0].geometry;
            const routeCoordinates = routeGeoJson.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            
            // إنشاء الـ polyline
            const polyline = L.polyline(routeCoordinates, {
                color: 'blue',
                weight: 4,
                opacity: 0.7
            });

            // إضافة الـ polyline إلى الخريطة
            this.routeLayer = polyline;
            polyline.addTo(this.map);

            // إضافة Animation للـ Route
            let currentIndex = 0;
            const totalPoints = routeCoordinates.length;

            // تحديث الخط تدريجيا
            const animateRoute = () => {
                if (currentIndex < totalPoints) {
                    currentIndex++;
                    polyline.setLatLngs(routeCoordinates.slice(0, currentIndex));
                    this.map.panTo(routeCoordinates[currentIndex - 1]);  // تحريك الخريطة تلقائياً
                } else {
                    clearInterval(animationInterval);
                }
            };

            // التحكم في سرعة الحركة (على سبيل المثال، 100ms بين كل نقطة)
            const animationInterval = setInterval(animateRoute, 2);
        })
        .catch(error => console.error('Error fetching route:', error));
      }

  ngOnInit(): void {
    this.initNavbarHoverEffects();
  }

  private initNavbarHoverEffects(): void {
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.classList.add('active');
      });
      
      link.addEventListener('mouseleave', () => {
        link.classList.remove('active');
      });
    });
  }

  onSubmit1() {
    if (this.bookingForm1.valid) {
      console.log('Form Submitted:', this.bookingForm1.value);
      alert('Booking Successful!');
      this.bookingForm1.reset();
    }
  }

  // Carousel methods
  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % 2;
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + 2) % 2;
  }

  // Modal methods
  openModal(): void {
    this.showModal = true;
    console.log('Modal opened');
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }

  // Color selection
  selectColor(color: string): void {
    this.selectedColor = color;
  }

  // Form submission
  submitOrder(formData: any): void {
    if (formData.valid) {
      const order = {
        ...formData.value,
        color: this.selectedColor
      };
      console.log('Order submitted:', order);
      this.closeModal();
    }
  }
}