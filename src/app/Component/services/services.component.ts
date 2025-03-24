import { Component, AfterViewInit } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements AfterViewInit{
  ngAfterViewInit(): void {
    // Initialize Lenis
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Parallax effect on header image
    gsap.to('.intro .bg-img', {
      y: '80%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro',
        start: 'top 1px',
        end: 'bottom 100px',
        scrub: true,
      },
    });

    // Darken and blur the header image
    gsap.to('.intro .bg-img', {
      filter: 'brightness(0.25) blur(16px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro',
        start: 'center top',
        scrub: true,
      },
    });

    // Animate the header title
    gsap.to('.intro .title', {
      y: '45vh',
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro',
        start: '25% top',
        scrub: true,
      }
    });

    const progressTL = gsap.to('.progress-thumb', { scaleX: 1, ease: 'none', paused: true });

    const slides = gsap.utils.toArray<HTMLElement>('.slide');

    const slidesTL = gsap.timeline();

    function slideTL(slide: HTMLElement, isFirst = false) {
      const tl = gsap.timeline();
      if (!isFirst) {
        tl.from(slide, {
          xPercent: 100,
        });
        tl.from(slide.querySelector('h2'), {
          duration: 0.25,
          opacity: 0,
          x: 100,
        }, 0.2);
      }

      tl.fromTo(slide.querySelector('.bg-img'), {
        xPercent: isFirst ? 0 : 8,
      }, {
        xPercent: -8,
      }, 0);

      return tl;
    }

    slides.forEach((slide, i) => {
      if (i === 0) {
        slidesTL.add(slideTL(slide, true));
      } else {
        slidesTL.add(slideTL(slide), '-=0.1');
      }
    });

    ScrollTrigger.create({
      animation: slidesTL,
      trigger: ".slide-container",
      start: "top top",
      end: `+=${slides.length * 100}%`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        progressTL.progress(self.progress);
      },
    });

    gsap.from('footer h2', {
      opacity: 0,
      y: 100,
      duration: 0.6,
      scrollTrigger: {
        trigger: 'footer',
        toggleActions: 'play none none reset',
        start: 'center bottom',
      },
    });
  }
}