import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { BannerService } from '../../services/banner.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  totalProducts: number | null = null;
  totalBanners: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    this.fetchCounts();
  }

  private fetchCounts(): void {
    this.loading = true;
    forkJoin({
      stats: this.productService.getAdminStats(),
      banners: this.bannerService.getBanners()
    }).subscribe({
      next: ({ stats, banners }) => {
        this.totalProducts = stats?.totalProducts ?? 0;
        this.totalBanners = banners?.length ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard counts', err);
        this.error = 'Грешка при зареждане на статистиката';
        this.loading = false;
      }
    });
  }
}