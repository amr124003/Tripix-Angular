import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { Test4Component } from '../Add-Credit/add-credit.component';
import { PaymentServiceService } from '../../Services/Payment/payment-service.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-payment',
  imports: [CommonModule,Test4Component,FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit{
  
  showPaymentModal: boolean = false;
  paymentMethodAdded: boolean = false;
  paymentMethods: any[] = [];
  counter : number = 0;
  showBankAccountModal = false;
  showTripixCardModal = false;
  bankName: string = '';
  accountNumber: string = '';
  iban: string = '';
  giftCode: string = '';

  constructor(private paymentservice : PaymentServiceService)
  {

  }

  ngOnInit(): void {
    this.paymentservice.getCards().subscribe({
      next:(cards) => 
      {
        this.paymentMethods = cards;
      },
      error:() => {
        console.log("error in get Data");
      }
    });
  }

  getFormattedCardNumber(cardNumber : string): string {
    return cardNumber.replace(/\D/g, '')
    .replace(/(.{4})(?=.)/g, '$1\u2003') // هنا استخدمت مسافة Unicode عريضة
    .trim();
  }

  

  addPaymentMethod() {
      // تطبيق الأنيميشن بعد الإضافة
      setTimeout(() => {
          const cards = document.querySelectorAll('.payment-card');
          cards.forEach(card => {
              card.classList.add('animate-card');
          });
      }, 50);
  }

  getBankLogo(bankName : string):string
  {
    return '../../../assets/images/'+bankName+'.png';
  }

  getSchemaLogo(schema : string):string
  {
    return '../../../assets/images/'+schema+'.png';
  }
    


  togglePaymentModal() {
    this.showPaymentModal = !this.showPaymentModal;
    setTimeout(() => {
        const modal = document.querySelector('.payment-modal');
        if (this.showPaymentModal) {
            modal?.classList.add('show');
        } else {
            modal?.classList.remove('show');
        }
    }, 10);
  }

  selectPayment(method: string) {
    console.log(`Selected payment method: ${method}`);
    this.paymentMethodAdded = true;
    this.showPaymentModal = false;
  }

  openBankAccountDialog() {
    this.showBankAccountModal = true;
  }

  closeBankAccountDialog() {
    this.showBankAccountModal = false;
  }

  saveBankAccount() {
    if (this.bankName && this.accountNumber && this.iban) {
      console.log('Bank Account Saved:', {
        bankName: this.bankName,
        accountNumber: this.accountNumber,
        iban: this.iban
      });
      this.closeBankAccountDialog();
    } else {
      alert('Please fill in all fields.');
    }
  }

  openTripixCardDialog() {
    this.showTripixCardModal = true;
  }

  closeTripixCardDialog() {
    this.showTripixCardModal = false;
  }

  submitGiftCode() {
    if (this.giftCode) {
      console.log('Gift Code Submitted:', this.giftCode);
      this.closeTripixCardDialog();
    } else {
      alert('Please enter a gift code.');
    }
  }
}