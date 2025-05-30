import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-start-engine',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './start-engine.component.html',
  styleUrl: './start-engine.component.css'
})
export class StartEngineComponent implements AfterViewInit {
  rotation = 20;
  private engineSound: HTMLAudioElement;

  constructor(private router:Router)
  {
    this.engineSound = new Audio('assets/sounds/car-engine.mp3');
    this.engineSound.load(); // تحميل الصوت
  }

  @ViewChild('engineButton') engineButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('introWrapper') introWrapper!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const btn = this.engineButton.nativeElement;

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      this.playEngineSound();
      setTimeout(() => {
        this.router.navigateByUrl('/SearchinForTrip');
      }, 1000);

    });
  }

  private playEngineSound(): void {
    
    this.engineSound.currentTime = 0; // علشان يبدأ من الأول كل مرة
    this.engineSound.play();
  }
}