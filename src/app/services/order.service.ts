import { Observable } from 'rxjs';
import { Order } from './../models/order';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>('http://localhost:8080/orders');
  }

  addNewOrder(order: Order): Observable<unknown> {
    return this.http.post('http://localhost:8080/orders/add', order);
  }

  updateOrder(id: number, order: Order): Observable<unknown> {
    const options = {
      params: new HttpParams().set('id', id + '')
    };
    return this.http.put('http://localhost:8080/orders/update', order, options);
  }

  deleteOrders(ids: number[]): Observable<unknown> {
    const idStr = ids.join(',');
    const options = {
      params: new HttpParams().set('IdsAtOnce', idStr)
    };
    return this.http.delete('http://localhost:8080/orders/delete', options);
  }

}
