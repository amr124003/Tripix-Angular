import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ConnectDriverService } from '../../Services/ConnectDriver/connect-driver.service';
import { AuthService } from '../../Services/Auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-info',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './driver-info.component.html',
  styleUrl: './driver-info.component.css'
})
export class DriverInfoComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  carForm!: FormGroup;
  imageSrc: string = 'assets/images/Avatar.jpg'; // صورة افتراضية
  Uploadfile! : File 
  LoginisLoading = false;
  registerOTPForm: FormGroup;
  bars = Array(5); // عدد الشرايط
  invalidOtp: boolean = false;
  registerotp: string[] = ["", "", "", ""];
  otpRequired: boolean = false;
  registermodalcounter: number = 0;
  isRegisterOtpModalOpen = false;
  showMessage: boolean = false;
  modalcounter: number = 0;
  minutes: number = 1;
  seconds: number = 30;
  ImgError : string = '' 

  constructor(private fb: FormBuilder, private DriverRepo: ConnectDriverService , private _AuthServices : AuthService , private router : Router) 
  {
    this.carForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmpassword: ['', [Validators.required, this.matchPasswordValidator1.bind(this)]]
    });

     this.registerOTPForm = this.fb.group({
      otp0: ['', [Validators.required]],
      otp1: ['', [Validators.required]],
      otp2: ['', [Validators.required]],
      otp3: ['', [Validators.required]]
    });

  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  registerverifyOtp() {

    if (this.registerOTPForm.valid) {
      const fullOtp = Object.values(this.registerOTPForm.value).join('');

      const confirmationCredentials = {
        Email: this.carForm.get("email")?.value,
        OTP: fullOtp
      }
      
      this._AuthServices.confirmEmail(confirmationCredentials).subscribe({
        next: (response) => {
          if (response.roles.includes("User")) {
            this.router.navigateByUrl("/Home");
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", "User");
          }

          if (response.roles.includes("Admin")) {
            this.router.navigateByUrl("/Dashboard");
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", "Admin");
          }

          if (response.roles.includes("SuperAdmin")) {
            this.router.navigateByUrl("/Dashboard");
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", "SuperAdmin");
          }
        },
        error: (error) => {
          this.invalidOtp = true;
        }
      });
    }
  }


  

  submitForm() {
    if (this.carForm.invalid || this.ImgError) {
      this.carForm.markAllAsTouched();
      return;
    }
    if(this.registermodalcounter > 0)
    {
      this.isRegisterOtpModalOpen = true;
      return;
    }

    this.LoginisLoading = true;

    const formData = new FormData();
    formData.append('userName', this.carForm.get('name')?.value); 
    formData.append('phoneNumber', this.carForm.get('phone')?.value); 
    formData.append('email', this.carForm.get('email')?.value); 
    formData.append('password', this.carForm.get('password')?.value); 
    formData.append('confirmPassword', this.carForm.get('confirmpassword')?.value); 
    formData.append('image', this.Uploadfile); 
    

    

    this.DriverRepo.RegisterDriver(formData).subscribe({
      next:(Response) => 
      {
        this.isRegisterOtpModalOpen = true;
          this.registermodalcounter++;
      },
      error:(err) =>
      {
        this.ImgError = err.error.errors[1];
        this.LoginisLoading = false;
      }
    })
  }

  get f() {
    return this.carForm.controls;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      this.Uploadfile = file;

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imageSrc = e.target?.result as string;
      };

      this.ImgError = '';

      reader.readAsDataURL(file);
    }
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

  get passwordValue(): string {
    return this.carForm.get('password')?.value || '';
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

  matchPasswordValidator1(control: AbstractControl): ValidationErrors | null {
    if (!this.carForm) return null; // عشان نتأكد إن الفورم متعرف
    const password = this.carForm.get('password')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }
   handleRegisterPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';



    if (clipboardData.length === this.registerotp.length) {
      // ✅ لو النص المنسوخ طوله يساوي عدد الحقول، يتم توزيعه على الحقول
      this.registerotp = clipboardData.split('');
    } else {
      return; // تجاهل اللصق لو النص المنسوخ مش مساوي لعدد الخانات
    }
  }

  registermoveToNext(event: any, index: number) {
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
        this.registerotp[index] = '';
        this.registerotp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      } else if (index > 0) {
        // ✅ لو الخانة فاضية، ارجع للخانة السابقة واحذف محتواها
        this.registerotp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      }
      return;
    }

    this.otpRequired = false;
  }

  closeRegisterModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.add('hidden'); // ✅ اضف كلاس الـ Animation
      this.isRegisterOtpModalOpen = false; // ✅ اخفِ المودال بعد انتهاء الـ Animation
    }
  }

  registeronInputFocus(): void {
    const isEmpty = this.registerotp.some(value => value === ''); // التحقق إذا كانت هناك خانات فارغة
    this.otpRequired = isEmpty;
    this.invalidOtp = false;
  }

  ResendconfirmCred = {
    Email: ''
  }
  ResendconfirmOTP() {
    this.ResendconfirmCred = {
      Email: this.carForm.get('email')?.value
    };

    this._AuthServices.ResendconfirmOTP(this.ResendconfirmCred).subscribe({
      next: (Response) => {
        console.log(Response);
      },
      error: (Response) => {
        console.log(Response.error.errors[1]);
      }
    })

    this.showMessage = true;
    this.startCountdown();
    this.modalcounter = 0;
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


}
