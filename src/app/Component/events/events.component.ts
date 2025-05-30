import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, HostListener, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-events',
  imports: [CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit, OnDestroy {

  isNavbarActive: boolean = false;
  isOverlayActive: boolean = false;
  isHeaderSticky: boolean = false;
  isGoTopVisible: boolean = false;

  

  toggleNavbar() {
    this.isNavbarActive = !this.isNavbarActive;
    this.isOverlayActive = !this.isOverlayActive;
  }

  GotoEvent()
  {
    this.router.navigateByUrl("/Event");
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isHeaderSticky = window.scrollY >= 10;
    this.isGoTopVisible = window.scrollY >= 800;
  }

  private bannerTimer: any;
  private readonly switchInterval = 5000; // Interval for slider auto-switch

  constructor(private renderer: Renderer2 , private router : Router) {}
  ngOnInit(): void {
    this.startBannerSwitcher();
    
  }

  ngOnDestroy(): void {
    this.clearBannerTimer();
  }

  startBannerSwitcher(): void {
    this.bannerTimer = setInterval(() => this.bannerSwitcher(), this.switchInterval);
  }

  clearBannerTimer(): void {
    if (this.bannerTimer) {
      clearInterval(this.bannerTimer);
    }
  }

  bannerSwitcher(): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.sec-1-input');
    const checkedInput = Array.from(inputs).find(input => input.checked);
    const nextInput = checkedInput?.nextElementSibling as HTMLInputElement | null;

    if (nextInput && nextInput.classList.contains('sec-1-input')) {
      nextInput.checked = true;
    } else {
      inputs[0].checked = true;
    }
  }

  onControlClick(): void {
    this.clearBannerTimer();
    this.startBannerSwitcher();
  }
}
