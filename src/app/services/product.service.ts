import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:8080/products');
  }

  getAllByIds(ids: number[]): Observable<Product[]> {
    const idString = ids.join(',');
    const options = {
      params: new HttpParams().set('IdsAtOnce', idString)
    }
    return this.http.get<Product[]>('http://localhost:8080/products/produse', options);
  }

  getById(id: number): Observable<Product> {
    const options = {
      params: new HttpParams().set('id', id.toString())
    };
    return this.http.get<Product>('http://localhost:8080/products/product', options);
  }

  deleteByIds(ids: number[]): Observable<unknown> {
    const strIds = ids.join(',');
    const options = {
      params: new HttpParams().set('IdsAtOnce', strIds)
    };
    return this.http.delete('http://localhost:8080/products/delete', options);
  }

  addProduct(product: Product): Observable<unknown> {
    return this.http.post('http://localhost:8080/products/add', product);
  }

  updateProduct(product: Product, id: number): Observable<unknown> {
    const options = {
      params: new HttpParams().set('id', id + '')
    };
    return this.http.put('http://localhost:8080/products/update', product, options);
  }

  getProductsAroundAvg(ids: number[]): Observable<Product[]> {
    const idsStr = ids.join(',');
    const options = {
      params: new HttpParams().set('ids', idsStr)
    };
    return this.http.get<Product[]>('http://localhost:8080/products/around-avg', options);
  }

  getMostRatedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:8080/products/most-rated');
  }

  getMostViewedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:8080/products/most-viewed');
  }
}
