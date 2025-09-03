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
import { VentilationDesignComponent } from './components/ventilation-design/ventilation-design.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { FormatLabelPipe } from './shared/pipes/format-label.pipe';
import { RouterModule } from '@angular/router';

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
import { ServizComponent } from './components/serviz/serviz.component';
import { BannersComponent } from './components/admin/banners/banners.component';
import { BannerDialogComponent } from './components/admin/banners/banner-dialog/banner-dialog.component';
import { PromoBannersComponent } from './components/promo-banners/promo-banners.component';
import { VentilationInstallationComponent } from './components/ventilation-installation/ventilation-installation.component';
import { ProductCategoryComponent } from './components/product-category/product-category.component';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

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
    ServizComponent,
    BannersComponent,
    BannerDialogComponent,
    PromoBannersComponent,
    VentilationDesignComponent,
    VentilationInstallationComponent,
    ProductCategoryComponent,
    ProductFiltersComponent,
    MaintenanceComponent,
    ProductDetailsComponent,
    FormatLabelPipe
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    MaterialModule,
    CommonModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
