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
import { ProfilaktikaComponent } from './components/profilaktika/profilaktika.component';
import { ServizComponent } from './components/serviz/serviz.component';
import { ProductListComponent } from './components/admin/product-list.component';
import { DashboardHomeComponent } from './components/admin/dashboard-home.component';
import { BannersComponent } from './components/admin/banners/banners.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';

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
  { path: 'profilaktika', component: ProfilaktikaComponent },
  { path: 'serviz', component: ServizComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  // Redirect empty path to home
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Catch-all route for any undefined routes
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
