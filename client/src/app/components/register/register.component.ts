import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'common/toastr.service';
import { AuthService } from '../../auth/authservice.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
             private toastrService: ToastrService,
             private router: Router,
             private authService: AuthService) {
        this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.registerForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)        
      ])],
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20)     
      ])],
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    }, { validator: this.comparePassword('password', 'confirm')});
  }

  comparePassword(password, confirm) {
    return (group: FormGroup) => {
      if (group.controls[password].value === group.controls[confirm].value) {
        return null;
      } else {
        return { 'comparePassword': true }
      }
    }
  }

  onRegisterSubmit() {
    const user = {
      firstname: this.registerForm.get('firstname').value,
      lastname: this.registerForm.get('lastname').value,
      email: this.registerForm.get('email').value,
      username: this.registerForm.get('username').value,
      password: this.registerForm.get('password').value
    };
    console.log("User", user);
    return this.authService.register(user)
               .subscribe(data => {
                 console.log("Data returned ", data);
                 if(data.success === false) {
                   this.toastrService.error(data.message)
                 } else {
                   this.toastrService.success(data.message);
                   this.router.navigate(['/login']);
                 }
                 //this.registerForm.reset();
               });
  }

  resetRegisterForm() {
    this.registerForm.reset();
  }

}
