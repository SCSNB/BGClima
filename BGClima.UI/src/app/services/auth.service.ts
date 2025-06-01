import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'api/auth'; // Replace with your actual API URL
  private readonly AUTH_COOKIE = 'bgclima_auth';

  constructor(private http: HttpClient, private router: Router) {
    const user = this.getUserFromCookie();
    console.log('Initial user from cookie:', user);
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getUserFromCookie(): User | null {
    const cookieValue = this.getCookie(this.AUTH_COOKIE);
    console.log('Cookie value:', cookieValue);
    if (cookieValue) {
      try {
        return JSON.parse(cookieValue);
      } catch (e) {
        console.error('Error parsing user from cookie:', e);
        this.deleteCookie(this.AUTH_COOKIE);
        return null;
      }
    }
    return null;
  }

  private setCookie(name: string, value: string, days: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    const cookieValue = `${name}=${value};${expires};path=/;SameSite=Strict;${location.protocol === 'https:' ? 'Secure;' : ''}`;
    document.cookie = cookieValue;
    console.log('Setting cookie:', cookieValue);
  }

  private getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    console.log('Cookie not found:', name);
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;`;
    console.log('Deleted cookie:', name);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<User> {
    console.log('Login attempt with:', loginRequest.username);
    
    // For demo purposes, we'll simulate a successful login
    // In a real application, replace this with an actual API call
    if (loginRequest.username === 'admin' && loginRequest.password === 'admin') {
      const mockResponse: LoginResponse = {
        id: '1',
        username: 'admin',  
        email: 'admin@bgclima.com',
        roles: ['ADMIN'],
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      };
      
      console.log('Login successful, user:', mockResponse);
      
      return of(mockResponse).pipe(
        tap(response => {
          const userJson = JSON.stringify(response);
          console.log('Storing user in cookie:', userJson);
          this.setCookie(this.AUTH_COOKIE, userJson);
          this.currentUserSubject.next(response);
        })
      );
    }
    
    // In a real application, you would use this HTTP call instead:
    // return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
    //   .pipe(
    //     map(response => {
    //       this.setCookie(this.AUTH_COOKIE, JSON.stringify(response));
    //       this.currentUserSubject.next(response);
    //       return response;
    //     })
    //   );
    
    // For demo, return error for invalid credentials
    console.log('Login failed: Invalid credentials');
    return throwError(() => new Error('Invalid username or password'));
  }

  logout(): void {
    console.log('Logging out');
    this.deleteCookie(this.AUTH_COOKIE);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    const isAuth = !!user && !!user.token;
    console.log('isAuthenticated check:', isAuth, 'User:', user);
    return isAuth;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    const hasRole = !!user && user.roles.includes(role);
    console.log(`hasRole check for ${role}:`, hasRole);
    return hasRole;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }
} 