import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentServiceService } from '../../Services/Payment/payment-service.service';

@Component({
  selector: 'app-add-credit',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-credit.component.html',
  styleUrl: './add-credit.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Test4Component implements OnInit {
  cardTypeLogo: string = '../../../assets/images/blankcredit.png';
  cardForm: FormGroup;
  cardNumber: string = '';
  cardName: string = '';
  cardMonth: string = '';
  cardYear: string = '';
  cardCvv: string = '';
  minCardYear: number = new Date().getFullYear();
  isCardFlipped: boolean = false;
  focusedInput: string | null = null; // ✅ لتعقب الإدخال النشط
  focusElementStyle: any = null;
  isAnimating: boolean = false; // لحالة الأنيميشن
  formattedCardNumber: string = ''; // الرقم المنسق

  constructor(private fb: FormBuilder , private paymentservice : PaymentServiceService) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, this.luhnValidator]],
      cardName: ['', [Validators.required, this.cardNameValidator]],
      cardMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      cardYear: ['', [Validators.required, Validators.pattern(/^([2-9][0-9])$/)]],
      cardCvv: ['', [Validators.required, this.cvvValidator]]
    });
  }
  ngOnInit(): void {
    this.cardTypeLogo = '../../../assets/images/blankcredit.png';
  }

  

  /** ✅ التحقق من صحة رقم البطاقة باستخدام Luhn Algorithm */
  luhnValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const num = control.value.replace(/\s+/g, ''); // إزالة المسافات
    if (!/^\d{13,19}$/.test(num)) return { invalidCardNumber: true };

    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0) ? null : { invalidCardNumber: true };
  }

  /** ✅ التحقق من أن اسم حامل البطاقة يحتوي على اسمين بمسافة واحدة فقط */
  cardNameValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value.trim();
    if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(value)) {
      return { invalidCardName: true };
    }
    return null;
  }

  /** ✅ التحقق من CVV حسب نوع البطاقة (Visa/MasterCard = 3، AMEX = 4) */
  cvvValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const cvv = control.value;
    if (!/^\d{3,4}$/.test(cvv)) return { invalidCvv: true };
    return null;
  }


  // التحقق من رقم البطاقة باستخدام خوارزمية Luhn
  isValidCardNumber(cardNumber: string): boolean {
    let sum = 0;
    let alternate = false;
    let digits = cardNumber.replace(/\s+/g, '').split('').reverse().map(Number);

    for (let i = 0; i < digits.length; i++) {
      let n = digits[i];
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // التحقق من الاسم (يجب أن يكون حروف فقط بدون أرقام)
  isValidName(name: string): boolean {
    return /^[A-Za-z\s]+$/.test(name);
  }

  isValidExpiry(month: string, year: string): boolean {
    if (!month || !year) return false;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const inputYear = parseInt(`20${year}`, 10);
    const inputMonth = parseInt(month, 10);

    if (inputYear < currentYear) return false;
    if (inputYear === currentYear && inputMonth < currentMonth) return false;

    return inputMonth >= 1 && inputMonth <= 12;
  }

  // التحقق من CVV (3 أو 4 أرقام فقط)
  isValidCvv(cvv: string): boolean {
    return /^[0-9]{3,4}$/.test(cvv);
  }


  cardTypes = [ 
    { type: 'Visa', regex: /^4/, logo: '../../../assets/images/visa.png' },
    { type: 'MasterCard', regex: /^5[1-5]/, logo: '../../../assets/images/mastercard.png' },
    { type: 'Amex', regex: /^3[47]/, logo: '../../../assets/images/amex-card1708.png' },
    { type: 'Discover', regex: /^6(?:011|5)/, logo: '../../../assets/images/DLL.png' },
    { type: 'Mezza', regex: /^5078|^5079/, logo: '../../../assets/images/mezza.png' } // تحديث: إضافة Mezza Card
  ];

  months: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  years: string[] = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

  // دالة لتحديد نوع البطاقة
  getCardType(): string {
    const number = this.cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^(34|37)/.test(number)) return 'amex';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^6011/.test(number)) return 'discover';
    if (/^9792/.test(number)) return 'troy';
    return 'visa';
  }

  // تحديد الحد الأدنى للشهر بناءً على السنة
  get minCardMonth(): number {
    return this.cardYear === this.minCardYear.toString() ? new Date().getMonth() + 1 : 1;
  }

  // تنسيق الرقم بشكل مناسب
  getFormattedCardNumber(): string {
    return this.cardNumber.replace(/\D/g, '')
      .replace(/(.{4})(?=.)/g, '$1 ') // إضافة مسافة بعد كل 4 أرقام
      .trim();
  }

  // التعامل مع التغيير في الرقم
  onCardNumberChange(): void {
    // إزالة أي أحرف غير رقمية
    this.cardNumber = this.cardNumber.replace(/\D/g, '');

    if (!this.cardNumber || this.cardNumber.trim().length === 0) {
      this.cardTypeLogo = '../../../assets/images/blankcredit.png'; // مثال: إخفاء أيقونة البطاقة
      console.log('🚀 الإدخال أصبح فارغًا!');
    }

    // تقسيم الرقم إلى مجموعات من 4 أرقام
    let formattedNumber = this.cardNumber.replace(/(.{4})(?=.)/g, '$1 ');

    // تخصيص الرقم المنسق
    this.cardNumber = formattedNumber.substring(0, 19);  // الحد من العدد إلى 19 رقمًا (4 مجموعات)

    // تحديث الرقم المنسق
    this.formattedCardNumber = this.getFormattedCardNumber();

    const sanitizedNumber = this.cardNumber.replace(/\s+/g, '');


    for (let card of this.cardTypes) {
      if (card.regex.test(sanitizedNumber)) {
        this.cardTypeLogo = card.logo;
        break;
      }
    }


    // بدء الأنيميشن
    this.isAnimating = true;
    setTimeout(() => this.isAnimating = false, 1000);  // إيقاف الأنيميشن بعد 1 ثانية
  }

  // تغيير حالة التقليب
  flipCard(status: boolean): void {
    this.isCardFlipped = status;
  }

  // تعيين الإدخال النشط
  setFocus(inputField: string): void {
    this.focusedInput = inputField;
  }

  // مسح الإدخال النشط
  clearFocus(): void {
    this.focusedInput = null;
  }

  cardData = {
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  }

  // إرسال البيانات عند الضغط على زر Submit
  submitCard(): void {
    console.log('Card Submitted:', {
      number: this.cardNumber,
      name: this.cardName,
      expiry: `${this.cardMonth}/${this.cardYear}`,
      cvv: this.cardCvv
    });

    this.cardData = {
      cardNumber : this.cardNumber.replaceAll(" ",""),
      cardHolderName: this.cardName,
      expiryMonth: this.cardMonth,
      expiryYear: this.cardYear,
      cvv: this.cardCvv
    }

    console.log(this.cardData.cardNumber);

    this.paymentservice.saveCard(this.cardData).subscribe({
      next:(response) => 
      {
        alert(response);
      }
    })
  }
}