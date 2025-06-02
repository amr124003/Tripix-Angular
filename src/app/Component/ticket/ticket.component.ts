import { Component, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements AfterViewInit {
  private ticketElement!: HTMLElement;
  private animatedElements!: NodeListOf<HTMLElement>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.ticketElement = document.querySelector('.ticket')!;
    this.animatedElements = document.querySelectorAll<HTMLElement>(
      '.rotating, .holo-active, .bg-moving, .divider-moving'
    );
  }

  pauseAnimations(): void {
    this.animatedElements.forEach((el) => {
      this.renderer.addClass(el, 'paused');
    });
    this.renderer.addClass(this.ticketElement, 'paused');
  }

  resumeAnimations(): void {
    this.animatedElements.forEach((el) => {
      this.renderer.removeClass(el, 'paused');
    });
    this.renderer.removeClass(this.ticketElement, 'paused');
  }

  toggleAnimations(): void {
    const isPaused = this.ticketElement.classList.contains('paused');

    if (isPaused) {
      this.resumeAnimations();
    } else {
      this.pauseAnimations();
    }
  }
}
