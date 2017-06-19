import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/throw';

import { IUser } from '../user/user';

@Injectable()
export class AuthService {

  public currentUser: IUser;
  domain: string = 'http://localhost:8080';

  jwtToken: string;

  constructor(private http: Http) {
    const theUser: any = JSON.parse(localStorage.getItem('currentUser'));
    if(theUser) {
      console.log("JWTTT ", theUser);
      this.jwtToken = theUser;
    }
   }

  login(oUser) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers});

    return this.http.post(this.domain + '/login/login', oUser, options)
              .do((response: Response) => {
                console.log("Response ", response);
                if(response.json().success) {
                  this.currentUser = <IUser>response.json().message;
                  let userObj: any = {};
                  userObj.user = response.json().message;
                  userObj.token = response.json().token;
                  console.log("User Object ", userObj)
                  localStorage.setItem('currentUser', JSON.stringify(userObj));
                }
                response.json();
              })
              .catch(this.handleError);
  }

  isLoggedIn(): boolean {
    try {
      const theUser: any = localStorage.getItem('currentUser');
      //console.log("Console Log User", theUser);
      if(theUser) {
        this.currentUser = theUser.user;
      }
    } catch(e) {
      return false;
    }
    return !!this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    //localStorage.clear();

  }

  register(oUser) {
    return this.http.post(this.domain + '/login/register', oUser)              
               .map((res: Response) => res.json())
               .catch(this.handleError);
  }

  getUser(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `${this.jwtToken}`);
    let options = new RequestOptions({ headers: headers });
    console.log("URL ", this.domain + `/login/user/${userId}`);
    return this.http.get(this.domain + `/login/user/${userId}`, options)              
              .map((response: Response) => {
                console.log("ResponseGet ", response.json());                
                response.json().data
              })              
              .catch(this.handleError);
  }           

  updateUser(userId, oUser) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `${this.jwtToken}`);
    let options = new RequestOptions({ headers: headers });
    return this.http.put(this.domain + `/login/user/${userId}`, JSON.stringify(oUser), options)
                    .map((response: Response) => response.json())
                    .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || 'server-error');
  }

}
