import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompareService } from '../services/compare.service';

@Injectable({ providedIn: 'root' })
export class CompareGuard implements CanActivate {
  constructor(
    private compareService: CompareService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean | UrlTree {
    const count = this.compareService.getAll().length;
    if (count >= 2) {
      return true;
    }
    this.snackBar.open('Моля, изберете поне 2 продукта за сравнение.', 'OK', { duration: 2000 });
    return this.router.parseUrl('/products/1');
  }
}
