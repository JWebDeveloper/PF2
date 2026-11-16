import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { EventModel } from '../_model/Event.model';
import { environment } from 'src/environments/environment';
import { xmlBookingSlots } from './xmlBookingSlots.model';

const BASE_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class LpuCIFWebServiceNewService {
  baseUrl = BASE_URL;
  FileData: string;
  fileName: string;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  /**
   * Centralized error handling method for all API calls.
   * Returns a safe fallback value to prevent UI errors.
   * @param operation - The name of the API operation that failed
   * @param fallbackValue - The default value to return on error
   * @returns An Observable with the fallback value
   */
  private handleError<T>(
    operation: string,
    fallbackValue: T,
  ): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      // Return the fallback value with user-friendly error message to prevent UI crashes
      const userFriendlyMessage = '';

      // For array fallbacks, return the empty array with error flag
      if (Array.isArray(fallbackValue)) {
        return of({
          data: fallbackValue,
          error: true,
          message: userFriendlyMessage,
        } as unknown as T);
      }
      // For null/nothing fallbacks, return error response object
      if (fallbackValue === null || fallbackValue === undefined) {
        return of({
          error: true,
          message: userFriendlyMessage,
        } as unknown as T);
      }
      return of({
        ...fallbackValue,
        error: true,
        message: userFriendlyMessage,
      } as unknown as T);
    };
  }

  folderUrl = 'https://files.lpu.in/umsweb/webftp/CIFDocuments/';

  getFolderUrl(): string {
    return this.folderUrl;
  }

  CIFGetUserDetails(UserEmailId: string): Observable<any> {
    return this.http.get<any>(
      BASE_URL +
        `api/LpuCIFHeaderFooter/CIFGetUserDetails?EmailId=` +
        UserEmailId,
    );
  }

  CIFUpdateUserDetails(UpdateUserData: FormData): Observable<any> {
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/CIFChangePasswordDetails',
      UpdateUserData,
    );
  }

  // home page
  getAllInstruments(): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}api/LpuCIFHeaderFooter/GetAllInstruments`,
    );
  }
  GetAllInstrumentsData(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/LpuCIFHeaderFooter/GetAllInstruments')
      .pipe(catchError(this.handleError('GetAllInstrumentsData', [])));
  }
  // our instrument page
  fetchSpecifications(): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}api/LpuCIFHeaderFooter/GetAllSpecifications`,
    );
  }
  getLpuHeader(): Observable<any> {
    return this.http.get(BASE_URL + 'api/LpuCIFHeaderFooter/GetLpuHeader');
  }

  getLpuFooter(): Observable<any> {
    return this.http.get(BASE_URL + 'api/LpuCIFHeaderFooter/GetLpuFooter');
  }

  GetChargesDetails(Id: any): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}api/LpuCIFHeaderFooter/GetInstrumentChargesDetails?InstrumentID=` +
        Id,
    );
  }

  // New Logic for Login Page
  GetAuthoriseUserData(loginData: FormData): Observable<any> {
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/LoginExternaluser',
      loginData,
      // BASE_URL + 'api/LpuCIFHeaderFooter/GetUserDataIdWise', loginData
    );
  }

  // New Logic for Internal user login
  NewUserRecord(newUserData: FormData): Observable<any> {
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/CreateCIFUserAccount',
      newUserData,
    );
  }

  NewUserSignUp(newUserData: FormData): Observable<any> {
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/CIFNewUserSignUpInsert',
      newUserData,
    );
  }

  GetAnalysisData(Id: any, TypeId: any): Observable<any> {
    return this.http.get(
      BASE_URL +
        'api/LpuCIFHeaderFooter/GetAnalysisIdWisePriceDetails?AnalysisId=' +
        Id +
        '&TypeId=' +
        TypeId,
    );
  }

  GetInstrumentsDetails(): Observable<any> {
    return this.http.get(
      BASE_URL + 'api/LpuCIFHeaderFooter/GetInstrumentsDetails',
    );
  }

  GetAllInstruments(): Observable<any> {
    return this.http.get(
      BASE_URL + 'api/LpuCIFHeaderFooter/GetInstrumentsDetails',
    );
  }

  GetAllEventDetails(): Observable<any> {
    return this.http.get(
      BASE_URL + 'api/LpuCIFHeaderFooter/GetAllCifEventDetails',
    );
  }

  GetDuationAndPrice(
    AnalysisId: any,
    UserId: any,
    Duration: string,
  ): Observable<any> {
    return this.http.get(
      BASE_URL +
        `api/LpuCIFHeaderFooter/GetDuationAndPrice?AnalysisId=` +
        AnalysisId +
        `&UserId=` +
        UserId +
        `&Duration=` +
        Duration,
    );
  }

  GetAnalysisDetails(InstrumentId: any): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}api/LpuCIFHeaderFooter/GetInstrumentWiseAnalysisDetails?InstrumentId=` +
        InstrumentId,
    );
  }

  addBookingSlot(newBookingData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http
      .post(BASE_URL + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers })
      .pipe(
        catchError(
          this.handleError('addBookingSlot', {
            success: false,
            message: 'Failed to add booking slot',
          }),
        ),
      );
  }

  InsertNewAnalysis(AnalysisData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(
      BASE_URL + 'api/LpuCIF/CIFInsertNewAnalysis',
      AnalysisData,
      { headers },
    );
  }

  AddCIFBookingDetailsUsingExcelSheet(model: xmlBookingSlots): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/AddCIFBookingDetailsUsingExcelSheet',
      model,
      { headers },
    );
  }
}
