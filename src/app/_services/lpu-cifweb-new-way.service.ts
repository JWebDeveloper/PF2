import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { EventModel } from '../_model/Event.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

// const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API = 'https://webapi.lpu.in/cif/';
// const AUTH_API = 'https://localhost:7125/';

@Injectable({
  providedIn: 'root'
})

export class LpuCIFWebServiceNewService {
  baseUrl = AUTH_API;
  FileData: string;
  fileName: string;

  constructor(private http: HttpClient, private storageService: StorageService) { }

  /**
   * Centralized error handling method for all API calls.
   * Returns a safe fallback value to prevent UI errors.
   * @param operation - The name of the API operation that failed
   * @param fallbackValue - The default value to return on error
   * @returns An Observable with the fallback value
   */
  private handleError<T>(operation: string, fallbackValue: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      // Return the fallback value with user-friendly error message to prevent UI crashes
      const userFriendlyMessage = '';

      // For array fallbacks, return the empty array with error flag
      if (Array.isArray(fallbackValue)) {
        return of({ data: fallbackValue, error: true, message: userFriendlyMessage } as unknown as T);
      }
      // For null/nothing fallbacks, return error response object
      if (fallbackValue === null || fallbackValue === undefined) {
        return of({ error: true, message: userFriendlyMessage } as unknown as T);
      }
      return of({ ...fallbackValue, error: true, message: userFriendlyMessage } as unknown as T);
    };
  }




  folderUrl = 'https://files.lpu.in/umsweb/webftp/CIFDocuments/';

  getFolderUrl(): string {
    return this.folderUrl;
  }


  CIFGetUserDetails(UserEmailId: string): Observable<any> {
    return this.http.get<any>(AUTH_API + `api/LpuCIFHeaderFooter/CIFGetUserDetails?EmailId=` + UserEmailId,
    )
  }

  CIFUpdateUserDetails(UpdateUserData: FormData): Observable<any> {

    return this.http.post(
      AUTH_API + 'api/LpuCIFHeaderFooter/CIFChangePasswordDetails', UpdateUserData
    )
  }

  // home page  
  getAllInstruments(): Observable<any> {
    return this.http.get<any>(`${AUTH_API}api/LpuCIFHeaderFooter/GetAllInstruments`);
  }
  GetAllInstrumentsData(): Observable<any> {
    return this.http.get(
      AUTH_API + 'api/LpuCIFHeaderFooter/GetAllInstruments',
    ).pipe(catchError(this.handleError('GetAllInstrumentsData', [])));
  }
  // our instrument page 
  fetchSpecifications(): Observable<any> {
    return this.http.get<any>(`${AUTH_API}api/LpuCIFHeaderFooter/GetAllSpecifications`);
  }
  getLpuHeader(): Observable<any> {

    return this.http.get(AUTH_API + 'api/LpuCIFHeaderFooter/GetLpuHeader');
  }

  getLpuFooter(): Observable<any> {

    return this.http.get(AUTH_API + 'api/LpuCIFHeaderFooter/GetLpuFooter');
  }



  GetChargesDetails(Id: any): Observable<any> {
    return this.http.get<any>(`${AUTH_API}api/LpuCIFHeaderFooter/GetInstrumentChargesDetails?InstrumentID=` + Id);
  }




  // New Logic for Login Page
  GetAuthoriseUserData(loginData: FormData): Observable<any> {

    return this.http.post(
      AUTH_API + 'api/LpuCIFHeaderFooter/LoginExternaluser', loginData
      // AUTH_API + 'api/LpuCIFHeaderFooter/GetUserDataIdWise', loginData 
    )
  }

  // New Logic for Internal user login
  NewUserRecord(newUserData: FormData): Observable<any> {

    return this.http.post(
      AUTH_API + 'api/LpuCIFHeaderFooter/CreateCIFUserAccount', newUserData
    )
  }

  NewUserSignUp(newUserData: FormData): Observable<any> {
    return this.http.post(
      AUTH_API + 'api/LpuCIFHeaderFooter/CIFNewUserSignUpInsert', newUserData
    );
  }


  GetAnalysisData(Id: any, TypeId: any): Observable<any> {
    return this.http.get(
      AUTH_API + 'api/LpuCIFHeaderFooter/GetAnalysisIdWisePriceDetails?AnalysisId=' + Id + '&TypeId=' + TypeId,
    )
  }


  GetInstrumentsDetails(): Observable<any> {
    return this.http.get(
      AUTH_API + 'api/LpuCIFHeaderFooter/GetInstrumentsDetails',
    )
  }


  GetAllInstruments(): Observable<any> {
    return this.http.get(
      AUTH_API + 'api/LpuCIFHeaderFooter/GetInstrumentsDetails',
    )
  }




  GetAllEventDetails(): Observable<any> {
    return this.http.get(
      AUTH_API + 'api/LpuCIFHeaderFooter/GetAllCifEventDetails',
    )
  }

  GetDuationAndPrice(AnalysisId: any, UserId: any, Duration: string): Observable<any> {

    return this.http.get(
      AUTH_API + `api/LpuCIFHeaderFooter/GetDuationAndPrice?AnalysisId=` + AnalysisId + `&UserId=` + UserId + `&Duration=` + Duration,
    )

  }




  GetAnalysisDetails(InstrumentId: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}api/LpuCIFHeaderFooter/GetInstrumentWiseAnalysisDetails?InstrumentId=` + InstrumentId)
  }




  addBookingSlot(newBookingData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers })
      .pipe(catchError(this.handleError('addBookingSlot', { success: false, message: 'Failed to add booking slot' })));
  }













}