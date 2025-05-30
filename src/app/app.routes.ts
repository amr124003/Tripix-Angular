import { Routes } from '@angular/router';
import { FaceIDComponent } from './Component/face-id/face-id.component';
import { LicenseCardComponent } from './Component/license-card/license-card.component';
import { CriminalrecordComponent } from './Component/criminalrecord/criminalrecord.component';
import { CarLicenseComponent } from './Component/car-license/car-license.component';
import { DriverInfoComponent } from './Component/driver-info/driver-info.component';
import { EditAccountComponent } from './Component/edit-account/edit-account.component';
import { DriverPageComponent } from './Component/driver-page/driver-page.component';
import { HomeComponent } from './Component/home/home.component';
import { IntroComponent } from './Component/intro/intro.component';
import { CarWashComponent } from './Component/car-wash/car-wash.component';
import { CarMaintenanceComponent } from './Component/car-maintenance/car-maintenance.component';
import { CarRentComponent } from './Component/car-rent/car-rent.component';
import { ChatBotComponent } from './Component/chat-bot/chat-bot.component';
import { AboutComponent } from './Component/about/about.component';
import { LoginComponent } from './Component/login/login.component';
import { OurCarsComponent } from './Component/our-cars/our-cars.component';
import { OurMotorbikesComponent } from './Component/our-motorbikes/our-motorbikes.component';
import { OurElectricCarsComponent } from './Component/our-electric-cars/our-electric-cars.component';
import { ServicesComponent } from './Component/services/services.component';
import { HelpooComponent } from './Component/helpoo/helpoo.component';
import { SparepartComponent } from './Component/sparepart/sparepart.component';
import { Component } from '@angular/core';
import { EventComponent } from './Component/event/event.component';
import { BlogsComponent } from './Component/blogs/blogs.component';
import { SellCarComponent } from './Component/sell-car/sell-car.component';
import { OurSparePartsComponent } from './Component/our-spare-parts/our-spare-parts.component';
import { EventsComponent } from './Component/events/events.component';
import { FAQComponent } from './Component/faq/faq.component';
import { TripixComponent } from './Component/tripix/tripix.component';
import { PaymentComponent } from './Component/payment/payment.component';
import { DriverLoginComponent } from './Component/driver-login/driver-login.component';
import { SearchingTripComponent } from './Component/searching-trip/searching-trip.component';
import { StartEngineComponent } from './Component/start-engine/start-engine.component';
import { DashboardComponent } from './Component/dashboard/dashboard.component';
import { WashletsComponent } from './Component/washlets/washlets.component';
import { UserfinaltripComponent } from './Component/userfinaltrip/userfinaltrip.component';
import { DriverChatComponent } from './Component/driver-chat/driver-chat.component';
import { DriverfinaltripComponent } from './Component/driverfinaltrip/driverfinaltrip.component';
import { CarsImagesComponent } from './Component/cars-images/cars-images.component';


export const routes: Routes = 
[
    {path:'',loadComponent: () => import('./Component/intro/intro.component').then(m => m.IntroComponent),data: { animation: 'HomePage' }},
    {path:'Home',loadComponent: () => import('./Component/home/home.component').then(m => m.HomeComponent),data: { animation: 'AboutPage' }},
    {path:'CarWash',component:CarWashComponent},
    {path:'CarRepair',component:CarMaintenanceComponent},
    {path:'CarRental',component:CarRentComponent},
    {path:'FaceID',component:FaceIDComponent},
    {path:'Driving_license',component:LicenseCardComponent},
    {path:'Criminalrecord',component:CriminalrecordComponent},
    {path:'CarLicense',component:CarLicenseComponent},
    {path:'PersonalInfo',component:DriverInfoComponent},
    {path:'EditData',component:EditAccountComponent},
    {path:'DriverPage',component:DriverPageComponent},
    {path:'ChatBot',component:ChatBotComponent},
    {path:'About',component:AboutComponent},
    {path:'Sign In',component:LoginComponent},
    {path:'OurCars',component:OurCarsComponent},
    {path:"OurMotorbikes",component:OurMotorbikesComponent},
    {path:"OurElectricCars",component:OurElectricCarsComponent},
    {path:"Services",component:ServicesComponent},
    {path:"Helpoo",component:HelpooComponent},
    {path:"SpareParts",component:OurSparePartsComponent},
    {path:"Events",component:EventsComponent},
    {path:"Blogs",component:BlogsComponent},
    {path:"About",component:AboutComponent},
    {path:"SellCar",component:SellCarComponent},
    {path:"Event",component:EventComponent},
    {path:"FAQs",component:FAQComponent},
    {path:"DriverPage",component:DriverPageComponent},
    {path:"DriverInfo",component:DriverInfoComponent},
    {path:"FaceID",component:FaceIDComponent},
    {path:"CriminalRecord",component:CriminalrecordComponent},
    {path:"CarLicence",component:CarLicenseComponent},
    {path:"DriverLicense",component:LicenseCardComponent},
    {path:"TripixPage",component:TripixComponent},
    {path:"Payment",component:PaymentComponent},
    {path:"DriverLogin",component:DriverLoginComponent},
    {path:'SearchinForTrip',component:SearchingTripComponent},
    {path:'StartEngine',component:StartEngineComponent},
    {path:'Dashboard',component:DashboardComponent},
    {path:'Washlets',component:WashletsComponent},
    {path:'UserFinalTrip',component:UserfinaltripComponent},
    {path:'DriverFinalTrip',component:DriverfinaltripComponent},
    {path:'CarImages' , component:CarsImagesComponent}
];
