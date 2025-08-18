import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BannerDialogComponent } from './banner-dialog/banner-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { Banner, BannerType } from '../../../../app/models/banner.model';
import { BannerService } from '../../../../app/services/banner.service';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit, AfterViewInit {
  // Table properties
  displayedColumns: string[] = ['id', 'image', 'title', 'position', 'status', 'actions'];
  dataSource: MatTableDataSource<Banner> = new MatTableDataSource<Banner>([]);
  loading = false;
  banners: Banner[] = [];

  // Sort and paginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter properties
  filterValue = '';
  selectedType = -1; // -1 means all types
  
  // Position options for filtering
  bannerPositions = [
    { value: BannerType.HeroSlider, viewValue: 'Главен слайд' },
    { value: BannerType.MainLeft, viewValue: 'Голям банер (ляво)' },
    { value: BannerType.TopRight, viewValue: 'Малък банер (горе дясно)' },
    { value: BannerType.MiddleRight, viewValue: 'Малък банер (среда дясно)' },
    { value: BannerType.BottomRight, viewValue: 'Малък банер (долу дясно)' }
  ];

  // Position class mapping for styling
  private positionClasses: { [key: number]: string } = {
    [BannerType.HeroSlider]: 'hero-slider',
    [BannerType.MainLeft]: 'main-left',
    [BannerType.TopRight]: 'top-right',
    [BannerType.MiddleRight]: 'middle-right',
    [BannerType.BottomRight]: 'bottom-right'
  };

  constructor(
    private bannerService: BannerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  // Get CSS class for position badge
  getPositionClass(type: BannerType): string {
    return this.positionClasses[type] || '';
  }

  // Open dialog to add new banner
  openAddBannerDialog(): void {
    this.addBanner();
  }

  // Open dialog to edit banner
  openEditBannerDialog(banner: Banner): void {
    this.editBanner(banner);
  }

  // Confirm before deleting a banner
  confirmDelete(banner: Banner): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Потвърждение за изтриване',
        message: `Сигурни ли сте, че искате да изтриете банер "${banner.name}"?`,
        confirmText: 'Изтрий',
        cancelText: 'Отказ'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteBanner(banner.id);
      }
    });
  }

  /**
   * Deletes a banner by ID
   * @param id The ID of the banner to delete
   */
  private deleteBanner(id: number): void {
    this.bannerService.deleteBanner(id).subscribe({
      next: () => {
        this.snackBar.open('Банерът е изтрит успешно!', 'Затвори', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.loadBanners();
      },
      error: (error) => {
        console.error('Error deleting banner:', error);
        this.snackBar.open('Грешка при изтриване на банер!', 'Затвори', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    console.log('Loading banners...');
    this.loading = true;
    this.bannerService.getBanners().subscribe({
      next: (banners: Banner[]) => {
        console.log('Banners loaded:', banners);
        // Ensure we have valid banner data
        if (banners && Array.isArray(banners)) {
          this.banners = banners.map(banner => ({
            ...banner,
            // Ensure imageUrl is properly formatted
            imageUrl: banner.imageUrl ? this.getFullImageUrl(banner.imageUrl) : null
          }));
          console.log('Processed banners:', this.banners);
          this.initializeDataSource(this.banners);
        } else {
          console.warn('No banners found or invalid data format:', banners);
          this.banners = [];
          this.initializeDataSource([]);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading banners:', error);
        this.snackBar.open('Грешка при зареждане на банери: ' + (error.message || 'Неизвестна грешка'), 'Затвори', { duration: 5000 });
        this.loading = false;
        this.banners = [];
        this.initializeDataSource([]);
      }
    });
  }

  // Helper method to ensure image URLs are complete
  private getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    // Otherwise, construct the full URL
    const baseUrl = 'https://localhost:5001'; // Update this with your API base URL
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  
  private initializeDataSource(banners: Banner[]): void {
    this.dataSource = new MatTableDataSource(banners);
    
    // Set up custom filter predicate for filtering by name and type
    this.dataSource.filterPredicate = (data: Banner, filter: string) => {
      const searchStr = JSON.parse(filter);
      const matchesSearch = data.name.toLowerCase().includes(searchStr.searchText);
      const matchesType = searchStr.selectedType === -1 || data.type === searchStr.selectedType;
      return matchesSearch && matchesType;
    };
    
    // Set up sorting
    this.dataSource.sortData = (data: Banner[], sort: Sort): Banner[] => {
      if (!sort.active || sort.direction === '') {
        return data;
      }

      return data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'position': 
            const posA = this.getBannerPosition(a.type);
            const posB = this.getBannerPosition(b.type);
            return this.compare(posA, posB, isAsc);
          case 'title': 
            return this.compare(a.name, b.name, isAsc);
          case 'status':
            return this.compare(a.isActive, b.isActive, isAsc);
          default: 
            return 0;
        }
      });
    };
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.toLowerCase();
    this.updateFilter();
  }
  
  applyTypeFilter(type: number): void {
    this.selectedType = type;
    this.updateFilter();
  }
  
  private updateFilter(): void {
    if (this.dataSource) {
      this.dataSource.filter = JSON.stringify({
        searchText: this.filterValue,
        selectedType: this.selectedType
      });
      
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  getBannerPosition(type: number): string {
    const position = this.bannerPositions.find(p => p.value === type);
    return position ? position.viewValue : 'Неизвестна позиция';
  }

  toggleBannerStatus(banner: any): void {
    banner.isActive = !banner.isActive;
    // Here you would typically call your banner service to update the status
    this.bannerService.updateBanner(banner.id, { isActive: banner.isActive }).subscribe({
      next: () => {
        this.snackBar.open('Статусът на банера е обновен', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating banner status:', error);
        this.snackBar.open('Грешка при обновяване на статуса', 'Затвори', { duration: 3000 });
        // Revert the change on error
        banner.isActive = !banner.isActive;
      }
    });
  }

  /**
   * Opens a dialog to add a new banner
   */
  addBanner(): void {
    const dialogRef = this.dialog.open(BannerDialogComponent, {
      width: '600px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBanners();
      }
    });
  }

  /**
   * Opens a dialog to edit an existing banner
   * @param banner The banner to edit
   */
  editBanner(banner: Banner): void {
    const dialogRef = this.dialog.open(BannerDialogComponent, {
      width: '600px',
      data: { isEdit: true, banner: { ...banner } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBanners();
      }
    });
  }


  /**
   * Compares two values for sorting purposes
   * @param a First value to compare
   * @param b Second value to compare
   * @param isAsc Whether the sort is in ascending order
   * @returns -1 if a < b, 0 if a === b, 1 if a > b (multiplied by -1 if descending)
   */
  private compare(a: any, b: any, isAsc: boolean): number {
    if (a === b) return 0;
    if (a === null || a === undefined) return isAsc ? -1 : 1;
    if (b === null || b === undefined) return isAsc ? 1 : -1;
    
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b) * (isAsc ? 1 : -1);
    }
    
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
