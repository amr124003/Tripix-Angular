import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRippleButton]',
  standalone: true,
})
export class RippleButtonDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation();

    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'ripple');
    this.renderer.appendChild(this.el.nativeElement, ripple);

    const rect = this.el.nativeElement.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${event.clientX - rect.left - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${event.clientY - rect.top - size / 2}px`);
    this.renderer.addClass(ripple, 'active');

    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, ripple);
    }, 500);
  }
}
