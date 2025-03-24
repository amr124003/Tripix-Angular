import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Swiper } from 'swiper';


@Component({
  selector: 'app-blogs',
  imports: [],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit, OnDestroy {
  private bg!: HTMLElement;
  private items!: NodeListOf<HTMLElement>;
  private item!: HTMLElement;
  private swiper!: Swiper;

  constructor(private renderer: Renderer2, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.bg = this.elRef.nativeElement.querySelector('.item-bg');
    this.items = this.elRef.nativeElement.querySelectorAll('.news__item');
    this.item = this.elRef.nativeElement.querySelector('.news__item');

    // Initialize Swiper slider
    this.swiper = new Swiper('.news-slider', {
      effect: 'coverflow',
      grabCursor: true,
      loop: true,
      centeredSlides: true,
      keyboard: true,
      spaceBetween: 0,
      slidesPerView: 'auto',
      speed: 300,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 0,
        modifier: 3,
        slideShadows: false
      },
      breakpoints: {
        480: {
          spaceBetween: 0,
          centeredSlides: true
        }
      },
      simulateTouch: true,
      navigation: {
        nextEl: '.news-slider-next',
        prevEl: '.news-slider-prev'
      },
      pagination: {
        el: '.news-slider__pagination',
        clickable: true
      },
      on: {
        init: () => {
          this.updateItemBackground();
        }
      }
    });

    // Mouseover and mouseleave handlers for items
    if (window.innerWidth > 800) {
      this.items.forEach(item => {
        this.renderer.listen(item, 'mouseover', (event) => {
          this.onItemMouseover(event, item);
        });

        this.renderer.listen(item, 'mouseleave', () => {
          this.onItemMouseleave();
        });
      });
    }
  }

  // Handle mouseover event for the items
  onItemMouseover(event: MouseEvent, item: HTMLElement): void {
    const rect = item.getBoundingClientRect();
    this.bg.classList.add('active');
    this.bg.style.width = `${rect.width}px`;
    this.bg.style.height = `${rect.height}px`;
    this.bg.style.transform = `translateX(${rect.left}px) translateY(${rect.top}px)`;
  }

  // Handle mouseleave event for the items
  onItemMouseleave(): void {
    this.bg.classList.remove('active');
    this.items.forEach(item => item.classList.remove('active'));
  }

  // Update background position and size when the swiper is initialized or slides change
  updateItemBackground(): void {
    const activeItem = document.querySelector('.swiper-slide-active');
    const sliderItem = activeItem!.querySelector('.news__item');
    sliderItem!.classList.add('active');

    const rect = sliderItem!.getBoundingClientRect();
    this.bg.classList.add('active');
    this.bg.style.width = `${rect.width}px`;
    this.bg.style.height = `${rect.height}px`;
    this.bg.style.transform = `translateX(${rect.left}px) translateY(${rect.top}px)`;
  }

  // Handle swiper slide change event
  onSlideChange(): void {
    this.items.forEach(item => item.classList.remove('active'));
  }

  // Handle swiper slide transition end event
  onSlideChangeTransitionEnd(): void {
    const activeItem = document.querySelector('.swiper-slide-active');
    const sliderItem = activeItem!.querySelector('.news__item');
    sliderItem!.classList.add('active');

    const rect = sliderItem!.getBoundingClientRect();
    this.bg.classList.add('active');
    this.bg.style.width = `${rect.width}px`;
    this.bg.style.height = `${rect.height}px`;
    this.bg.style.transform = `translateX(${rect.left}px) translateY(${rect.top}px)`;
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
}