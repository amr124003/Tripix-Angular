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
    
];
