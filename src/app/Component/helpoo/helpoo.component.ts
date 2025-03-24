import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Parallax from 'parallax-js';

@Component({
  selector: 'app-helpoo',
  imports: [CommonModule,FormsModule],
  templateUrl: './helpoo.component.html',
  styleUrl: './helpoo.component.css',
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class HelpooComponent implements OnInit, AfterViewInit {
  private active = 0;
  private lastIndex: number = 0;
  isFormVisible = false;
  ismodalVisible = false;
   isSubmitted = false;
   location: string = '';
   

  // Menu data
  menu = [
    { title: 'Section One', subItems: ['Item 1', 'Item 2', 'Item 3'] },
    { title: 'Section Two', subItems: ['Item A', 'Item B', 'Item C'] },
    { title: 'Section Three', subItems: ['Item X', 'Item Y', 'Item Z'] }
  ];
 
  

  fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name' , value:''},
    { id: 'Phone', label: 'Phone', type: 'text', placeholder: 'Enter your Phone Number' , value:''}
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

  getAddressFromCoordinates(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    this.http.get<any>(url).subscribe(
      {
        next:(data) => 
        {
          if(data && data.display_name)
          {
            this.location += data.display_name;
          }
          else{
            this.location = "bbbbb"
          }
        },
        error:() => 
        {
          console.log('no');
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


  constructor(@Inject(DOCUMENT) private document: Document , private http : HttpClient) {}

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
      if (wS > hT + hH - 1.4 * wH) 
        {
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

