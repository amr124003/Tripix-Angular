import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';

import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';


import { LoaderComponent } from './Component/shared/loader/loader.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { TicketComponent } from "./Component/ticket/ticket.component";



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, TicketComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('simpleFadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ]),  
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent {

  isLoading = true;


  constructor(private router: Router) {
    this.router.events.subscribe((event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0); // يرجع الصفحة للأعلى
      }
    }));

    this.router.events.subscribe(event => {
      console.log(event); // ✅ تأكد إن الـ events بتوصل
      if (event instanceof NavigationStart) {
        console.log('🔄 بدأ التحميل...');
        this.isLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        console.log('✅ انتهى التحميل!');
        setTimeout(() => {
          this.isLoading = false;
        }, 2000); // تأخير نصف ثانية
      }
    });
  }

  

  title = 'Tripix';
}