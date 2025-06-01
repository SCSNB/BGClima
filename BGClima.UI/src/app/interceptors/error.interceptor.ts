import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.error('HTTP Error:', err);
        
        if (err.status === 401) {
          // Auto logout if 401 response returned from API
          console.log('Unauthorized error, logging out');
          this.authService.logout();
        }
        
        const error = err.error?.message || err.statusText || 'Unknown error';
        return throwError(() => new Error(error));
      })
    );
  }
} 