import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobileSearchVisible = false;

  title = 'BGClima';
  isAuthenticated = false;
  isAdmin = false;
  currentUrl: string = '';
  
  // Mock products data
  products = [
    {
      id: 1,
      name: 'Соларен панел NIPPON 300W',
      price: 1200,
      description: 'Висококачествен соларен панел с ефективност 22%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 2,
      name: 'Соларен панел NIPPON 400W',
      price: 1450,
      description: 'Висококачествен соларен панел с ефективност 24%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 3,
      name: 'Соларен панел NIPPON 500W',
      price: 1800,
      description: 'Висококачествен соларен панел с ефективност 26%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 4,
      name: 'Соларен панел NIPPON 600W',
      price: 2100,
      description: 'Висококачествен соларен панел с ефективност 28%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    },
    {
      id: 5,
      name: 'Соларен панел NIPPON 700W',
      price: 2500,
      description: 'Висококачествен соларен панел с ефективност 30%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    },
    {
      id: 6,
      name: 'Соларен панел NIPPON 800W',
      price: 2900,
      description: 'Висококачествен соларен панел с ефективност 32%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Subscribe to router events to keep track of the current URL
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      console.log('Current URL:', this.currentUrl);
      // Ensure page scrolls to top on every navigation (desktop and mobile)
      try {
        // Scroll window
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        // Scroll Angular Material content container if it handles its own scrolling
        const content = document.querySelector('.mat-sidenav-content') as HTMLElement | null;
        if (content) {
          content.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      } catch (_) {
        // no-op
      }
    });
  }

  toggleMobileSearch(): void {
    this.isMobileSearchVisible = !this.isMobileSearchVisible;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
  }
  
  // Check if the current route is admin or login
  isAdminOrLoginRoute(): boolean {
    return this.currentUrl.includes('/admin') || this.currentUrl.includes('/login');
  }
}
