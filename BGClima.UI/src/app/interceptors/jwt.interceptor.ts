import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth header with jwt if user is logged in and request is to the api url
    const token = this.authService.getToken();
    const isApiUrl = request.url.startsWith('api/');
    
    console.log('JWT Interceptor - URL:', request.url);
    console.log('JWT Interceptor - Token exists:', !!token);
    console.log('JWT Interceptor - Is API URL:', isApiUrl);

    if (token && isApiUrl) {
      console.log('JWT Interceptor - Adding Authorization header');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
} 