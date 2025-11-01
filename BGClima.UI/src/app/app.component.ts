import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { CompareService } from './services/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchService, SearchResult } from './services/search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobileSearchVisible = false;
  compareCount$!: Observable<number>;

  title = 'BGClima';
  isAuthenticated = false;
  isAdmin = false;
  currentUrl: string = '';
  
  // Search functionality
  searchQuery = '';
  searchResults: SearchResult[] = [];
  isSearchDropdownVisible = false;
  private searchSubject = new Subject<string>();
  
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
    private router: Router,
    private compareService: CompareService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {
    // Initialize search subscription
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchService.searchProducts(query))
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearchDropdownVisible = results.length > 0;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
        this.isSearchDropdownVisible = false;
      }
    });
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
      // Close mobile sidenav after navigation so the panel does not remain open
      try {
        if (this.sidenav && this.sidenav.opened) {
          this.sidenav.close();
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
    // сравнение: брояч за баджа в хедъра
    this.compareCount$ = this.compareService.count$;
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
    });

    // Setup search functionality
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchService.searchProducts(query))
    ).subscribe(results => {
      this.searchResults = results;
      this.isSearchDropdownVisible = results.length > 0;
    });
  }

  logout(): void {
    this.authService.logout();
  }
  
  // Check if the current route is admin or login
  isAdminOrLoginRoute(): boolean {
    return this.currentUrl.includes('/admin') || this.currentUrl.includes('/login');
  }

  // Навигация към сравнение (валидацията е в CompareGuard)
  goToCompare(): void {
    this.router.navigate(['/compare']);
  }

  // Search functionality methods
  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onSearchFocus(): void {
    if (this.searchQuery && this.searchResults.length > 0) {
      this.isSearchDropdownVisible = true;
    }
  }

  onSearchBlur(): void {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      this.isSearchDropdownVisible = false;
    }, 200);
  }

  selectSearchResult(result: SearchResult): void {
    this.router.navigate(['/product', result.id]);
    this.isSearchDropdownVisible = false;
    this.searchQuery = '';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearchDropdownVisible = false;
  }
}
