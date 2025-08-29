import { Component, OnInit } from '@angular/core';
import { BannerService, BannerDto } from '../../services/banner.service';
import { BannerType } from '../../models/banner.model';

@Component({
  selector: 'app-promo-banners',
  templateUrl: './promo-banners.component.html',
  styleUrls: ['./promo-banners.component.scss']
})
export class PromoBannersComponent implements OnInit {
  loading = true;
  error: string | null = null;
  BannerType = BannerType;

  // Banner type mappings
  mainLeftBanner: BannerDto | null = null;
  topRightBanner: BannerDto | null = null;
  middleRightBanner: BannerDto | null = null;
  bottomRightBanner: BannerDto | null = null;

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading = true;
    this.bannerService.getBanners().subscribe({
      next: (banners) => {
        // Filter out hero slider banners and only get active banners
        const activeBanners = banners.filter(banner => 
          banner.type !== BannerType.HeroSlider && banner.isActive
        );
        
        // Sort banners by displayOrder
        activeBanners.sort((a, b) => a.displayOrder - b.displayOrder);
        
        // Assign banners to their respective positions
        this.mainLeftBanner = activeBanners.find(b => b.type === BannerType.MainLeft) || null;
        this.topRightBanner = activeBanners.find(b => b.type === BannerType.TopRight) || null;
        this.middleRightBanner = activeBanners.find(b => b.type === BannerType.MiddleRight) || null;
        this.bottomRightBanner = activeBanners.find(b => b.type === BannerType.BottomRight) || null;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promo banners:', error);
        this.error = 'Грешка при зареждане на банерите';
        this.loading = false;
      }
    });
  }

  // Helper to check if we have any banners to show
  get hasBanners(): boolean {
    return !!(this.mainLeftBanner || this.topRightBanner || 
             this.middleRightBanner || this.bottomRightBanner);
  }
}
