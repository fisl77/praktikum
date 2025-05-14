import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private apiUrl = 'http://localhost:3000/discord-bot/allQuestionnaires';

  constructor(private http: HttpClient) {}

  getAllSurveys() {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }
}
