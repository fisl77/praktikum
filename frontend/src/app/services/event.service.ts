import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../api.endpoints';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) {
  }

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ADMIN_EVENTS, {withCredentials: true});
  }

  getAllEventsDetailed(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ADMIN_EVENTS, {withCredentials: true});
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(ApiEndpoints.ADMIN_EVENT, eventData, {withCredentials: true});
  }

  updateEvent(eventData: any): Observable<any> {
    return this.http.patch(ApiEndpoints.ADMIN_UPDATE_EVENT, eventData, {withCredentials: true});
  }


  getEnemies() {
    return this.http.get<any>(ApiEndpoints.ADMIN_ENEMIES, {withCredentials: true});
  }
  createEnemy(eventData: any): Observable<any> {
    return this.http.post(ApiEndpoints.ADMIN_CREATE_ENEMY, eventData, {withCredentials: true});
  }

  getEnemyNames(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ADMIN_ENEMY_NAMES, { withCredentials: true });
  }

  getEnemyTypes(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ADMIN_ENEMY_TYPES, { withCredentials: true });
  }

  getLevels(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ADMIN_LEVELS, { withCredentials: true });}
}
