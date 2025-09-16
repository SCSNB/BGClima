import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = environment.production ? '/api' : `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  uploadSingleFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post<{ url: string }>(`${this.apiUrl}/image/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: any) => {
          if (event.type === 4) { // HttpEventType.Response
            if (event.body && event.body.imageUrl) {
              resolve(event.body.imageUrl);
            } else {
              reject(new Error('Invalid response from server'));
            }
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.snackBar.open(
            'Грешка при качване на файла. Моля, опитайте отново.',
            'Затвори',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
          reject(error);
        }
      });
    });
  }

  deleteImage(imageId: number): Observable<void> {
    if (!imageId) {
      const error = new Error('Invalid image ID');
      console.error('Image deletion failed:', error);
      this.snackBar.open('Грешка при изтриване на изображението: Невалиден идентификатор', 'Затвори', { duration: 5000 });
      return throwError(() => error);
    }
    
    console.log(`Deleting image with ID: ${imageId}`);
    const url = `${this.apiUrl}/image/${imageId}`;
    
    debugger;
    // Make the DELETE request
    return this.http.delete(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return;
        }
        throw new Error(`Unexpected status code: ${response.status}`);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Image deletion failed:', error);
        let errorMessage = 'Възникна грешка при изтриване на изображението';
    
        if (error.status === 0) {
          errorMessage = 'Грешка при връзка със сървъра. Моля, проверете интернет връзката си.';
        } else if (error.status === 404) {
          errorMessage = 'Изображението не беше намерено на сървъра.';
        } else if (error.status === 403) {
          errorMessage = 'Нямате права да изтриете това изображение.';
        } else if (error.status === 405) {
          errorMessage = 'Методът не е позволен. Моля, опитайте отново или се свържете с администратор.';
        } else if (error.status === 500) {
          errorMessage = 'Сървърна грешка. Моля, опитайте по-късно.';
        }
    
        this.snackBar.open(errorMessage, 'Затвори', { duration: 5000 });
        return throwError(() => error);
      })
    );
  }

  private extractBlobName(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      // Get the last part of the path which contains the blob name
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (e) {
      console.error('Error parsing image URL:', e);
      return null;
    }
  }
}
