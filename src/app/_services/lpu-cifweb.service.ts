import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { StorageService } from './storage.service';
import { EventModel } from '../_model/Event.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';


// const AUTH_API =  'https://localhost:7125/';
// const AUTH_API_LOCAL =  'https://localhost:7125/';
// const AUTH_API_LOCALS =  'https://localhost:7125/';;
// const AUTH_API = 'https://localhost:7125/';
// const AUTH_API = 'https://localhost:7125/';
const AUTH_API =  'https://webapi.lpu.in/cif/';
const AUTH_API_LOCAL = 'https://webapi.lpu.in/cif/';//'https://localhost:7135/';
const AUTH_API_LOCALS = 'https://webapi.lpu.in/cif/';//'https://localhost:7135/';

@Injectable({
  providedIn: 'root'
})

export class LpuCIFWebService {
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



 

  GetInternalUserDetails(Id: any): Observable<any> {
     let token = this.storageService.getUser();
    let headers = new HttpHeaders()
   .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      `${AUTH_API}api/LpuCIF/GetCanidateDetails?UID=` + Id,
     {headers}
    );
  }


  GetEmployeeDetails(Id:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
   .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json');
    return this.http.get(
      `${AUTH_API}api/LpuCIF/GetCanidateDetails?UID=` + Id,
     {headers}
    );
  }
  GetAdminEmployeeDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
   .set('Authorization', 'Bearer ' + token)
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/Mou/GetEmployeeDetails',
     {headers}
    );
  }





  addBookingSlot(newBookingData: FormData): Observable<any> {
    let token = this.storageService.getUser();

    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers })
      .pipe(catchError(this.handleError('addBookingSlot', { success: false, message: 'Failed to add booking slot' })));
  }

 

  GetAllBookingSlot(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllBookingSlot?UserId=' + UserEmailId,
      { headers }
    ).pipe(catchError(this.handleError('GetAllBookingSlot', [])));
  }
  GetAllBooking(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/CIFGetAllAssignedTesttoStaff',
      { headers }
    ).pipe(catchError(this.handleError('GetAllBooking', [])));
  }

  GetAllUploadedResultsByStaff(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/CIFGetAllUploadedResultsByStaff',
      { headers }
    ).pipe(catchError(this.handleError('GetAllUploadedResultsByStaff', [])));
  }
  GetAllBookingTests(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllBookingTests',
      { headers }
    ).pipe(catchError(this.handleError('GetAllBookingTests', [])));
  }


  MakePaymentforTest(newPaymentRecord: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/MakePaymentNowNew', newPaymentRecord, { headers }
    ).pipe(catchError(this.handleError('MakePaymentforTest', { success: false, message: 'Payment failed' })));
  }
  GetUserPaymentDetails(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetUserPaymentDetails?UserId=' + UserEmailId,
      { headers }
    ).pipe(catchError(this.handleError('GetUserPaymentDetails', [])));
  }


  GetAllPaymentDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllPaymentDetails',
      { headers }
    ).pipe(catchError(this.handleError('GetAllPaymentDetails', [])));
  }



  CIFResultsUploads(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFResultsUploads', dataSoft, { headers }
    ).pipe(catchError(this.handleError('CIFResultsUploads', { success: false, message: 'Results upload failed' })));
  }


  
  /** Strip host from a files.lpu.in URL → umsweb/CIFDocuments/... relative path. */
  private toRelativeFilePath(fileUrl: string): string {
    let path = (fileUrl || '').trim();
    if (!path) {
      return '';
    }
    if (/^https?:\/\//i.test(path)) {
      try {
        path = decodeURIComponent(new URL(path).pathname);
      } catch {
        path = path.replace(/^https?:\/\/[^/]+\/?/i, '');
      }
    }
    return path.replace(/^\/+/, '');
  }

  /**
   * CIFDownloadFiles expects a server-relative path in fileName (no https:// URL).
   */
  private buildDownloadPayload(fileUrl: string): { fileName: string; folderPath: string } {
    return { fileName: this.toRelativeFilePath(fileUrl), folderPath: '' };
  }

  /** Sample sheets and other public CIF documents are served directly from files.lpu.in. */
  isPublicCifFileUrl(fileUrl: string): boolean {
    return /^https:\/\/files\.lpu\.in\/umsweb\/CIFDocuments\//i.test((fileUrl || '').trim());
  }

  triggerBrowserDownload(url: string, fallbackName = 'Document'): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop()?.split('?')[0] || fallbackName;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** Download via public URL or CIFDownloadFiles API (used by all dashboard pages). */
  downloadCifDocument(remoteUrl: string): void {
    const url = (remoteUrl || '').trim();
    if (!url) {
      Swal.fire('Error', 'File URL is missing', 'error');
      return;
    }
    if (this.isPublicCifFileUrl(url)) {
      this.triggerBrowserDownload(url);
      return;
    }

    Swal.fire({
      title: 'Downloading...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(null); },
    });

    this.downloadFile(url).subscribe({
      next: async (blob: Blob) => {
        if (blob.type === 'application/json' || blob.type === 'application/problem+json') {
          const errorMsg = JSON.parse(await blob.text());
          Swal.fire('Error', errorMsg.message || errorMsg.title || 'Download failed', 'error');
          return;
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = url.split('/').pop()?.split('?')[0] || 'Document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        Swal.close();
      },
      error: async (err) => {
        Swal.close();
        if (this.isPublicCifFileUrl(url)) {
          this.triggerBrowserDownload(url);
          return;
        }
        if (err.error instanceof Blob) {
          const errorMsg = JSON.parse(await err.error.text());
          Swal.fire('Error', errorMsg.message || errorMsg.title || 'Download failed', 'error');
        } else {
          Swal.fire('Error', 'Could not connect to the server', 'error');
        }
      },
    });
  }

  downloadFile(fileUrl: string): Observable<Blob> {
    const payload = this.buildDownloadPayload(fileUrl);
    const token = this.storageService.getUser();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Authorization': `Bearer ${token}`
      // 'Authorization': `Bearer ${this.authToken}`
    });
    return this.http.post(
     AUTH_API + 'api/LpuCIF/DownloadCIFFiles/CIFDownloadFiles', payload, {
      // 'https://projectsapi.lpu.in/api/Mou/DownloadMOUFiles/MOUDownloadFiles', payload, {
      headers: headers,
      responseType: 'blob'
    });
  }


  getStudentById(regNo: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuCIF/GetStudentById?RegNo='+regNo, {headers});
      AUTH_API_LOCAL + 'api/LpuCIF/GetStudentById?RegNo=' + regNo, { headers })
      .pipe(catchError(this.handleError('getStudentById', null)));
  }

 

  // GetAllBooksDetails(): Observable<any> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(`${this.baseUrl}api/LpuJournal/GetAllJournalData`, httpOptions)
  //     .pipe(catchError(this.handleError('GetAllBooksDetails', [])));
  // }




  //   GetAllEventDetails(): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     AUTH_API + 'api/LpuCIF/GetAllCifEventDetails',
  //     // 'https://localhost:7125/api/LpuCIF/GetAllCifEventDetails',
  //     { headers }
  //   ).pipe(catchError(this.handleError('GetAllEventDetails', [])));
  // }

  // GetDuationAndPrice(AnalysisId: any, UserId: any, Duration: string): Observable<any> {
  //   let token = this.storageService.getUser();

  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`
  //     })
  //   };
  //   return this.http.get<any>(`${this.baseUrl}api/LpuCIF/GetDuationAndPrice?AnalysisId=` + AnalysisId + `&UserId=` + UserId + `&Duration=` + Duration, httpOptions)
  //     .pipe(catchError(this.handleError('GetDuationAndPrice', null)));
  // }

  // GetAnalysisDetails(InstrumentId: any): Observable<any> {
  //   let token = this.storageService.getUser();

  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`
  //     })
  //   };
  //   return this.http.get<any>(`${this.baseUrl}api/LpuCIF/GetInstrumentWiseAnalysisDetails?InstrumentId=` + InstrumentId, httpOptions)
  //     .pipe(catchError(this.handleError('GetAnalysisDetails', [])));
  // }

  //   GetInstrumentsDetails(): Observable<any> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.authToken}`
  //     })
  //   };
  //   return this.http.get<any>(`${this.baseUrl}api/LpuCIF/GetInstrumentsDetails`, httpOptions)
  //     .pipe(catchError(this.handleError('GetInstrumentsDetails', [])));
  // }
  //   // New Logic for Login Page
  // GetAuthoriseUserData(loginData: FormData): Observable<any> {
  //   let authToken = this.storageService.getUser();
  //   const headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + authToken)
  //   return this.http.post(
  //     AUTH_API_LOCAL + 'api/LpuCIF/GetUserDataIdWise', loginData, { headers }
  //   ).pipe(catchError(this.handleError('GetAuthoriseUserData', { success: false, message: 'Error' })));
  // }

  // GetChargesDetails(Id: any): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + token)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     // AUTH_API + 'api/LpuCIF/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
  //     AUTH_API_LOCAL + 'api/LpuCIF/GetInstrumentChargesDetails?InstrumentID=' + Id, { headers }
  //   ).pipe(catchError(this.handleError('GetChargesDetails', null)));
  // }
  //   getLpuHeader(): Observable<any> {
  //   // return this.http.get('https://localhost:7125/api/LpuCIFHeaderFooter/GetLpuHeader');
  //   return this.http.get(AUTH_API + 'api/LpuCIFHeaderFooter/GetLpuHeader');
  // }

  // getLpuFooter(): Observable<any> {
  //   // return this.http.get('https://localhost:7125/api/LpuCIFHeaderFooter/GetLpuFooter');
  //   return this.http.get(AUTH_API + 'api/LpuCIFHeaderFooter/GetLpuFooter');
  // }

  // fetchSpecifications(): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     AUTH_API + 'api/LpuCIF/GetAllSpecifications', { headers }
  //   ).pipe(catchError(this.handleError('fetchSpecifications', [])));
  // }
    // GetAllInstrumentsData(): Observable<any> {
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     AUTH_API + 'api/LpuCIF/GetAllInstruments',
  //     { headers }
  //   ).pipe(catchError(this.handleError('GetAllInstrumentsData', [])));
  // }

  // GetAllInstruments(): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + this.authToken)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     AUTH_API + 'api/LpuCIF/GetInstrumentsDetails',
  //     { headers }
  //   ).pipe(catchError(this.handleError('GetAllInstruments', [])));
  // }

  // GetAnalysisData(Id: any, TypeId: any): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + token)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get(
  //     AUTH_API + 'api/LpuCIF/GetAnalysisIdWisePriceDetails?AnalysisId=' + Id + '&TypeId=' + TypeId,
  //     { headers }
  //   ).pipe(catchError(this.handleError('GetAnalysisData', null)));
  // }

  // NewUserSignUp(newUserData: FormData): Observable<any> {
  //   let token = this.storageService.getUser();
  //   // "Content-Type": "multipart/form-data"
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + token)
  //   // .set('Content-Type', 'multipart/form-data');
  //   return this.http.post(
  //     //  'https://localhost:7125/api/LpuCIF/CIFNewUserSignUpInsert', newUserData, { headers }
  //     AUTH_API + 'api/LpuCIF/CIFNewUserSignUpInsert', newUserData, { headers }
  //   );// for new user account creatinng
  // }
  //   // New Logic for Internal user login
  // NewUserRecord(newUserData: FormData): Observable<any> {
  //   let token = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + token)
  //   return this.http.post(
  //     AUTH_API_LOCAL + 'api/LpuCIF/CreateCIFUserAccount', newUserData, { headers }
  //   ).pipe(catchError(this.handleError('NewUserRecord', { success: false, message: 'Error' })));
  // }



  CIFUpdateStatusInstruments(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFUpdateStatusInstruments', dataSoft, { headers }
    ).pipe(catchError(this.handleError('CIFUpdateStatusInstruments', { success: false, message: 'Status update failed' })));
  }

  CIFAssignTestToStaff(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken) // Added on 18-sep-25
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFAssignTest', dataSoft, { headers }
    ).pipe(catchError(this.handleError('CIFAssignTestToStaff', { success: false, message: 'Test assignment failed' })));
  }

  GetUserResultsDetails(EmailId: any, BookingId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetUserResultsDetails?Uid=' + EmailId + '&BookingId=' + BookingId,
      { headers }
    ).pipe(catchError(this.handleError('GetUserResultsDetails', null)));
  }

  GetUserBookingStatus(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetUserBookingStatus?Uid=' + UserEmailId,
      { headers }
    ).pipe(catchError(this.handleError('GetUserBookingStatus', [])));
  }

  GetAllUserData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllApprovedUserData',
      { headers }
    ).pipe(catchError(this.handleError('GetAllUserData', [])));
  }
 

  // CIFUpdateUserDetails(UpdateUserData: FormData): Observable<any> {
  //   let authToken = this.storageService.getUser();
  //   let headers = new HttpHeaders()
  //     .set('Authorization', 'Bearer ' + authToken)
  //   return this.http.post(
  //     AUTH_API + 'api/LpuCIF/CIFChangePasswordDetails', UpdateUserData, { headers }
  //   ).pipe(catchError(this.handleError('CIFUpdateUserDetails', { success: false, message: 'User details update failed' })));
  // }



  GetUserAllBookingSlot(UserEmailId: string): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken) 
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllUserBookingSlot?UserId=' + UserEmailId,
      { headers }
    );
   
  }



  GetDecodePaymentStatusDetails(Data: FormData): Observable<any> {
    return this.http.post(
       AUTH_API + 'api/LpuCIFHeaderFooter/DecodePaymentStatusDetails', Data 
    ) 
    // let authToken = this.storageService.getUser();
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
    // return this.http.post(
    //   AUTH_API_LOCAL + 'api/LpuCIF/DecodePaymentStatusDetails', Data, { headers }
    // ).pipe(catchError(this.handleError('GetDecodePaymentStatusDetails', { success: false, message: 'Payment status decode failed' })));
  }
  GetUserPaymentStatusDetails(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetUserPaymentStatusDetails?UserId=' + UserEmailId,
      { headers }
    ).pipe(catchError(this.handleError('GetUserPaymentStatusDetails', [])));
  }




  InsertPaymentDetails(Data: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API_LOCAL + 'api/LpuCIF/AddPaymentDetails', Data, { headers }
      // AUTH_API + 'api/LpuCIF/AddPaymentDetails', Data, { headers }
    ).pipe(catchError(this.handleError('InsertPaymentDetails', { success: false, message: 'Payment insertion failed' })));

  }

  UpdateInstrumentImageFile(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/UpdateInstrumentImage', dataSoft,
      // AUTH_API_LOCAL + 'api/LpuCIF/UpdateInstrumentImage',dataSoft,
      { headers }
    ).pipe(catchError(this.handleError('UpdateInstrumentImageFile', { success: false, message: 'Image update failed' })));
  }

  CIFInstrumentUpdateDetails(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    // .set('Authorization', 'Bearer ' + this.authToken)
    return this.http.post(
      AUTH_API_LOCAL + 'api/LpuCIF/UpdateInstrumentImage', dataSoft,
      // AUTH_API_LOCAL + 'api/LpuCIF/CIFInstrumentUpdateData',dataSoft,
      { headers }
    ).pipe(catchError(this.handleError('CIFInstrumentUpdateDetails', { success: false, message: 'Instrument update failed' })));
  }



  NewCifFeedback(newFeedbackData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    // .set('Content-Type', 'multipart/form-data');
    return this.http.post(
      AUTH_API_LOCALS + 'api/LpuCIF/NewFeedback', newFeedbackData, { headers }
    ).pipe(catchError(this.handleError('NewCifFeedback', { success: false, message: 'Feedback submission failed' })));
  }

  NewSAmpleStatus(newSampleStatus: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    // .set('Content-Type', 'multipart/form-data');
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFUpdateSampleStatus', newSampleStatus, { headers }
    ).pipe(catchError(this.handleError('NewSAmpleStatus', { success: false, message: 'Sample status update failed' })));
  }
  GetAllSampleStatus(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllSampleStatus', { headers }
    ).pipe(catchError(this.handleError('GetAllSampleStatus', [])));
  }
  GetAllFeedbackdetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetAllUserFeedbacks', { headers }
      // 'https://projectsapi.lpu.in/api/LpuCIF/GetAllUserFeedbacks', { headers }
    ).pipe(catchError(this.handleError('GetAllFeedbackdetails', [])));
  }
  GetUploadedResultDetails(UserEmailId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId, { headers }
      //  'https://localhost:7125/api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId, { headers }
      AUTH_API + 'api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId, { headers }
    ).pipe(catchError(this.handleError('GetUploadedResultDetails', [])));
  }
  GetAllUserLists(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetCIFAssignTestProperties', { headers }
      // 'https://projectsapi.lpu.in/api/LpuCIF/GetCIFAssignTestProperties', { headers }
    ).pipe(catchError(this.handleError('GetAllUserLists', [])));
  }



  GetSampleStatus(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      AUTH_API + 'api/LpuCIF/GetSampleStatusByUserId?UserId=' + UserEmailId,
      // 'https://localhost:7125/api/LpuCIF/GetSampleStatusByUserId?UserId=' + UserEmailId,
      { headers }
    ).pipe(catchError(this.handleError('GetSampleStatus', [])));
  }




  CIFNewEventsDetails(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFEventsUploads', dataSoft, { headers });
    // 'https://localhost:7125/api/LpuCIF/CIFEventsUploads', dataSoft, { headers });
  }
  CIFUpdateEventsDetails(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/UpdateCIFEventDetails', dataSoft, { headers });
    // 'https://localhost:7125/api/LpuCIF/UpdateCIFEventDetails', dataSoft, { headers });
  }

  CIFLockUser(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/CIFLockUserLogin', dataSoft, { headers }
      //'https://localhost:7125/api/LpuCIF/CIFLockUserLogin', dataSoft, { headers }
    ).pipe(catchError(this.handleError('CIFLockUser', { success: false, message: 'User lock operation failed' })));
  }


  // added on 10-sep-25

  UpdateUserDetails(UserData: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      //  'https://localhost:7125/api/LpuCIF/CIUpdateUserDetails', UserData, { headers }
      AUTH_API + 'api/LpuCIF/CIUpdateUserDetails', UserData, { headers }
    );
  }



  // Added on 18-sep025
  ReAssignTestToStaff(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      //  'https://projectsapi.lpu.in/api/LpuCIF/CIFAssignTest', dataSoft, { headers }
      //  'https://localhost:7125/api/LpuCIF/ReAssignTesttoCIFStaff', dataSoft, { headers }
      AUTH_API + 'api/LpuCIF/ReAssignTesttoCIFStaff', dataSoft, { headers }
    ).pipe(catchError(this.handleError('ReAssignTestToStaff', { success: false, message: 'Test reassignment failed' })));
  }





  ReplaceExcelSheetSample(newUserData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      //  'https://localhost:7125/api/LpuCIF/ReplaceExcelSheetSample', newUserData, { headers }
      AUTH_API + 'api/LpuCIF/ReplaceExcelSheetSample', newUserData, { headers }
    );// for new user account creatinng
  }


  CIFUpdateEventsStatus(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken)
    return this.http.post(
      AUTH_API + 'api/LpuCIF/UpdateEventsStatus', dataSoft, { headers });
    // 'https://localhost:7125/api/LpuCIF/UpdateCIFEventDetails', dataSoft, { headers });
  }







  /**
   * Helper function to prepare the FormData payload for the API.
   * Your backend is expecting a [FromForm] CIFEventsDetailsModel.
   */
  private prepareFormData(event: EventModel, action: 'Insert' | 'Update' | 'Delete' | 'View'): FormData {
    const formData = new FormData();

    // Map the model fields to FormData
    formData.append('Action', action);

    // EventId is needed for all operations except 'Insert'
    if (event.eventId !== null) {
      formData.append('EventId', event.eventId.toString());
    }

    // Required fields for Insert/Update
    if (action !== 'Delete' && action !== 'View') {
      formData.append('EventName', event.eventName);
      formData.append('EventDate', event.eventDate);
      formData.append('EventCategory', event.eventCategory);
      formData.append('EventDetails', event.eventDetails);
      formData.append('ImageUrl', event.imageUrl);
      formData.append('EventFileData', event.eventFileData || '');
      formData.append('DisapprovalReason', event.disapprovalReason || '');
      formData.append('LoginName', event.LoginName || 'DefaultUser');
    }

    return formData;
  }

  // --- CRUD Operations ---

  /**
   * The unified function to handle all CRUD operations for Events.
   * * @param data The FormData containing all event fields and the 'Action' parameter.
   * @param action The specific action ('Insert', 'Update', 'Delete', 'View')
   * @returns An Observable that resolves to the API response (e.g., success message or list of events).
   */
  EventsCrudOperation(data: FormData, action: 'Insert' | 'Update' | 'Delete' | 'View'): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      // .set('Authorization', 'Bearer ' + this.authToken)


    return this.http.post<any>(
      AUTH_API + 'api/LpuCIF/EventsCrudOperation',
      // `${this.baseUrl}${this.eventsEndpoint}`, 
      data, { headers }
    ).pipe(catchError(this.handleError('EventsCrudOperation', { success: false, message: 'Events CRUD operation failed' })));


  }


  getEvents(): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    // .set('Authorization', 'Bearer ' + this.authToken)
    const viewEventModel: EventModel = {
      eventId: 0,
      eventName: '',
      eventDate: '',
      eventCategory: 'Upcoming', // Default value
      eventDetails: '',
      imageUrl: ''
    };
    // 2. Prepare FormData with Action='View'
    const formData = this.prepareFormData(viewEventModel, 'View');

    return this.http.post(
      AUTH_API + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(catchError(this.handleError('getEvents', [])));
  }


  createEvent(event: EventModel): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    // .set('Authorization', 'Bearer ' + this.authToken)
    const formData = this.prepareFormData(event, 'Insert');
    return this.http.post(
      AUTH_API + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(catchError(this.handleError('createEvent', { success: false, message: 'Event creation failed' })));
  }

  updateEvent(event: EventModel): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    // .set('Authorization', 'Bearer ' + this.authToken)

    const formData = this.prepareFormData(event, 'Update');
    return this.http.post(
      AUTH_API + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(catchError(this.handleError('updateEvent', { success: false, message: 'Event update failed' })));
  }

  deleteEvent(eventId: number): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
    // .set('Authorization', 'Bearer ' + this.authToken)
    const deleteEventModel: EventModel = {
      eventId: eventId,
      eventName: '',
      eventDate: '',
      eventCategory: 'Upcoming',
      eventDetails: '',
      imageUrl: ''
    };
    const formData = this.prepareFormData(deleteEventModel, 'Delete');
    return this.http.post(
      AUTH_API + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(catchError(this.handleError('deleteEvent', { success: false, message: 'Event deletion failed' })));
  }



  UploadPaymentReceipt(PaymentReceipt: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      // 'https://localhost:7125/api/LpuCIF/CIFUploadPaymentReceipt', PaymentReceipt, { headers }
      AUTH_API + 'api/LpuCIF/CIFUploadPaymentReceipt', PaymentReceipt, { headers }
    );// for new user account creatinng
  }

  GetBookingPaymentProofDetails(BookingId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // 'https://localhost:7125/api/LpuCIF/CIFGetBookingPaymentProofDetails?BookingId=' + BookingId, { headers })
      AUTH_API_LOCAL + 'api/LpuCIF/CIFGetBookingPaymentProofDetails?UserId=' + BookingId, { headers })
      .pipe(catchError(this.handleError('GetBookingPaymentProofDetails', null)));
  }

  // Method to call the stored procedure for new instrument details with analysis
  callStoredProcedure(payload: any): Observable<any> {
    const formData = new FormData();

    // Append all payload properties to formData
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)


    return this.http.post(
      // 'https://localhost:7125/api/LpuCIF/CIFNewInstrumentDetails', formData, { headers })
      AUTH_API + 'api/LpuCIF/CIFNewInstrumentDetails', formData, { headers })
      .pipe(catchError(this.handleError('callStoredProcedure', { NewId: null })));
  }






}