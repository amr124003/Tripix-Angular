import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test3',
  imports: [FormsModule,CommonModule],
  templateUrl: './test3.component.html',
  styleUrl: './test3.component.css'
})
export class Test3Component {
  passengerType: string = 'me'; // القيمة الافتراضية "لي"
  isForSomeoneElse = false;

  firstName: string = '';
  lastName: string = '';
  phone: string = '';

  onPassengerTypeChange() {
    this.isForSomeoneElse = this.passengerType === 'someoneElse';
  }
}