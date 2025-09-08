import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ContactsComponent } from './components/contacts/contacts.component';
import { HomeComponent } from './components/home/home.component';
import { AboutCompanyComponent } from './components/about-company/about-company.component';
import { MainActivityComponent } from './components/main-activity/main-activity.component';
import { ResourceComponent } from './components/resource/resource.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ConsultingComponent } from './components/consulting/consulting.component';
import { InstallationComponent } from './components/installation/installation.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { ServizComponent } from './components/serviz/serviz.component';
import { ProductListComponent } from './components/admin/product-list.component';
import { DashboardHomeComponent } from './components/admin/dashboard-home.component';
import { BannersComponent } from './components/admin/banners/banners.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { VentilationDesignComponent } from './components/ventilation-design/ventilation-design.component';
import { VentilationInstallationComponent } from './components/ventilation-installation/ventilation-installation.component';
import { ProductCategoryComponent } from './components/product-category/product-category.component';
import { PromoProductsComponent } from './pages/promo-products/promo-products.component';
import { CompareComponent } from './pages/compare/compare.component';
import { CalculatorComponent } from './pages/calculator/calculator.component';
import { CompareGuard } from './guards/compare.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'product', component: ProductListComponent },
      { path: 'banners', component: BannersComponent }
    ]
  },
  { path: 'contacts', component: ContactsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about-company', component: AboutCompanyComponent },
  { path: 'main-activity', component: MainActivityComponent },
  { path: 'resource', component: ResourceComponent },
  { path: 'certificates', component: CertificatesComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'consulting', component: ConsultingComponent },
  { path: 'installation', component: InstallationComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'serviz', component: ServizComponent },
  { path: 'ventilation-design', component: VentilationDesignComponent },
  { path: 'ventilation-installation', component: VentilationInstallationComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'products/:category', component: ProductCategoryComponent },
  { path: 'promo', component: PromoProductsComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: 'compare', component: CompareComponent, canActivate: [CompareGuard] },
  // Redirect empty path to home
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Catch-all route for any undefined routes
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
