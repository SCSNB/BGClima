import { Component, OnInit, OnDestroy } from '@angular/core';
import { BannerService } from '../../services/banner.service';
import { Banner } from '../../models/banner.model';

interface Slide {
  title: string;
  image: string | null;
  link?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  slides: Slide[] = [];
  currentSlide = 0;
  slideInterval: any;
  loading = true;

  constructor(private bannerService: BannerService) {}

  ngOnInit() {
    this.loadBanners();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  loadBanners() {
    this.bannerService.getBanners().subscribe({
      next: (banners) => {
        // Filter active banners and map to slides
        this.slides = banners
          .filter(banner => banner.isActive)
          .map(banner => ({
            title: banner.name,
            image: banner.imageUrl,
            link: banner.targetUrl || '#'
          }));
        
        this.loading = false;
        if (this.slides.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        console.error('Error loading banners:', error);
        this.loading = false;
      }
    });
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  selectSlide(index: number) {
    if (this.slides.length === 0) return;
    
    // Handle wrap-around for previous/next buttons
    if (index < 0) {
      this.currentSlide = this.slides.length - 1;
    } else if (index >= this.slides.length) {
      this.currentSlide = 0;
    } else {
      this.currentSlide = index;
    }
    
    // Reset the auto-slide timer when manually changing slides
    this.resetAutoSlide();
  }
  
  private resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
