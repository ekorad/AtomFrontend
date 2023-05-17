import { Observable } from 'rxjs';
import { Review } from './../models/review';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }

  addReview(review: Review): Observable<unknown> {
    return this.http.post('http://localhost:8080/review/add', review);
  }

}
