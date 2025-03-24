import { Directive, ElementRef, Renderer2, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appGallerySliding]'
})
export class GallerySlidingDirective implements OnInit {
  private gallery: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.gallery = this.el.nativeElement;
  }

  ngOnInit(): void {
    if (window.innerWidth > 1224 && window.innerWidth < 2400) {
      this.checkScroll();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 1390) {
      this.renderer.addClass(this.gallery, 'gallery-translate');
    } else if (scrollTop < 1385) {
      this.renderer.removeClass(this.gallery, 'gallery-translate');
    }
  }
}
