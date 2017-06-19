import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../auth/authservice.service';
import { ToastrService } from 'common/toastr.service';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(private authService: AuthService,
             private router: Router,
             private toastr: ToastrService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLoggedIn(state.url);    
  }

  checkLoggedIn(url: string): boolean {
    if(this.authService.isLoggedIn()) {
      return true;
    } else {
      this.toastr.info('Please log in to access this page');
      this.router.navigate(['/login']);
      return false;
    }


  }

}
