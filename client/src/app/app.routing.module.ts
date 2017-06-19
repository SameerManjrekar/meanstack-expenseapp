import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
import { LogoutComponent } from './components/logout/logout.component';
import { HomeComponent } from './components/home/home.component';
import { ReportComponent } from './components/report/report.component';
import { AuthguardService } from './auth/authguard.service';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'about', component: AboutComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'changepassword', component: ChangepasswordComponent, canActivate: [AuthguardService] },
    { path: 'report', component: ReportComponent },
    { path: 'logout', component: LogoutComponent },
    { path: '', component: HomeComponent },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
]

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(routes)
    ],
    bootstrap: [],
    providers: [],
    exports: [
        RouterModule
    ]    
})


export class AppRoutingModule { }