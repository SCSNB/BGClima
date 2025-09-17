import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner, BannerType } from '../models/banner.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface BannerDto {
  id?: number;
  name: string;
  imageUrl: string;
  targetUrl?: string;
  displayOrder: number;
  isActive: boolean;
  type: BannerType;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/api/v1/Banners`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getBanners(): Observable<BannerDto[]> {
    return this.http.get<BannerDto[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getBanner(id: number): Observable<BannerDto> {
    return this.http.get<BannerDto>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createBanner(banner: Omit<BannerDto, 'id'>): Observable<BannerDto> {
    return this.http.post<BannerDto>(this.apiUrl, banner, {
      headers: this.getAuthHeaders()
    });
  }

  updateBanner(id: number, banner: Partial<BannerDto>): Observable<BannerDto> {
    return this.http.put<BannerDto>(`${this.apiUrl}/${id}`, banner, {
      headers: this.getAuthHeaders()
    });
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
