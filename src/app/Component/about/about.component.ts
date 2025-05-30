import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Parallax from 'parallax-js';
import L from 'leaflet';
import emailjs from 'emailjs-com';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-about',
  imports: [CommonModule, FormsModule,],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AboutComponent implements OnInit, AfterViewInit {
  private active = 0;
  private lastIndex: number = 0;
  isFormVisible = false;
  ismodalVisible = false;
  isSubmitted = false;
  isMapOpen: boolean = false;
  destination: [number, number] = [30.128360, 31.135258]; // إحداثيات الوجهة (القاهرة كمثال)
  map: any;
  routeLayer: any;
  name = '';
  email = '';
  message = '';

  

  // Menu data
  menu = [
    { title: 'Section One', subItems: ['Item 1', 'Item 2', 'Item 3'] },
    { title: 'Section Two', subItems: ['Item A', 'Item B', 'Item C'] },
    { title: 'Section Three', subItems: ['Item X', 'Item Y', 'Item Z'] }
  ];

  sendMessage() {
    
    const payload  = {
      name : this.name,
      email : this.email,
      message : this.message
    }
    
    this.http.post('https://formspree.io/f/xwplyjwg', payload)
    .subscribe({
      next:() => 
        {
          console.log(payload);
          console.log("Okay");
        },
        error:() => 
        {
          console.log(payload);
          console.log("Error");
        }
      });
  }



  fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name' },
    { id: 'Phone', label: 'Phone', type: 'text', placeholder: 'Enter your Phone Number' },
    { id: 'date', label: 'Booking Date', type: 'date', placeholder: '' }

  ];

  showForm() {
    this.isFormVisible = true;
    this.isSubmitted = false;

  }


  closeForm() {
    this.isFormVisible = false;
  }

  showModal() {
    this.ismodalVisible = true;
  }
  closeModal() {
    this.ismodalVisible = false;
  }


  submitForm() {

    this.isSubmitted = true; // ✅ تفعيل الرسالة

    setTimeout(() => {
      this.isFormVisible = false; // ❌ إخفاء الفورم بعد 1.5 ثانية
    }, 1500);

  }


  constructor(@Inject(DOCUMENT) private document: Document , private http : HttpClient) { }

  ngOnInit(): void {
    this.initNavbarScroll();
    this.initGalleryFilter();
    this.initPopupGallery();
    this.initOwlCarousel();
    this.initMap();
  }

  ngAfterViewInit(): void {
    this.initParallaxEffect();
    this.initSkillBarAnimation();
  }

  openMapModal() {
    this.isMapOpen = true;
    this.initMap()
  }

  initMap() {
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

        const route = L.geoJSON(data.routes[0].geometry, {
          style: { color: 'blue', weight: 4 }
        });

        this.routeLayer = route;
        route.addTo(this.map);
      })
      .catch(error => console.error('Error fetching route:', error));
  }




  closeMapModal() {
    this.isMapOpen = false;
    if (this.map) {
      this.map.remove(); // إزالة الخريطة عند الإغلاق
    }
  }

  private navigate(ndx: number): void {
    if (ndx < 0 || ndx > this.lastIndex) return;
    const targetElement = this.document.querySelector(`[data-scroll-index="${ndx}"]`);
    if (targetElement) {
      const targetTop = (targetElement as HTMLElement).offsetTop - 50;
      $('html, body').animate({ scrollTop: targetTop }, 600);
    }
  }

  private initNavbarScroll(): void {
    window.addEventListener('scroll', () => {
      const navbar = this.document.querySelector('.navbar');
      if (window.scrollY > 90) {
        navbar?.classList.add('navbar-shrink');
      } else {
        navbar?.classList.remove('navbar-shrink');
      }
    });
  }

  private initParallaxEffect(): void {
    const scene = this.document.getElementById('parallax');
    if (scene) {
      new Parallax(scene);
    }
  }

  private initSkillBarAnimation(): void {
    window.addEventListener('scroll', () => {
      const skillBarWrapper = this.document.getElementById('skill-bar-wrapper');
      if (!skillBarWrapper) return;
      const hT = skillBarWrapper.offsetTop;
      const hH = skillBarWrapper.offsetHeight;
      const wH = window.innerHeight;
      const wS = window.scrollY;
      if (wS > hT + hH - 1.4 * wH) {
        $('.skillbar-container .skills').each((_: any, el: any) => {
          $(el).animate({ width: $(el).attr('data-percent') }, 5000);
        });
      }
    });
  }

  private initGalleryFilter(): void {
    const btns = this.document.querySelectorAll('.img-gallery .sortBtn .filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', (event: any) => {
        btns.forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        const selector = event.target.getAttribute('data-filter');
        $('.img-gallery .grid').isotope({ filter: selector });
      });
    });
  }

  private initPopupGallery(): void {
    ($ as any)('.image-popup').magnificPopup({
      type: 'image',
      gallery: { enabled: true }
    });
  }

  private initOwlCarousel(): void {
    ($ as any)('.testimonial-slider').owlCarousel({
      loop: true,
      margin: 0,
      autoplay: true,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 }
      }
    });
  }


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      this.navigate(this.active - 1);
    } else if (event.key === 'ArrowDown') {
      this.navigate(this.active + 1);
    }
  }
}

