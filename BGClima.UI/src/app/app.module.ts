import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { OffersComponent } from './components/offers/offers.component';
import { NewsComponent } from './components/news/news.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { ProductListComponent } from './components/admin/product-list.component';
import { ProductDialogComponent } from './components/admin/product-dialog.component';
import { DashboardHomeComponent } from './components/admin/dashboard-home.component';

// Material Module
import { MaterialModule } from './shared/material.module';

// Services and Interceptors
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtInterceptor, ErrorInterceptor } from './interceptors';
import { ContactsComponent } from './components/contacts/contacts.component';
import { AboutCompanyComponent } from './components/about-company/about-company.component';
import { MainActivityComponent } from './components/main-activity/main-activity.component';
import { ResourceComponent } from './components/resource/resource.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ConsultingComponent } from './components/consulting/consulting.component';
import { InstallationComponent } from './components/installation/installation.component';
import { ProfilaktikaComponent } from './components/profilaktika/profilaktika.component';
import { ServizComponent } from './components/serviz/serviz.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    OffersComponent,
    NewsComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ContactsComponent,
    AboutCompanyComponent,
    MainActivityComponent,
    ResourceComponent,
    CertificatesComponent,
         ProjectsComponent,
     ConsultingComponent,
     ProductListComponent,
     ProductDialogComponent,
 	DashboardHomeComponent,
 	ProfilaktikaComponent,
 	ServizComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
