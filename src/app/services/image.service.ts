import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }

  getImageForId(id: number): Observable<Blob> {
    return this.http.get('http://localhost:8080/products/image?id=' + id, { responseType: 'blob' });
  }

  addImageForId(file: File, id: number): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const options = {
      params: new HttpParams().set('id', id + '')
    };
    return this.http.post('http://localhost:8080/products/image/upload', formData, options);
  }

}
