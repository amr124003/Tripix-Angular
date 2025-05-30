import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { TripbookComponent } from "../tripbook/tripbook.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConnectUserService } from '../../Services/ConnectUser/connect-user.service';

@Component({
  selector: 'app-tripix',
  imports: [ TripbookComponent , RouterLink , RouterLinkActive],
  templateUrl: './tripix.component.html',
  styleUrl: './tripix.component.css'
})
export class TripixComponent implements OnDestroy{

  @ViewChild('plansSection') plansSection!: ElementRef;

  constructor(private connectuserservice: ConnectUserService) {

  }

  ngOnDestroy(): void {
    this.connectuserservice.stopConnection(); 
  }


  scrollToPlans() {
    
    this.plansSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

}
