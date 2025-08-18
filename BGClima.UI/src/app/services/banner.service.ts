import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner, BannerType } from '../models/banner.model';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  getBanners(): Observable<BannerDto[]> {
    return this.http.get<BannerDto[]>(this.apiUrl);
  }

  getBanner(id: number): Observable<BannerDto> {
    return this.http.get<BannerDto>(`${this.apiUrl}/${id}`);
  }

  createBanner(banner: Omit<BannerDto, 'id'>): Observable<BannerDto> {
    return this.http.post<BannerDto>(this.apiUrl, banner);
  }

  updateBanner(id: number, banner: Partial<BannerDto>): Observable<BannerDto> {
    return this.http.put<BannerDto>(`${this.apiUrl}/${id}`, banner);
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
