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


export const routes: Routes = 
[
    {path:'',component:IntroComponent},
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
    {path:'Home',component:HomeComponent},
    {path:'ChatBot',component:ChatBotComponent},
    {path:'About',component:AboutComponent},
    {path:'Sign In',component:LoginComponent},
    {path:'OurCars',component:OurCarsComponent},
    {path:"OurMotorbikes",component:OurMotorbikesComponent},
    {path:"OurElectricCars",component:OurElectricCarsComponent},
    {path:"Services",component:ServicesComponent},
    {path:"Helpoo",component:HelpooComponent},
    {path:"SpareParts",component:OurSparePartsComponent},
    {path:"Events",component:EventComponent},
    {path:"Blogs",component:BlogsComponent},
    {path:"About",component:AboutComponent},
    {path:"SellCar",component:SellCarComponent}
];
