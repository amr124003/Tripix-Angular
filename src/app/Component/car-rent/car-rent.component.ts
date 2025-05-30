import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-car-rent',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,RouterLinkActive],
  templateUrl: './car-rent.component.html',
  styleUrl: './car-rent.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class CarRentComponent implements AfterViewInit  {


  isFormVisible = false;
   isSubmitted = false;
   bookingForm: FormGroup;
   vedioUrl = ''

   constructor(private fb: FormBuilder,@Inject(DOCUMENT) private document: Document) {
    this.vedioUrl = '../../../assets/images/Car rental.mp4';
       this.bookingForm = this.fb.group({
         name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20),Validators.pattern(/^[A-Za-z\s]+$/)]],
         phone: ['', [Validators.required, Validators.pattern(/^01\d{8,13}$/)]],
         date: ['', [Validators.required]]
       });
     }
  
  
     onSubmit() {
      if (this.bookingForm.valid) {
        console.log('Form Submitted:', this.bookingForm.value);
        this.isSubmitted = true;
        setTimeout(() => {
          this.isSubmitted = false;
          this.bookingForm.reset();
          this.isFormVisible = false;
        }, 1500); // 3 ثواني إضافية
      }
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

  submitForm() {
    
    this.isSubmitted = true; // ✅ تفعيل الرسالة
    
    setTimeout(() => {
      this.isFormVisible = false; // ❌ إخفاء الفورم بعد 1.5 ثانية
    }, 1500);
    
  }

  cards = [
    { title: 'Design Smarter, Not Harder', text: 'Unlock powerful tools to create pixel-perfect designs in record time.', image: 'assets/images/avinz5yjj.png' },
    { title: 'Efficient Workflow', text: 'Streamline your work with automated processes.', image: 'assets/images/avinz5yjj.png' },
    { title: 'Creative Freedom', text: 'Customize every detail to match your vision.', image: 'assets/images/avinz5yjj.png' },
    { title: 'Scalability', text: 'Adapt to any project size seamlessly.', image: 'assets/images/avinz5yjj.png' },
    { title: 'Innovation', text: 'Stay ahead with cutting-edge features.', image: 'assets/images/avinz5yjj.png' },
    { title: 'User Experience', text: 'Enhance usability with intuitive design.', image: 'assets/images/avinz5yjj.png' },
    { title: 'User Experience', text: 'Enhance usability with intuitive design.', image: 'assets/images/avinz5yjj.png' },
  ];

  words: string[] = ['Safe', 'New', 'Performance', 'Effectiveness', 'Fun', 'Value for money'];
  NORMAL_PLAYBACK_RATE = 200;
  REDUCED_PLAYBACK_RATE = 1000;
  rate = this.NORMAL_PLAYBACK_RATE;
  scrollDirection: string = 'up';

  ngAfterViewInit() {
    this.initMenu();
    this.initScrollAnimation();
    this.textReplace();
  }

  // Menu Toggle Logic
  openMenu() {
    const menu = document.querySelector('#menu') as HTMLElement;
    const closeMenuBtn = document.querySelector('#closeMenuBtn') as HTMLElement;

    menu.classList.add('open');
    closeMenuBtn.focus();
    window.addEventListener('keyup', this.handleCloseWithESC);
  }

  closeMenu() {
    const menu = document.querySelector('#menu') as HTMLElement;
    const openMenuBtn = document.querySelector('#openMenuBtn') as HTMLElement;

    menu.classList.remove('open');
    openMenuBtn.focus();
    window.removeEventListener('keyup', this.handleCloseWithESC);
  }

  handleCloseWithESC(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.closeMenu();
    }
  }

  // Scroll Animation Logic
  initScrollAnimation() {
    let lastScrollTop = 0;
    window.addEventListener(
      'scroll',
      (e: Event) => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        const direction = st > lastScrollTop ? 'down' : 'up';
        if (Math.abs(st - lastScrollTop) > 5) {
          document.body.setAttribute('scroll-direction', direction);
        }
        this.scrollDirection = direction;
        lastScrollTop = st <= 0 ? 0 : st;
      },
      { passive: true }
    );
  }

  addRevealEffect(elements: NodeListOf<Element>) {
    const observer = new IntersectionObserver((entries) => {
      let revealClass: string;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealClass = this.scrollDirection === 'up' ? 'reveal-up' : 'reveal-down';
          entry.target.classList.add(revealClass);
        } else {
          entry.target.className = 'subject';
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  // Text Replacement Logic
  textReplace() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      this.rate = this.REDUCED_PLAYBACK_RATE;
    }

    const targetElement = document.getElementById('target-word');
    let wordIndex = 0;

    const changeWordWithAnimation = () => {
      if (targetElement) {
        targetElement.style.opacity = '0'; // Fade out
        setTimeout(() => {
          wordIndex = (wordIndex + 1) % this.words.length;
          targetElement.textContent = this.words[wordIndex];
          targetElement.style.opacity = '1'; // Fade in
        }, 10);
      }
    };

    setInterval(changeWordWithAnimation, this.rate);
  }

  // Initialize Menu Functionality
  initMenu() {
    const openMenuBtn = document.querySelector('#openMenuBtn') as HTMLElement;
    const closeMenuBtn = document.querySelector('#closeMenuBtn') as HTMLElement;

    openMenuBtn.addEventListener('click', () => this.openMenu());
    closeMenuBtn.addEventListener('click', () => this.closeMenu());
  }
}