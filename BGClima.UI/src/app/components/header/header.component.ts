import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuOpen = false;

  constructor() {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onSearch() {
    // Тук може да отворите search modal или да навигирате към search страница
    alert('Търсене!');
  }

  onLocation() {
    // Тук може да отворите карта или да навигирате към контакти
    alert('Локация!');
  }

  onPhone() {
    // Тук може да стартирате обаждане или да покажете телефонен номер
    window.location.href = 'tel:042638248';
  }
}
