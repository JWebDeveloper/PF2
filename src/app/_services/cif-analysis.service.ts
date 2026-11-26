import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
// import { environment } from '../../../environments/environment';
const AUTH_API = environment.apiUrl ;// 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = environment.apiUrl ;// 'https://projectsapi.lpu.in/';
const AUTH_API_LOCALS = environment.apiUrl ;// 'https://projectsapi.lpu.in/';


export interface Instrument {
  instrumentId: string;
  instrumentName: string;
}

export interface Analysis {
  id: string;
  analysisType: string;
  instrumentId: string;
  createdBy: string;
  createdOn: Date;
  isActive: boolean;
}

export interface AnalysisPrice {
  recordId: string;
  analysisId: string;
  analysisType: string;
  instrumentId: string;
  instrumentName: string;
  userTypeId: string;
  typeName: string;
  price: string;
  createdOn: Date;
  isActive: boolean;
}

export interface ApiResponse {
  msg: string;
  returnId: number;
}

export interface CrudPayload {
  action: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})



export class CIFAnalysisService {
  private apiUrl = `${environment.apiUrl}/api/LpuCIF/cifanalysis`;
  private authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpbk5hbWUiOiJDSUYiLCJuYmYiOjE3NzA4Njk4NjMsImV4cCI6MTgwMjQwNTg2MywiaWF0IjoxNzcwODY5ODYzLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI1LyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxMjUvIn0.x7GIMap1-qxhY9UDL3HOluXig80_PjVZ5HEcGjZ_Hao';

  constructor(private http: HttpClient, private storageService: StorageService) { }

  /**
   * Get all instruments
   */
  getInstrumentsss(): Observable<Instrument[]> {
    return this.http.get<Instrument[]>(`${this.apiUrl}/instruments`);
  }

    getInstruments(): Observable<any> {
      let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.authToken)
        .set('Content-Type', 'application/json');
      return this.http.get<Instrument[]>( AUTH_API +'api/LpuCIF/GetAllInstruments',
        { headers }
      );
    }

  getAnalyses(instrumentId: string): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(
      `${this.apiUrl}/analyses/${instrumentId}`
    );
  }


  getAnalysisTypes(instrumentId: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/analysistypes/${instrumentId}`
    );
  }


  getAnalysisPrices(instrumentId: string): Observable<AnalysisPrice[]> {
    return this.http.get<AnalysisPrice[]>(
      `${this.apiUrl}/prices/${instrumentId}`
    );
  }


  crudAnalysis(payload: CrudPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/crud-analysis`,
      payload
    );
  }


  deleteAnalysis(recordId: string, userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/crud-analysis`,
      {
        action: 'DeleteAnalysis',
        recordId: recordId,
        userId: userId
      }
    );
  }


  crudAnalysisPrice(payload: CrudPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/crud-price`,
      payload
    );
  }

  deleteAnalysisPrice(recordId: string, userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/crud-price`,
      {
        action: 'DeleteAnalysisPrice',
        recordId: recordId,
        userId: userId
      }
    );
  }
}
