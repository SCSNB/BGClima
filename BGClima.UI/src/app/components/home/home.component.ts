import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  slides = [
    {
      title: 'Ново предложение 1',
      image: 'assets/hero/7-slide.jpg',
      link: '#'
    },
    {
      title: 'Ново предложение 2',
      image: 'assets/hero/8-slide.jpg',
      link: '#'
    },
    {
      title: 'Ново предложение 3',
      image: 'assets/hero/9-slide.jpg',
      link: '#'
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
