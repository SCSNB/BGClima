import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Banner, BannerType } from '../../../../app/models/banner.model';
import { BannerService } from '../../../../app/services/banner.service';
import { BannerDialogComponent } from './banner-dialog/banner-dialog.component';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit, AfterViewInit {
  banners: Banner[] = [];
  loading = true;
  
  // Table properties
  displayedColumns: string[] = ['position', 'title', 'image', 'status', 'actions'];
  dataSource: MatTableDataSource<Banner> = new MatTableDataSource<Banner>([]);
  
  // Sort and paginator
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Filter properties
  filterValue = '';
  selectedType = -1; // -1 means all types
  
  // Banner positions
  bannerPositions = [
    { value: 0, viewValue: 'Главен слайдер' },
    { value: 1, viewValue: 'Голям банер (ляво)' },
    { value: 2, viewValue: 'Малък банер (горе дясно)' },
    { value: 3, viewValue: 'Малък банер (среда дясно)' },
    { value: 4, viewValue: 'Малък банер (долу дясно)' },
  ];

  constructor(
    private bannerService: BannerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

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

  deleteBanner(id: number): void {
    if (confirm('Сигурни ли сте, че искате да изтриете този банер?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: (): void => {
          this.snackBar.open('Банерът беше изтрит успешно', 'Затвори', { duration: 3000 });
          this.loadBanners();
        },
        error: (error: any): void => {
          console.error('Error deleting banner:', error);
          this.snackBar.open('Грешка при изтриване на банер', 'Затвори', { duration: 3000 });
        }
      });
    }
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
