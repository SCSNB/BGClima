import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  slides = [
    {
      title: 'СЕРИЯ KMCG-B',
      image: 'assets/hero/kmcg-b.jpg',
      link: '/products/kmcg-b'
    },
    {
      title: 'СЕРИЯ KNCA',
      image: 'assets/hero/knca.jpg',
      link: '/products/knca'
    },
    {
      title: 'СЕРИЯ ECO',
      image: 'assets/hero/eco.jpg',
      link: '/products/eco'
    }
  ];

  currentSlide = 0;
  slideInterval: any;

  ngOnInit() {
    this.startAutoSlide();
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
    this.currentSlide = index;
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
