import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ThoughtInput {
  text: string;
  source: string;
  userId: string;
}

interface ReflectResponse {
  input: ThoughtInput;
  emotion: string;
  response: string;
  weightedResonances: any[];
  mood: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5183/api/Thought'; //.NET backend

  constructor(private http: HttpClient) {}

  
  reflect(text: string): Observable<ReflectResponse> {
    const body: ThoughtInput = {
      text,
      source: 'CelesteUI',
      userId: 'Jean'
    };
    return this.http.post<ReflectResponse>(`${this.baseUrl}/reflect`, body);
  }

  interact(user: string, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/interact`, { user, message });
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`);
  }

  getMemory(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/conversation/list`, {
      params: { userId }
    });
  }

  updateConfig(config: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/config`, config);
  }
}
