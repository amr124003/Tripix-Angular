import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../Services/Auth/auth.service';
import { OtpService } from '../../Services/OTP/otp.service';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../Interfaces/decoded-token';
import { Router } from '@angular/router';
declare var google: any;
declare var FB: any;



@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit , OnInit {
  loginForm: FormGroup;
  RegisterForm: FormGroup;
  forgetOTPForm: FormGroup;
  registerOTPForm: FormGroup;
  isOtpModalOpen = false;
  isRegisterOtpModalOpen = false;
  forgetotp: string[] = ["", "", "", ""];
  forgetserverOTP: any = '';
  registerotp: string[] = ["", "", "", ""];
  registerserverOTP: any = '';
  invalidOtp: boolean = false;
  otpRequired: boolean = false;
  modalcounter: number = 0;
  registermodalcounter: number = 0;
  minutes: number = 1;
  seconds: number = 30;
  showMessage: boolean = false;
  RegisterEmailServeError: string = '';
  RegisterUserNameServeError: string = '';
  RegisterPhoneNumberServeError: string = '';
  PasswordChanged: boolean = false;
  LoginisLoading = false;
  RegisterisLoading = false;
  bars = Array(5); // عدد الشرايط



  Loginerrormessage: string = ''
  Registererrormessage!: string
  Registererrormessageshow: boolean = false
  googlemodalopened: boolean = false;


  constructor(private fb: FormBuilder, private http: HttpClient, private _AuthServices: AuthService, private _otpservice: OtpService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.customEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), this.passwordValidator]],
      rememberMe: [false] // ✅ افتراضيًا مغلق
    });

    this.RegisterForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^(?=.*[0-9]).+$')]],
      email: ['', [Validators.required, Validators.email, this.customEmailValidator]],
      phone: ['', [Validators.required, Validators.pattern('^(?=.*[0-9]).+$')]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), this.passwordValidator]],
      confirmpassword: ['', [Validators.required, this.matchPasswordValidator1.bind(this)]]
    });

    this.forgetOTPForm = this.fb.group({
      otp0: ['', [Validators.required]],
      otp1: ['', [Validators.required]],
      otp2: ['', [Validators.required]],
      otp3: ['', [Validators.required]],
      NewPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), this.passwordValidator]],
      ConfirmNewPassword: ['', [Validators.required, this.matchPasswordValidator2.bind(this)]]
    });

    this.registerOTPForm = this.fb.group({
      otp0: ['', [Validators.required]],
      otp1: ['', [Validators.required]],
      otp2: ['', [Validators.required]],
      otp3: ['', [Validators.required]]
    });
  }
  ngOnInit(): void {
    this.initGoogleLogin();
  }
  
  ngAfterViewInit(): void {
    this.initGoogleLogin();
  }

  initGoogleLogin() {
    // تأكيد تحميل مكتبة Google Identity Services
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "1043954645475-7nninb1a3ddm67tb23k5v50hodrgjpai.apps.googleusercontent.com",
        callback: this.handleCredentialResponse.bind(this)
      });


      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: "filled_blue",
          size: "large", // حجم كبير
          shape: "pill", // زرار بحواف دائرية (بيضاوي)
          text: "", 
          width: 260 // عرض الزرار 250px
        }
      );
    }
  }

  Googletoken = {
    TokenID: ''
  }

  handleCredentialResponse(Data: any) {
    this.Googletoken = {
      TokenID: Data.credential
    }

    this._AuthServices.googleLogin(this.Googletoken).subscribe({
      next: (response) => {
        localStorage.clear();
        localStorage.setItem('googletoken', response.token);
        this.router.navigateByUrl("/Home");
      }
    })
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

  ResendconfirmCred = {
    Email: ''
  }
  ResendconfirmOTP() {
    this.ResendconfirmCred = {
      Email: this.loginForm.get('email')?.value
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

  ResendForgetOTP() {

  }


  handleforgetPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';



    if (clipboardData.length === this.forgetotp.length) {
      // ✅ لو النص المنسوخ طوله يساوي عدد الحقول، يتم توزيعه على الحقول
      this.forgetotp = clipboardData.split('');
    } else {
      return; // تجاهل اللصق لو النص المنسوخ مش مساوي لعدد الخانات
    }
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

  Logincredentials = {
    Email: '',
    Password: '',
    RememberMe: false
  }



  onLoginSubmit() {
    if (this.loginForm.invalid) {
      return;
    }



    this.Logincredentials = {
      Email: this.loginForm.get("email")?.value,
      Password: this.loginForm.get("password")?.value,
      RememberMe: this.loginForm.get("rememberMe")?.value
    }

    this.LoginisLoading = true;

    this._AuthServices.Login(this.Logincredentials).subscribe({
      next: (response) => {
        console.log(response);
        if (response.roles.includes("User")) {
          this.router.navigateByUrl("/Home");
          console.log(response);
          if (this.Logincredentials.RememberMe == true) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', 'User');
          }
          else if (this.Logincredentials.RememberMe == false) {
            sessionStorage.clear();
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('role', 'User');
          }
        }

        else if (response.roles.includes("Driver")) {
          this.router.navigateByUrl("/StartEngine");
          if (this.Logincredentials.RememberMe == true) {
            localStorage.clear();
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', 'Driver');
          }
          else if (this.Logincredentials.RememberMe == false) {
            sessionStorage.clear();
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('role', 'Driver');
          }
        }

        else if (response.roles.includes("Admin")) {
          this.router.navigateByUrl("/Dashboard");
          if (this.Logincredentials.RememberMe == true) {
            localStorage.clear();
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', 'Admin');
          }
          else if (this.Logincredentials.RememberMe == false) {
            sessionStorage.clear();
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('role', 'Admin');
          }
        }

        else if (response.roles.includes("SuperAdmin")) {
          this.router.navigateByUrl("/Dashboard");
          if (this.Logincredentials.RememberMe == true) {
            localStorage.clear();
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', 'SuperAdmin');

          }
          else if (this.Logincredentials.RememberMe == false) {
            sessionStorage.clear();
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('role', 'SuperAdmin');

          }
        }
      },

      error: (response) => {
        console.log(response);
        this.Loginerrormessage = response.error.errors[1];
        this.LoginisLoading = false;
      }
    })
  }

  changeCred() {
    this.Loginerrormessage = '';
  }

  changephone() {
    this.RegisterPhoneNumberServeError = '';
  }

  changeemail() {
    this.RegisterEmailServeError = '';
  }

  changeUsername() {
    this.RegisterUserNameServeError = '';
  }

  Registercredentials = {
    Username: '',
    Email: '',
    phone: '',
    Password: '',
    confirmpassword: ''
  }

  onRegisterSubmit() {
    if (this.registermodalcounter == 0) {
      this.Registercredentials = {
        Username: this.RegisterForm.get("username")?.value,
        Email: this.RegisterForm.get("email")?.value,
        phone: this.RegisterForm.get("phone")?.value,
        Password: this.RegisterForm.get("password")?.value,
        confirmpassword: this.RegisterForm.get("confirmpassword")?.value
      }

      this._AuthServices.Register(this.Registercredentials).subscribe({
        next: (Response) => {
          console.log(Response);
          this.RegisterisLoading = true
          this.isRegisterOtpModalOpen = true;
          this.registermodalcounter++;
        },
        error: (Response) => {
          console.log(Response);
          if (Response.error.errors[1] == 'This Email Is Already Used') {
            this.RegisterEmailServeError = Response.error.errors[1];
            this.RegisterisLoading = false;
          }
          else if (Response.error.errors[1] == 'This Phone Number Is Already Used') {
            this.RegisterPhoneNumberServeError = Response.error.errors[1];
            this.RegisterisLoading = false;
          }
          else {
            this.RegisterUserNameServeError = Response.error.errors[1];
            this.RegisterisLoading = false;
          }
        }
      })
    }


  }

  forgetPasswordCred = {
    Email: ''
  }

  forgetPassword(event: Event) {
    event.preventDefault(); // تمنع التنقل لصفحة جديدة

    if (!this.loginForm.get('email')?.value || this.loginForm.get('email')?.invalid) {
      return;
    }
    this.isOtpModalOpen = true;

    this.forgetPasswordCred = {
      Email: this.loginForm.get('email')?.value
    }

    if (this.modalcounter == 0) {

      this._AuthServices.ForgetPassword(this.forgetPasswordCred).subscribe({
        next: (response) => {
          console.log(response);
          this.modalcounter++;
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  closeforgetModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.add('hidden'); // ✅ اضف كلاس الـ Animation
      this.isOtpModalOpen = false; // ✅ اخفِ المودال بعد انتهاء الـ Animation
    }
  }

  closeRegisterModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.add('hidden'); // ✅ اضف كلاس الـ Animation
      this.isRegisterOtpModalOpen = false; // ✅ اخفِ المودال بعد انتهاء الـ Animation
    }
  }



  sendRegisterOtp() {
    if (this.registermodalcounter == 0) {
      const email = this.RegisterForm.get("email")?.value;
      this._otpservice.SendOTP(email).subscribe({
        next: (response: any) => {
          this.registerserverOTP = response.otp;
          console.log(this.registerserverOTP);
        },
        error: (error) => {
          console.error(error);
        }
      });
      this.registermodalcounter++;
    }
  }

  forgetmoveToNext(event: any, index: number) {
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
        this.forgetotp[index] = '';
        this.forgetotp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      } else if (index > 0) {
        // ✅ لو الخانة فاضية، ارجع للخانة السابقة واحذف محتواها
        this.forgetotp[index - 1] = ''; // حذف محتوى الخانة السابقة
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-container input')[index - 1];
        prevInput.focus();
      }
      return;
    }

    this.otpRequired = false;
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

  forgetOTPCred = {
    Email: '',
    OTP: '',
    NewPassword: '',
    ConfirmNewPassword: ''
  }

  forgetverifyOtp() {
    if (this.forgetOTPForm.valid) {
      const fullOtp = [this.forgetOTPForm.value.otp0, this.forgetOTPForm.value.otp1, this.forgetOTPForm.value.otp2, this.forgetOTPForm.value.otp3].join('');

      this.forgetOTPCred = {
        Email: this.loginForm.get("email")?.value,
        OTP: fullOtp,
        NewPassword: this.forgetOTPForm.get("NewPassword")?.value,
        ConfirmNewPassword: this.forgetOTPForm.get("ConfirmNewPassword")?.value
      }

      this._AuthServices.ResetPassword(this.forgetOTPCred).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.PasswordChanged = true;
            setTimeout(() => {
              this.isOtpModalOpen = false;
            }, 2000);
          }
        },
        error: (error) => {
          console.log(error);
          this.invalidOtp = true;
        }
      })
    }
  }

  confirmationCredentials = {
    Email: '',
    OTP: ''
  }

  registerverifyOtp() {

    if (this.registerOTPForm.valid) {
      const fullOtp = Object.values(this.registerOTPForm.value).join('');

      this.confirmationCredentials = {
        Email: this.RegisterForm.get("email")?.value,
        OTP: fullOtp
      }
      console.log(this.confirmationCredentials);
      this._AuthServices.confirmEmail(this.confirmationCredentials).subscribe({
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
          console.log(error);
          this.invalidOtp = true;
        }
      });
    }
  }

  forgetonInputFocus(): void {
    const isEmpty = this.forgetotp.some(value => value === ''); // التحقق إذا كانت هناك خانات فارغة
    this.otpRequired = isEmpty;
    this.invalidOtp = false;
  }

  registeronInputFocus(): void {
    const isEmpty = this.registerotp.some(value => value === ''); // التحقق إذا كانت هناك خانات فارغة
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

  matchPasswordValidator1(control: AbstractControl): ValidationErrors | null {
    if (!this.RegisterForm) return null; // عشان نتأكد إن الفورم متعرف
    const password = this.RegisterForm.get('password')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }

  matchPasswordValidator2(control: AbstractControl): ValidationErrors | null {
    if (!this.forgetOTPForm) return null; // عشان نتأكد إن الفورم متعرف
    const password = this.forgetOTPForm.get('NewPassword')?.value;
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

  invalidcredintials(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;
    if (!password) return null;


    if (this.Loginerrormessage) {
      return { invalidcredintials: true };
    }
    return null;
  }



  @ViewChild('container', { static: false }) container!: ElementRef;
  register = false;


  onRegisterClick(): void {

    this.container.nativeElement.classList.add('active');
    setTimeout(() => {
      this.register = true;
    }, 1000);

    setTimeout(() => {
      this.initGoogleLogin();
    }, 1000);
  }

  onLoginClick(): void {

    this.container.nativeElement.classList.remove('active');
    setTimeout(() => {
      this.register = false;
    }, 1000);

    setTimeout(() => {
      this.initGoogleLogin();
    }, 1000);
  }
}