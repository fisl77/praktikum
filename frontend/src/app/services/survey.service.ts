import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../api.endpoints';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  constructor(private http: HttpClient) {}

  startSurvey(payload: any): Observable<any> {
    return this.http.post(ApiEndpoints.START_SURVEY, payload, { withCredentials: true });
  }

  endSurvey(payload: any): Observable<any> {
    return this.http.post(ApiEndpoints.END_SURVEY, payload, { withCredentials: true });
  }

  getAllSurveys(): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ALL_SURVEYS, { withCredentials: true });
  }

  getSurveyResults(questionnaireID: number): Observable<any> {
    return this.http.get(ApiEndpoints.SURVEY_RESULTS(questionnaireID), { withCredentials: true });
  }
}
