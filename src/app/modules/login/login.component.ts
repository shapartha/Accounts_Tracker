import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { AuthService } from 'app/services/auth.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;

  constructor(private utilService: UtilService, private router: Router, private fb: FormBuilder, private apiService: ApiService, private authService: AuthService) {
    let _loggedInUser = this.utilService.appUserId;
    if (_loggedInUser != undefined && !isNaN(_loggedInUser) && _loggedInUser != 0) {
      this.router.navigate(['home']);
    }
    this.form = this.fb.group({
      email_id: [],
      password: [],
      stayLoggedIn: [false]
    });
  }

  submitSignIn() {
    const formValues = this.form.value;
    if (formValues.email_id != undefined && formValues.email_id != '' && formValues.password != undefined && formValues.password != '') {
      let inputParams = {
        email_id: formValues.email_id,
        password: btoa(formValues.password)
      }
      this.apiService.loginUser(inputParams).subscribe({
        next: (val) => {
          if (val.success) {
            this.utilService.appUserId = val.dataArray[0].user_id;
            if (formValues.stayLoggedIn == true) {
              this.utilService.setCookie("app-user-id", val.dataArray[0].user_id, 30);
            }
            this.utilService.showAlert('Login Successful ! Redirecting...', 'success');
            this.disableButtons();
            setTimeout(() => {
              this.authService.login();
              this.router.navigate(['home']);
              this.utilService.removeAlert();
            }, 2000);
          } else {
            this.utilService.showAlert('Login Credentials Failed');
          }
        }, error: (err) => {
          console.log("API Error");
          console.error(err);
          this.utilService.showAlert("API Error -> " + err);
        }
      });
    } else {
      this.utilService.showAlert('Login Error -> Email ID or Password field cannot be blank');
    }
  }

  disableButtons() {
    document.getElementById("register")!.setAttribute('disabled', 'true');
    document.getElementById("reset")!.setAttribute('disabled', 'true');
  }

  resetForm() {
    this.form.reset();
  }
}
