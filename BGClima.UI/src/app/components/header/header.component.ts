import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompareService } from 'src/app/services/compare.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuOpen = false;
  compareCount$: Observable<number>;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private compareService: CompareService
  ) {
    this.compareCount$ = this.compareService.count$;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onSearch(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }
    // Navigate to search results page with the search term as a query parameter
    this.router.navigate(['/search'], { queryParams: { q: searchTerm } });
  }

  onLocation() {
    // Тук може да отворите карта или да навигирате към контакти
    alert('Локация!');
  }

  onPhone() {
    // Тук може да стартирате обаждане или да покажете телефонен номер
    window.location.href = 'tel:042638248';
  }

  goToCompare() {
    // Навигира директно; CompareGuard ще валидира минималния брой продукти
    this.router.navigate(['/compare']);
  }
}
