import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/authservice.service';
import { ToastrService } from 'common/toastr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private toastrService: ToastrService,
              private router: Router
              ) {
    this.createForm();
   }

   createForm() {
     this.loginForm = this.formBuilder.group({
       username: ['', Validators.required],
       password: ['', Validators.required]
     });
   }

  ngOnInit() {
  }

  loginSubmit() {
    const user = {
      username: this.loginForm.get('username').value,
      password: this.loginForm.get('password').value
    };
    console.log("Login", user);
    this.authService.login(user)
        .subscribe(data => {      
          const a = JSON.parse(data._body);     
          if(a.success === false) {
            this.toastrService.error(data.message);
          } else if(a.success === true) {
            this.toastrService.success('Login success');
            //this.router.navigate(['/profile']);
          }
          this.loginForm.reset();
        });
  }

}
