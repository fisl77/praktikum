import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private apiUrl = '/discord-bot/allQuestionnaires'; // <-- ohne localhost

  constructor(private http: HttpClient) {}

  getAllSurveys() {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }
}
