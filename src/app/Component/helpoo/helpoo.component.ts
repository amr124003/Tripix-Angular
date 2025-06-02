import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Parallax from 'parallax-js';
import * as L from 'leaflet';


@Component({
  selector: 'app-helpoo',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive , ReactiveFormsModule],
  templateUrl: './helpoo.component.html',
  styleUrl: './helpoo.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HelpooComponent implements OnInit, AfterViewInit {
  private active = 0;
  private lastIndex: number = 0;
  isFormVisible = false;
  ismodalVisible = false;
  isSubmitted = false;
  location: string = '';
  showMap = false;
  map!: L.Map | null;
  marker: L.Marker | undefined;
  selectedLatLng: L.LatLng | undefined;
  carForm!: FormGroup;



  // Menu data
  menu = [
    { title: 'Section One', subItems: ['Item 1', 'Item 2', 'Item 3'] },
    { title: 'Section Two', subItems: ['Item A', 'Item B', 'Item C'] },
    { title: 'Section Three', subItems: ['Item X', 'Item Y', 'Item Z'] }
  ];



  fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name', value: '' },
    { id: 'Phone', label: 'Phone', type: 'text', placeholder: 'Enter your Phone Number', value: '' }
  ];

  showForm() {
    this.isFormVisible = true;
    this.isSubmitted = false;

  }

  getLocation() {
    if (navigator.geolocation) {
      console.log('get location');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.location = `${lat}, ${lon}`;
          this.getAddressFromCoordinates(lat, lon); // استدعاء API لتحويل الإحداثيات لعنوان
        },
        (error) => {
          this.location = 'فشل في جلب الموقع!';
          console.error('خطأ في جلب الموقع:', error);
        }
      );
    } else {
      this.location = 'المتصفح لا يدعم تحديد الموقع.';
    }
  }

  openMap() {
    this.showMap = true;

    setTimeout(() => {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      if (this.selectedLatLng) {
        this.initMap(this.selectedLatLng.lat, this.selectedLatLng.lng);
        // هنا نجيب العنوان الحالي قبل فتح الماب
        this.getAddressFromCoordinates(this.selectedLatLng.lat, this.selectedLatLng.lng);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.selectedLatLng = L.latLng(latitude, longitude);
            this.initMap(latitude, longitude);
            this.getAddressFromCoordinates(latitude, longitude);
          },
          (error) => {
            console.warn('Location error:', error.message);
            const fallbackLatLng = L.latLng(30.033333, 31.233334);
            this.selectedLatLng = fallbackLatLng;
            this.initMap(fallbackLatLng.lat, fallbackLatLng.lng);
            this.getAddressFromCoordinates(fallbackLatLng.lat, fallbackLatLng.lng);
          }
        );
      }
    }, 0);
  }


  initMap(lat: number, lng: number) {
    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      this.selectedLatLng = this.marker!.getLatLng();
      this.getAddressFromCoordinates(this.selectedLatLng.lat, this.selectedLatLng.lng);
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }



  closeMap() {
    this.showMap = false;
  }

  confirmLocation() {
    if (this.selectedLatLng) {
      this.location = `${this.selectedLatLng.lat.toFixed(6)}, ${this.selectedLatLng.lng.toFixed(6)}`;
    }
    this.closeMap();
  }

  getAddressFromCoordinates(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    this.http.get<any>(url).subscribe(
      {
        next: (data) => {
          if (data ) {
            console.log(data.display_name);
            this.location = data.display_name; // هنا نحدث العنوان فقط
          } else {
            this.location = "تعذر الحصول على العنوان";
          }
        },
        error: () => {
          this.location = "حدث خطأ أثناء جلب العنوان";
        }
      }
    );
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


  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient , private fb: FormBuilder) {
     this.carForm = this.fb.group({
      name: ['', Validators.required],
      location: [{ value: this.location }],
      type: ['', Validators.required]
    });
   }

  ngOnInit(): void {
    this.initNavbarScroll();
    this.initGalleryFilter();
    this.initPopupGallery();
    this.initOwlCarousel();
    this.getLocation();
  }

  ngAfterViewInit(): void {
    this.initParallaxEffect();
    this.initSkillBarAnimation();
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

