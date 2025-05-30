import { Directive, ElementRef, HostListener, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appCardTilt]',
  standalone: true,
})
export class CardTiltDirective implements AfterViewInit {
  private isTouchDevice: boolean;
  private rotationFactor: number = 2;
  private content: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  ngAfterViewInit(): void {
    this.content = this.el.nativeElement.querySelector('.card-content');
    const factor = this.el.nativeElement.getAttribute('data-rotation-factor');
    if (factor) {
      this.rotationFactor = parseFloat(factor);
    }

    if (!this.isTouchDevice) {
      this.renderer.listen(this.el.nativeElement, 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
      this.renderer.listen(this.el.nativeElement, 'mouseleave', () => this.onMouseLeave());
    }

    this.addFloatingAnimation();
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.content) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = (this.rotationFactor * (x - centerX)) / centerX;
    const rotateX = (-this.rotationFactor * (y - centerY)) / centerY;

    this.renderer.setStyle(this.content, 'transform', `
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg)
    `);

    this.renderer.setStyle(this.el.nativeElement, '--x', `${(x / rect.width) * 100}%`);
    this.renderer.setStyle(this.el.nativeElement, '--y', `${(y / rect.height) * 100}%`);
  }

  private onMouseLeave(): void {
    if (!this.content) return;

    this.renderer.setStyle(this.content, 'transform', 'rotateX(0) rotateY(0)');
    this.renderer.setStyle(this.content, 'transition', 'transform 0.5s ease');
    setTimeout(() => {
      if (this.content) {
        this.renderer.removeStyle(this.content, 'transition');
      }
    }, 500);
  }

  private addFloatingAnimation(): void {
    const randomDelay = Math.random() * 2;
    this.renderer.setStyle(this.el.nativeElement, 'animation', `cardFloat 4s infinite alternate ease-in-out ${randomDelay}s`);
  }
}
