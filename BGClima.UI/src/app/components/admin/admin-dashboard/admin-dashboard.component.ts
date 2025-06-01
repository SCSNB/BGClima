import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('AdminDashboardComponent initialized');
    console.log('Current user:', this.authService.currentUserValue);
    
    if (!this.authService.isAuthenticated()) {
      console.log('User is not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isAdmin()) {
      console.log('User is not an admin, redirecting to home');
      this.router.navigate(['/']);
      return;
    }
    
    this.username = this.authService.currentUserValue?.username || 'Admin';
    console.log('Username set to:', this.username);
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
  }
} 