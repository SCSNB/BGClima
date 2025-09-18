import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = environment.production ? '/api' : `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  uploadSingleFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = this.authService.getToken();
      let headers = new HttpHeaders();
      debugger;
      
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      this.http.post<{ imageUrl: string }>(`${this.apiUrl}/image/upload`, formData, {
        headers: headers,
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
  
  // Get the auth token
  const token = this.authService.getToken();
  let headers = new HttpHeaders();
  
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Make the DELETE request with auth headers
  return this.http.delete(url, { 
    headers: headers,
    observe: 'response' 
  }).pipe(
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
}
