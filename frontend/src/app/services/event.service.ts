import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = '/admin/events'; // <-- ohne localhost

  constructor(private http: HttpClient) {}

  getEvents() {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }
  getAllEventsDetailed() {
    return this.http.get<any[]>('/admin/events', { withCredentials: true });
  }
}
