import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  RegisterForm: FormGroup;
  OTPForm: FormGroup;
  isOtpModalOpen = false;
  otp: string[] = ["", "", "", ""];
  OTP: any = '';
  invalidOtp: boolean = false;
  otpRequired: boolean = false;
  forgetcounter: number = 0;
  minutes: number = 1;
  seconds: number = 30;
  showMessage: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.customEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]]
    });

    this.RegisterForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20) , Validators.pattern('^(?=.*[0-9]).+$')]],
      email: ['', [Validators.required, Validators.email, this.customEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]] ,
      confirmpassword: ['', [Validators.required, Validators.minLength(8) , this.matchPasswordValidator.bind(this)]]
    });

    this.OTPForm = this.fb.group({
      otp0: ['', [Validators.required]],
      otp1: ['', [Validators.required]],
      otp2: ['', [Validators.required]],
      otp3: ['', [Validators.required]]
    });
  }
  
  startCountdown(): void {
    const interval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        if (this.minutes > 0) {
          this.minutes--;
          this.seconds = 59;
        } else {
          clearInterval(interval);
          this.showMessage = false; // إخفاء الرسالة بعد انتهاء العداد
        }
      }
    }, 1000);
  }

  get otpControls() {
    return this.OTPForm.controls;
  }

  ResendOTP()
  {
    this.showMessage = true;
    this.startCountdown();
    this.forgetcounter = 0;
    this.sendOtp();
  }


  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
  
    if (clipboardData.length === this.otp.length) {
      // ✅ لو النص المنسوخ طوله يساوي عدد الحقول، يتم توزيعه على الحقول
      this.otp = clipboardData.split('');
    } else {
      return; // تجاهل اللصق لو النص المنسوخ مش مساوي لعدد الخانات
    }
  }
  

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    console.log(this.loginForm.value);
  }

  

  openOtpModal(event: Event) {
    event.preventDefault(); // تمنع التنقل لصفحة جديدة

    if (!this.loginForm.get('email')?.value || this.loginForm.get('email')?.invalid) {
      return;
    }

    this.isOtpModalOpen = true;
    this.sendOtp();
  }

  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.add('hidden'); // ✅ اضف كلاس الـ Animation
      setTimeout(() => {
        this.isOtpModalOpen = false; // ✅ اخفِ المودال بعد انتهاء الـ Animation
      }, 300); // نفس مدة الـ Animation
    }
  }

  sendOtp() {
    if (this.forgetcounter == 0) {
      const email = this.loginForm.get('email')?.value;
      this.http.post('https://localhost:7012/api/OTP/send-otp', { email }).subscribe({
        next: (response: any) => {
          this.isOtpModalOpen = true; // فتح المودال بعد إرسال الـ OTP
          this.OTP = response.otp;
          console.log(this.OTP);
        },
        error: (error) => {
          console.error(error);
        }
      });
      this.forgetcounter++;
    }
  }

  moveToNext(event: any, index: number) {
    const inputValue = event.target.value;
    if (inputValue && index < 3) {
      const nextInput = document.querySelectorAll(".otp-container input")[index + 1] as HTMLInputElement;
      if (nextInput) {
        nextInput.focus(); // ✅ هنا الحل
      }
    }

    if (event.key === 'Backspace') {
      if (index == 3) {
        // ✅ لو في حرف، امسحه فقط وما ترجعش للخلف
        this.otp[index] = '';
        this.otp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      } else if (index > 0) {
        // ✅ لو الخانة فاضية، ارجع للخانة السابقة واحذف محتواها
        this.otp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      }
      return;
    }

    this.otpRequired = false;
  }
  verifyOtp() {
    if (this.OTPForm.valid) {
      const fullOtp = Object.values(this.OTPForm.value).join('');
      console.log(fullOtp == this.OTP);
      if (fullOtp == this.OTP) {
        this.invalidOtp = false;
        this.otpRequired = false;
      }

      else{
        this.invalidOtp = true;
      }
    }
  }
  
  onInputFocus(): void {
    const isEmpty = this.otp.some(value => value === ''); // التحقق إذا كانت هناك خانات فارغة
    this.otpRequired = isEmpty;
    this.invalidOtp = false;
  }

  get passwordValue(): string {
    return this.loginForm.get('password')?.value || '';
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.passwordValue);
  }

  customEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email: string = control.value;
    if (email && !email.match(/^[a-zA-Z0-9._%+-]+@(gmail|yahoo)\.com$/)) {
      return { invalidEmailDomain: true };
    }
    return null;
  }

  customOtpValidator(control: AbstractControl): ValidationErrors | null {
    const otp: string = control.value;
    if (otp == this.OTP) {
      return { invalidEmailDomain: true };
    }
    return null;
  }

  matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.RegisterForm) return null; // عشان نتأكد إن الفورم متعرف
    const password = this.RegisterForm.get('password')?.value;
    const confirmPassword = control.value;
    
    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }
  

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      return { invalidPassword: true };
    }
    return null;
  }



  @ViewChild('container', { static: false }) container!: ElementRef;
  register = false;


  onRegisterClick(): void {
    this.container.nativeElement.classList.add('active');
    setTimeout(() => {
      this.register = true;
    }, 1000); // 3000 ملي ثانية = 3 ثواني
  }

  onLoginClick(): void {
    this.container.nativeElement.classList.remove('active');
    setTimeout(() => {
      this.register = false;
    }, 1000); // 3000 ملي ثانية = 3 ثواني
  }
}