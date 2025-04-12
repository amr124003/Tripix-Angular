import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";


declare var google: any;  // إعلان `google` لتجنب أخطاء الـ TypeScript


@Component({
  selector: 'app-test2',
  imports: [FormsModule,CommonModule],
  templateUrl: './test2.component.html',
  styleUrl: './test2.component.css'
})
export class Test2Component  implements AfterViewInit {

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    // تأكيد تحميل مكتبة Google Identity Services
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "1043954645475-7nninb1a3ddm67tb23k5v50hodrgjpai.apps.googleusercontent.com",
        callback: this.handleCredentialResponse.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large' }
      );
    }
  }

  handleCredentialResponse(response: any) {
    console.log("Google Token:", response.credential);
    
    // إرسال التوكن للـ API للتحقق منه
    this.http.post('https://localhost:7012/api/Auth/GoogleLogin', { tokenID: response.credential })
      .subscribe({
        next:(res) => 
        {
          console.log(res);
        },
        error:(error) => 
        {
          console.log(error);
        }
      });
  }
}