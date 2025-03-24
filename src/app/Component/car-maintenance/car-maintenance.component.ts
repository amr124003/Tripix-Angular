import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Parallax from 'parallax-js';

@Component({
  selector: 'app-car-maintenance',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './car-maintenance.component.html',
  styleUrl: './car-maintenance.component.css',
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class CarMaintenanceComponent implements OnInit, AfterViewInit {
  private active = 0;
  private lastIndex: number = 0;
  isFormVisible = false;
  ismodalVisible = false;
   isSubmitted = false;
   location: string = '';
   bookingForm1: FormGroup;
   bookingForm2: FormGroup;
   Date  = new Date().getDate();

   constructor(private fb: FormBuilder,@Inject(DOCUMENT) private document: Document) {
       this.bookingForm1 = this.fb.group({
         name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20),Validators.pattern(/^[A-Za-z\s]+$/)]],
         phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
         date: ['', [Validators.required, Validators.min(new Date().getTime())]],
         carType: ['', Validators.required]
       });

       this.bookingForm2 = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20),Validators.pattern(/^[A-Za-z\s]+$/)]],
        phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
        date: ['', [Validators.required, Validators.min(new Date().getTime())]],
        carType: ['', Validators.required]
      });
     }
   

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


  

  ngOnInit(): void {
    this.initNavbarScroll();
    this.initGalleryFilter();
    this.initPopupGallery();
    this.initOwlCarousel();
  }

  ngAfterViewInit(): void {
    this.initParallaxEffect();
    this.initSkillBarAnimation();
  }

  onSubmit1() {
    if (this.bookingForm1.valid) {
      console.log('Form Submitted:', this.bookingForm1.value);
      alert('Booking Successful!');
      this.bookingForm1.reset();
    }
  }

  onSubmit2() {
    if (this.bookingForm2.valid) {
      console.log('Form Submitted:', this.bookingForm2.value);
      alert('Booking Successful!');
      this.bookingForm2.reset();
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

