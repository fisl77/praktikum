import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:3000/admin/events';

  constructor(private http: HttpClient) {}

  getEvents() {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }
}
