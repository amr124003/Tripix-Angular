import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';

@Component({
  selector: 'app-event',
  imports: [],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css' ,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  
})
export class EventComponent {
  isNavbarActive: boolean = false;
  isOverlayActive: boolean = false;
  isHeaderSticky: boolean = false;
  isGoTopVisible: boolean = false;

  toggleNavbar() {
    this.isNavbarActive = !this.isNavbarActive;
    this.isOverlayActive = !this.isOverlayActive;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isHeaderSticky = window.scrollY >= 10;
    this.isGoTopVisible = window.scrollY >= 800;
  }
}
