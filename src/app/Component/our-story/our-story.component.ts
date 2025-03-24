import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-our-story',
  imports: [],
  templateUrl: './our-story.component.html',
  styleUrl: './our-story.component.css'
})
export class OurStoryComponent implements AfterViewInit {
  @ViewChild('navBar') navBar!: ElementRef;
  @ViewChild('navButton') navButton!: ElementRef;
  @ViewChild('footerForm') footerForm!: ElementRef;
  @ViewChild('emailForm') emailForm!: ElementRef;
  @ViewChild('video') video!: ElementRef;
  @ViewChild('progress') progress!: ElementRef;
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('togglePlayButton') togglePlayButton!: ElementRef;
  @ViewChild('counterElements', { static: false }) counterElements!: ElementRef;

  mousedown = false;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.navButton.nativeElement, 'click', () => this.toggleNavigation());
    this.renderer.listen(this.footerForm.nativeElement, 'submit', (e) => this.handleFormSubmit(e));
    this.renderer.listen(this.video.nativeElement, 'click', () => this.togglePlay());
    this.renderer.listen(this.video.nativeElement, 'play', () => this.changeButton());
    this.renderer.listen(this.video.nativeElement, 'pause', () => this.changeButton());
    this.renderer.listen(this.video.nativeElement, 'timeupdate', () => this.handleProgressBar());
    this.renderer.listen(this.togglePlayButton.nativeElement, 'click', () => this.togglePlay());
    this.renderer.listen(this.progress.nativeElement, 'click', (e) => this.handleProgressBarProgress(e));
    this.renderer.listen(this.progress.nativeElement, 'mousemove', (e) => this.mousedown && this.handleProgressBarProgress(e));
    this.renderer.listen(this.progress.nativeElement, 'mousedown', () => (this.mousedown = true));
    this.renderer.listen(this.progress.nativeElement, 'mouseup', () => (this.mousedown = false));
  }

  toggleNavigation(): void {
    const isOpen = this.navBar.nativeElement.classList.contains('is-open');
    this.navButton.nativeElement.setAttribute('aria-expanded', !isOpen);
    this.navBar.nativeElement.classList.toggle('is-open');
  }

  handleFormSubmit(event: Event): void {
    event.preventDefault();
    const email = this.emailForm.nativeElement.value.trim();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      this.footerForm.nativeElement.classList.add('form-error');
      this.createAlert('span', 'Email is not valid');
    }
  }

  createAlert(tag: string, message: string): void {
    if (this.footerForm.nativeElement.querySelector('span.form-error-message')) return;
    const alertElement = this.renderer.createElement(tag);
    this.renderer.setProperty(alertElement, 'textContent', message);
    this.renderer.addClass(alertElement, 'form-error-message');
    this.renderer.setAttribute(alertElement, 'role', 'alert');
    this.renderer.appendChild(this.footerForm.nativeElement, alertElement);
  }

  togglePlay(): void {
    const video = this.video.nativeElement;
    video.paused ? video.play() : video.pause();
  }

  changeButton(): void {
    this.togglePlayButton.nativeElement.textContent = this.video.nativeElement.paused ? '►' : '❚❚';
  }

  handleProgressBar(): void {
    const video = this.video.nativeElement;
    const percent = (video.currentTime / video.duration) * 100;
    this.renderer.setStyle(this.progressBar.nativeElement, 'flexBasis', `${percent}%`);
  }

  handleProgressBarProgress(event: MouseEvent): void {
    const video = this.video.nativeElement;
    const progress = this.progress.nativeElement;
    const progressTime = (event.offsetX / progress.offsetWidth) * video.duration;
    video.currentTime = progressTime;
  }
}
