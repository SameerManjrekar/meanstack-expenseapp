import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/authservice.service';
import { ToastrService } from 'common/toastr.service';
import { IUser } from '../../user/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  user: IUser;
  userObj: any;

  constructor(private authService: AuthService,
             private toastrService: ToastrService,
             private router: Router,
             private formBuilder: FormBuilder) {               
            }

  ngOnInit() {
    this.createForm();
    this.getUser();
  }

  createForm() {
    this.profileForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ])]
    });
    
  }

  getUser() {
    this.userObj = this.authService.currentUser === null ? localStorage.getItem('currentUser') : localStorage.getItem('currentUser');
    console.log("Current User ", this.userObj);
    const userObjParse = JSON.parse(this.userObj);
    if(userObjParse) {
      this.authService.getUser(userObjParse.user.userId)
                    .subscribe(data => {
                      if(data.success === false) {
                        if(data.errcode) {
                          this.authService.logout();
                          this.router.navigate(['/login']);
                        }
                        this.toastrService.error(data.message);
                      } else {
                        this.user = data.data[0];
                        this.populateForm(this.user)
                      }
                    });
                } else {
                  this.toastrService.error('No User Found');
                }    
  }

  populateForm(data) : void {
    this.profileForm.patchValue({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email
    });
  }

  updateUser() {
    this.authService.updateUser(this.userObj.userid, this.profileForm.value)
                    .subscribe(data => {
                      if(data.success === false) {
                        if(data.errcode) {
                        this.authService.logout();
                        this.router.navigate(['/login']);
                        }
                        this.toastrService.error(data.message);
                      } else {
                        this.toastrService.success(data.message);
                        let theUser: any = JSON.parse(localStorage.getItem('currentUser'));
                        theUser.user.firstname = this.profileForm.get('firstname').value;
                        localStorage.setItem('currentUser', JSON.stringify(theUser));
                      }
                    });
  }

}
