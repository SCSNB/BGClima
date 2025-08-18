import { Component, OnInit } from '@angular/core';
import { BannerService } from '../../../services/banner.service';
import { Banner, BannerType } from '../../../models/banner.model';

interface PromoBanner {
  image: string | null;
  link: string;
  type: BannerType;
  title: string;
}

@Component({
  selector: 'app-promo-banners',
  templateUrl: './promo-banners.component.html',
  styleUrls: ['./promo-banners.component.scss']
})
export class PromoBannersComponent implements OnInit {
  banners: PromoBanner[] = [];
  loading = true;

  // Map banner types to their positions
  private bannerPositions = {
    [BannerType.MainLeft]: 'large',
    [BannerType.TopRight]: 'top',
    [BannerType.MiddleRight]: 'middle',
    [BannerType.BottomRight]: 'bottom'
  };

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.loadPromoBanners();
  }

  private loadPromoBanners(): void {
    this.bannerService.getBanners().subscribe({
      next: (banners) => {
        // Filter out hero slider banners and inactive banners
        this.banners = banners
          .filter(banner => 
            banner.type !== BannerType.HeroSlider && 
            banner.isActive &&
            this.bannerPositions[banner.type as keyof typeof this.bannerPositions]
          )
          .map(banner => ({
            image: banner.imageUrl,
            link: banner.targetUrl || '#',
            type: banner.type,
            title: banner.name
          }));
          
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promo banners:', error);
        this.loading = false;
      }
    });
  }

  getBannerClass(bannerType: BannerType): string {
    switch (bannerType) {
      case BannerType.MainLeft: return 'large-banner';
      case BannerType.TopRight: return 'top-right-banner';
      case BannerType.MiddleRight: return 'middle-right-banner';
      case BannerType.BottomRight: return 'bottom-right-banner';
      default: return '';
    }
  }
}
