import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { IntroComponent } from "./Component/intro/intro.component";
import { Intro2Component } from './Component/intro2/intro2.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { QuestionComponent } from './Component/question/question.component';
import { HomeComponent } from './Component/home/home.component';
import { ServicesComponent } from './Component/services/services.component';
import { BlogsComponent } from './Component/blogs/blogs.component';
import { EventsComponent } from "./Component/events/events.component";
import { HotelsComponent } from "./Component/hotels/hotels.component";
import { EventComponent } from "./Component/event/event.component";
import { CarRentComponent } from "./Component/car-rent/car-rent.component";
import { CarWashComponent } from './Component/car-wash/car-wash.component';
import { Test2Component } from './Component/test2/test2.component';
import { TripixComponent } from "./Component/tripix/tripix.component";
import { DriverPageComponent } from './Component/driver-page/driver-page.component';
import { LicenseCardComponent } from "./Component/license-card/license-card.component";
import { DriverInfoComponent } from "./Component/driver-info/driver-info.component";
import { DriverProfileComponent } from "./Component/driver-profile/driver-profile.component";
import { EditAccountComponent } from "./Component/edit-account/edit-account.component";
import { AddcarPhohtosComponent } from "./Component/addcar-phohtos/addcar-phohtos.component";
import { CarLicenseComponent } from "./Component/car-license/car-license.component";
import { CriminalrecordComponent } from "./Component/criminalrecord/criminalrecord.component";
import { FaceIDComponent } from "./Component/face-id/face-id.component";
import { ChatBotComponent } from "./Component/chat-bot/chat-bot.component";
import { Test4Component } from "./Component/test4/test4.component";
import { OurCarsComponent } from "./Component/our-cars/our-cars.component";
import { DashboardComponent } from "./Component/dashboard/dashboard.component";
import { PaymentComponent } from "./Component/payment/payment.component";
import { HelpooComponent } from "./Component/helpoo/helpoo.component";
import { CarMaintenanceComponent } from "./Component/car-maintenance/car-maintenance.component";
import { FAQComponent } from './Component/faq/faq.component';
import { AboutComponent } from "./Component/about/about.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './Component/login/login.component';
import { JobsComponent } from "./Component/jobs/jobs.component";
import { TipsComponent } from './Component/tips/tips.component';
import { TIPComponent } from "./Component/tip/tip.component";
import { SellCarComponent } from "./Component/sell-car/sell-car.component";
import { OurStoryComponent } from "./Component/our-story/our-story.component";
import { LoaderComponent } from './Component/shared/loader/loader.component';
import { TripbookComponent } from './Component/tripbook/tripbook.component';

import { PrombetComponent } from './Component/Prombet/prombet.component';






@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IntroComponent, Intro2Component, QuestionComponent, HomeComponent, ServicesComponent, BlogsComponent, EventsComponent, HotelsComponent, EventComponent, CarRentComponent, CarWashComponent, Test2Component, TripixComponent, DriverPageComponent, LicenseCardComponent, DriverInfoComponent, DriverProfileComponent, EditAccountComponent, AddcarPhohtosComponent, CarLicenseComponent, CriminalrecordComponent, FaceIDComponent, ChatBotComponent, Test4Component, OurCarsComponent, DashboardComponent, PaymentComponent, HelpooComponent, CarMaintenanceComponent, FAQComponent, AboutComponent,  LoginComponent, JobsComponent, TipsComponent, TIPComponent, SellCarComponent, OurStoryComponent,LoaderComponent,TripbookComponent,PrombetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
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