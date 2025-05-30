import { Directive, ElementRef, HostListener, Renderer2, AfterViewInit, Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CardTiltDirective } from '../../Directives/card-title.directive';
import { RippleButtonDirective } from '../../Directives/ripple-button.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-washlets',
  imports: [CardTiltDirective, RippleButtonDirective, CommonModule, FormsModule],
  templateUrl: './washlets.component.html',
  styleUrls: ['./washlets.component.css']
})
export class WashletsComponent implements AfterViewInit {
  private isTouchDevice: boolean;
  private rotationFactor: number = 2;
  private content: HTMLElement | null = null;
  @ViewChildren('card') cards!: QueryList<ElementRef>; // استخدمنا ViewChildren علشان نقدر نجيب جميع الكروت
  cardsData = [
    { 
      id: 1, 
      title: 'Card 1', 
      description: 'Lorem ipsum dolor sit amet.', 
      image: '../../../assets/images/v1016-b-09.jpg',
      category: 'Category 1',
      price: 199.99
    },
    { 
      id: 2, 
      title: 'Card 2', 
      description: 'Consectetur adipiscing elit.', 
      image: '../../../assets/images/v1016-b-09.jpg',
      category: 'Category 2',
      price: 299.99
    },
    { 
      id: 3, 
      title: 'Card 3', 
      description: 'Sed do eiusmod tempor incididunt.', 
      image: '../../../assets/images/v1016-b-09.jpg',
      category: 'Category 3',
      price: 399.99
    }
  ];
  

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  handleMouseMove(event: MouseEvent) {
    this.cards.toArray().forEach((card: ElementRef) => {
      const rect = card.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.nativeElement.style.setProperty('--x', `${x}px`);
      card.nativeElement.style.setProperty('--y', `${y}px`);
    });
  }

  resetMousePosition() {
    this.cards.toArray().forEach((card: ElementRef) => {
      card.nativeElement.style.setProperty('--x', `0px`);
      card.nativeElement.style.setProperty('--y', `0px`);
    });
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
    this.cards.toArray().forEach((card: ElementRef) => {
      const rect = card.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (this.rotationFactor * (x - centerX)) / centerX;
      const rotateX = (-this.rotationFactor * (y - centerY)) / centerY;

      this.renderer.setStyle(card.nativeElement, 'transform', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    });
  }

  private onMouseLeave(): void {
    this.cards.toArray().forEach((card: ElementRef) => {
      this.renderer.setStyle(card.nativeElement, 'transform', 'rotateX(0) rotateY(0)');
      this.renderer.setStyle(card.nativeElement, 'transition', 'transform 0.5s ease');
      setTimeout(() => {
        this.renderer.removeStyle(card.nativeElement, 'transition');
      }, 500);
    });
  }

  private addFloatingAnimation(): void {
    const randomDelay = Math.random() * 2;
    this.renderer.setStyle(this.el.nativeElement, 'animation', `cardFloat 4s infinite alternate ease-in-out ${randomDelay}s`);
  }
}
