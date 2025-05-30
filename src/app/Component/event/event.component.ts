import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import {  FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-event',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink,RouterLinkActive],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css' ,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  
})
export class EventComponent {
  isNavbarActive: boolean = false;
  isOverlayActive: boolean = false;
  isHeaderSticky: boolean = false;
  isGoTopVisible: boolean = false;
  heroForm!: FormGroup;

  constructor(private fb: FormBuilder)
  {
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      phone: ['', [Validators.required, Validators.pattern('^01[0-2,5][0-9]{8}$')]]
    });
  }




  toggleNavbar() {
    this.isNavbarActive = !this.isNavbarActive;
    this.isOverlayActive = !this.isOverlayActive;
  }

  scrollToTop()
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    if (this.heroForm.valid) {
      console.log(this.heroForm.value);
      alert('Form submitted successfully!');
    } else {
      this.heroForm.markAllAsTouched(); // عشان يبين الأخطاء
    }
  }

  get name() {
    return this.heroForm.get('name');
  }

  get email() {
    return this.heroForm.get('email');
  }

  get phone() {
    return this.heroForm.get('phone');
  }
  

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isHeaderSticky = window.scrollY >= 10;
    this.isGoTopVisible = window.scrollY >= 400;
  }
}
