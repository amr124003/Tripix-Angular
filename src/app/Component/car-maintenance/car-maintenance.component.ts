import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Parallax from 'parallax-js';
import { CarWashService } from '../../Services/Auth/CarWash/car-wash.service';

@Component({
  selector: 'app-car-maintenance',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './car-maintenance.component.html',
  styleUrl: './car-maintenance.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class CarMaintenanceComponent implements OnInit, AfterViewInit {
  private active = 0;
  private lastIndex: number = 0;
  isFormVisible = false;
  ismodalVisible = false;
  isSubmitted = false;
  bookingForm1: FormGroup;
  bookingForm2: FormGroup;
  bookingForm3: FormGroup;
  Date = new Date().getHours();
  SelectedPricing: number = 1;
  PricingPlan: 'Basic' | 'Premium' | 'Ultimate' = 'Basic';
  Closed = this.Date >= 0 && this.Date < 10;
  currentStep: 'question' | 'form1' | 'form2' = 'question';
  turnForMe = false;


  constructor(private fb: FormBuilder, @Inject(DOCUMENT) private document: Document, private washRepo: CarWashService) {
    this.bookingForm1 = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
      date: ['', [Validators.required, this.noPastDateValidator]],
      carType: ['', Validators.required]
    });

    this.bookingForm3 = this.fb.group({
      date: ['', [Validators.required, this.noPastDateValidator]],
      carType: ['', Validators.required]
    });

    this.bookingForm2 = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
      date: ['', [Validators.required, this.noPastDateValidator]],
      carType: ['', Validators.required]
    });
  }

  onSubmit1() {
    if (this.bookingForm1.invalid) {
      this.bookingForm1.markAllAsTouched();
      return;
    }
    this.HandelPricingPlan();
    const Data = {
      "userName": this.bookingForm1.get('name')?.value,
      "userPhone": this.bookingForm1.get('phone')?.value,
      "turnDate": this.bookingForm1.get('date')?.value,
      "carType": this.bookingForm1.get('carType')?.value,
      "pricingPlan": this.PricingPlan
    }

    this.washRepo.BookTurn(Data).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

 

  onSubmit2() {
     if (this.bookingForm2.invalid) {
      this.bookingForm2.markAllAsTouched();
      return;
    }
    this.HandelPricingPlan();
    const Data = {
      "userName": this.bookingForm2.get('name')?.value,
      "userPhone": this.bookingForm2.get('phone')?.value,
      "turnDate": this.bookingForm2.get('date')?.value,
      "carType": this.bookingForm2.get('carType')?.value,
      "pricingPlan": this.PricingPlan
    }

    this.washRepo.BookTurn(Data).subscribe({
      next: (response) => {
        console.log(response);
        this.isSubmitted = true;
        setTimeout(() => {
          this.isSubmitted = false;
        }, 2);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onSubmit3() {
    if (this.bookingForm3.invalid) {
      this.bookingForm1.markAllAsTouched();
      return;
    }
    this.HandelPricingPlan();
    const Data = {
      "turnDate": this.bookingForm3.get('date')?.value,
      "carType": this.bookingForm3.get('carType')?.value,
      "pricingPlan": this.PricingPlan
    }

    this.washRepo.BookTurn(Data).subscribe({
      next: (response) => {
        console.log(response);
        this.isSubmitted = true;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

   noPastDateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // نخلي اليوم يبدأ من نص الليل علشان نعمل مقارنة سليمة

    return selectedDate < today ? { min: true } : null;
  }

  selectTurn(isForMe: boolean) {
    this.turnForMe = isForMe;
    if (isForMe) {
      this.currentStep = 'form1';
    } else {
      this.currentStep = 'form2';
    }
  }




  // Menu data
  menu = [
    { title: 'Section One', subItems: ['Item 1', 'Item 2', 'Item 3'] },
    { title: 'Section Two', subItems: ['Item A', 'Item B', 'Item C'] },
    { title: 'Section Three', subItems: ['Item X', 'Item Y', 'Item Z'] }
  ];



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
    this.currentStep = 'question';
    this.bookingForm1.reset();
  }

  showModal() {
    this.ismodalVisible = true;
  }
  closeModal() {
    this.ismodalVisible = false;
  }

  GotoWork() {
    const element = document.getElementById("work");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  HandelPricingPlan() {
    if (this.SelectedPricing == 1) { this.PricingPlan = 'Basic' }
    if (this.SelectedPricing == 2) { this.PricingPlan = 'Premium' }
    if (this.SelectedPricing == 3) { this.PricingPlan = 'Ultimate' }
  }

  SelectPricing(pricing: number) {
    this.SelectedPricing = pricing;
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

