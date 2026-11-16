import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { EventModel } from '../_model/Event.model';
import { xmlBookingSlots } from './xmlBookingSlots.model';

const BASE_URL = environment.apiUrl;

// const BASE_URL = 'https://webapi.lpu.in/cif/';
// const BASE_URL = 'https://webapi.lpu.in/cif/'; //'https://projectsapi.lpu.in/';
// const BASE_URLS = 'https://webapi.lpu.in/cif/'; //'https://projectsapi.lpu.in/';


@Injectable({
  providedIn: 'root',
})
export class LpuCIFWebService {
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

  GetInternalUserDetails(Id: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(`${BASE_URL}api/LpuCIF/GetCanidateDetails?UID=` + Id, {
      headers,
    });
  }

  GetEmployeeDetails(Id: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(`${BASE_URL}api/LpuCIF/GetCanidateDetails?UID=` + Id, {
      headers,
    });
  }
  GetAdminEmployeeDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetEmployeeDetails', { headers });
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

  GetAllBookingSlot(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetAllBookingSlot?UserId=' + UserEmailId, {
        headers,
      })
      .pipe(catchError(this.handleError('GetAllBookingSlot', [])));
  }
  GetAllBooking(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/CIFGetAllAssignedTesttoStaff', { headers })
      .pipe(catchError(this.handleError('GetAllBooking', [])));
  }

  GetAllUploadedResultsByStaff(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/CIFGetAllUploadedResultsByStaff', { headers })
      .pipe(catchError(this.handleError('GetAllUploadedResultsByStaff', [])));
  }
  GetAllBookingTests(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetAllBookingTests', { headers })
      .pipe(catchError(this.handleError('GetAllBookingTests', [])));
  }

  MakePaymentforTest(newPaymentRecord: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http
      .post(BASE_URL + 'api/LpuCIF/MakePaymentNowNew', newPaymentRecord, {
        headers,
      })
      .pipe(
        catchError(
          this.handleError('MakePaymentforTest', {
            success: false,
            message: 'Payment failed',
          }),
        ),
      );
  }
  GetUserPaymentDetails(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL + 'api/LpuCIF/GetUserPaymentDetails?UserId=' + UserEmailId,
        { headers },
      )
      .pipe(catchError(this.handleError('GetUserPaymentDetails', [])));
  }

  GetAllPaymentDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetAllPaymentDetails', { headers })
      .pipe(catchError(this.handleError('GetAllPaymentDetails', [])));
  }

  CIFResultsUploads(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    return this.http
      .post(BASE_URL + 'api/LpuCIF/CIFResultsUploads', dataSoft, { headers })
      .pipe(
        catchError(
          this.handleError('CIFResultsUploads', {
            success: false,
            message: 'Results upload failed',
          }),
        ),
      );
  }

  downloadFile(fileUrl: string): Observable<Blob> {
    const payload = {
      fileName: fileUrl,
      folderPath: '',
    };
    const token = this.storageService.getUser();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
      // 'Authorization': `Bearer ${this.authToken}`
    });
    return this.http.post(
      BASE_URL + 'api/LpuCIF/DownloadCIFFiles/CIFDownloadFiles',
      payload,
      {
        // 'https://projectsapi.lpu.in/api/Mou/DownloadMOUFiles/MOUDownloadFiles', payload, {
        headers: headers,
        responseType: 'blob',
      },
    );
  }

  getStudentById(regNo: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        // BASE_URL + 'api/LpuCIF/GetStudentById?RegNo='+regNo, {headers});
        BASE_URL + 'api/LpuCIF/GetStudentById?RegNo=' + regNo,
        { headers },
      )
      .pipe(catchError(this.handleError('getStudentById', null)));
  }

  CIFUpdateStatusInstruments(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    return this.http
      .post(BASE_URL + 'api/LpuCIF/CIFUpdateStatusInstruments', dataSoft, {
        headers,
      })
      .pipe(
        catchError(
          this.handleError('CIFUpdateStatusInstruments', {
            success: false,
            message: 'Status update failed',
          }),
        ),
      );
  }

  CIFAssignTestToStaff(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken); // Added on 18-sep-25
    return this.http
      .post(BASE_URL + 'api/LpuCIF/CIFAssignTest', dataSoft, { headers })
      .pipe(
        catchError(
          this.handleError('CIFAssignTestToStaff', {
            success: false,
            message: 'Test assignment failed',
          }),
        ),
      );
  }

  GetUserResultsDetails(EmailId: any, BookingId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL +
          'api/LpuCIF/GetUserResultsDetails?Uid=' +
          EmailId +
          '&BookingId=' +
          BookingId,
        { headers },
      )
      .pipe(catchError(this.handleError('GetUserResultsDetails', null)));
  }

  GetUserBookingStatus(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetUserBookingStatus?Uid=' + UserEmailId, {
        headers,
      })
      .pipe(catchError(this.handleError('GetUserBookingStatus', [])));
  }

  GetAllUserData(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetAllApprovedUserData', { headers })
      .pipe(catchError(this.handleError('GetAllUserData', [])));
  }

  GetUserAllBookingSlot(UserEmailId: string): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/LpuCIF/GetAllUserBookingSlot?UserId=' + UserEmailId,
      { headers },
    );
  }

  GetDecodePaymentStatusDetails(Data: FormData): Observable<any> {
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/DecodePaymentStatusDetails',
      Data,
    );
  }
  GetUserPaymentStatusDetails(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL +
          'api/LpuCIF/GetUserPaymentStatusDetails?UserId=' +
          UserEmailId,
        { headers },
      )
      .pipe(catchError(this.handleError('GetUserPaymentStatusDetails', [])));
  }

  InsertPaymentDetails(Data: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    return this.http
      .post(
        BASE_URL + 'api/LpuCIF/AddPaymentDetails',
        Data,
        { headers },
        // BASE_URL + 'api/LpuCIF/AddPaymentDetails', Data, { headers }
      )
      .pipe(
        catchError(
          this.handleError('InsertPaymentDetails', {
            success: false,
            message: 'Payment insertion failed',
          }),
        ),
      );
  }

  UpdateInstrumentImageFile(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    return this.http
      .post(
        BASE_URL + 'api/LpuCIF/UpdateInstrumentImage',
        dataSoft,
        // BASE_URL + 'api/LpuCIF/UpdateInstrumentImage',dataSoft,
        { headers },
      )
      .pipe(
        catchError(
          this.handleError('UpdateInstrumentImageFile', {
            success: false,
            message: 'Image update failed',
          }),
        ),
      );
  }

  CIFInstrumentUpdateDetails(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)
    return this.http
      .post(
        BASE_URL + 'api/LpuCIF/UpdateInstrumentImage',
        dataSoft,
        // BASE_URL + 'api/LpuCIF/CIFInstrumentUpdateData',dataSoft,
        { headers },
      )
      .pipe(
        catchError(
          this.handleError('CIFInstrumentUpdateDetails', {
            success: false,
            message: 'Instrument update failed',
          }),
        ),
      );
  }

  NewCifFeedback(newFeedbackData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    // .set('Content-Type', 'multipart/form-data');
    return this.http
      .post(BASE_URL + 'api/LpuCIF/NewFeedback', newFeedbackData, {
        headers,
      })
      .pipe(
        catchError(
          this.handleError('NewCifFeedback', {
            success: false,
            message: 'Feedback submission failed',
          }),
        ),
      );
  }

  NewSAmpleStatus(newSampleStatus: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    // .set('Content-Type', 'multipart/form-data');
    return this.http
      .post(BASE_URL + 'api/LpuCIF/CIFUpdateSampleStatus', newSampleStatus, {
        headers,
      })
      .pipe(
        catchError(
          this.handleError('NewSAmpleStatus', {
            success: false,
            message: 'Sample status update failed',
          }),
        ),
      );
  }
  GetAllSampleStatus(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(BASE_URL + 'api/LpuCIF/GetAllSampleStatus', { headers })
      .pipe(catchError(this.handleError('GetAllSampleStatus', [])));
  }
  GetAllFeedbackdetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL + 'api/LpuCIF/GetAllUserFeedbacks',
        { headers },
        // 'https://projectsapi.lpu.in/api/LpuCIF/GetAllUserFeedbacks', { headers }
      )
      .pipe(catchError(this.handleError('GetAllFeedbackdetails', [])));
  }
  GetUploadedResultDetails(UserEmailId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        // BASE_URL + 'api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId, { headers }
        //  'https://localhost:7125/api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId, { headers }
        BASE_URL + 'api/LpuCIF/GetUploadedResultDetails?UserId=' + UserEmailId,
        { headers },
      )
      .pipe(catchError(this.handleError('GetUploadedResultDetails', [])));
  }
  GetAllUserLists(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL + 'api/LpuCIF/GetCIFAssignTestProperties',
        { headers },
        // 'https://projectsapi.lpu.in/api/LpuCIF/GetCIFAssignTestProperties', { headers }
      )
      .pipe(catchError(this.handleError('GetAllUserLists', [])));
  }

  GetSampleStatus(UserEmailId: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        BASE_URL + 'api/LpuCIF/GetSampleStatusByUserId?UserId=' + UserEmailId,
        // 'https://localhost:7125/api/LpuCIF/GetSampleStatusByUserId?UserId=' + UserEmailId,
        { headers },
      )
      .pipe(catchError(this.handleError('GetSampleStatus', [])));
  }

  CIFNewEventsDetails(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.post(BASE_URL + 'api/LpuCIF/CIFEventsUploads', dataSoft, {
      headers,
    });
    // 'https://localhost:7125/api/LpuCIF/CIFEventsUploads', dataSoft, { headers });
  }
  CIFUpdateEventsDetails(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.post(
      BASE_URL + 'api/LpuCIF/UpdateCIFEventDetails',
      dataSoft,
      { headers },
    );
    // 'https://localhost:7125/api/LpuCIF/UpdateCIFEventDetails', dataSoft, { headers });
  }

  CIFLockUser(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http
      .post(
        BASE_URL + 'api/LpuCIF/CIFLockUserLogin',
        dataSoft,
        { headers },
        //'https://localhost:7125/api/LpuCIF/CIFLockUserLogin', dataSoft, { headers }
      )
      .pipe(
        catchError(
          this.handleError('CIFLockUser', {
            success: false,
            message: 'User lock operation failed',
          }),
        ),
      );
  }

  // added on 10-sep-25

  UpdateUserDetails(UserData: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.post(
      //  'https://localhost:7125/api/LpuCIF/CIUpdateUserDetails', UserData, { headers }
      BASE_URL + 'api/LpuCIF/CIUpdateUserDetails',
      UserData,
      { headers },
    );
  }

  // Added on 18-sep025
  ReAssignTestToStaff(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http
      .post(
        //  'https://projectsapi.lpu.in/api/LpuCIF/CIFAssignTest', dataSoft, { headers }
        //  'https://localhost:7125/api/LpuCIF/ReAssignTesttoCIFStaff', dataSoft, { headers }
        BASE_URL + 'api/LpuCIF/ReAssignTesttoCIFStaff',
        dataSoft,
        { headers },
      )
      .pipe(
        catchError(
          this.handleError('ReAssignTestToStaff', {
            success: false,
            message: 'Test reassignment failed',
          }),
        ),
      );
  }

  ReplaceExcelSheetSample(newUserData: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(
      //  'https://localhost:7125/api/LpuCIF/ReplaceExcelSheetSample', newUserData, { headers }
      BASE_URL + 'api/LpuCIF/ReplaceExcelSheetSample',
      newUserData,
      { headers },
    ); // for new user account creatinng
  }

  CIFUpdateEventsStatus(dataSoft: FormData): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      // .set('Authorization', 'Bearer ' + authToken)
      .set('Authorization', 'Bearer ' + authToken);
    return this.http.post(
      BASE_URL + 'api/LpuCIF/UpdateEventsStatus',
      dataSoft,
      { headers },
    );
    // 'https://localhost:7125/api/LpuCIF/UpdateCIFEventDetails', dataSoft, { headers });
  }

  /**
   * Helper function to prepare the FormData payload for the API.
   * Your backend is expecting a [FromForm] CIFEventsDetailsModel.
   */
  private prepareFormData(
    event: EventModel,
    action: 'Insert' | 'Update' | 'Delete' | 'View',
  ): FormData {
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
  EventsCrudOperation(
    data: FormData,
    action: 'Insert' | 'Update' | 'Delete' | 'View',
  ): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)

    return this.http
      .post<any>(
        BASE_URL + 'api/LpuCIF/EventsCrudOperation',
        // `${this.baseUrl}${this.eventsEndpoint}`,
        data,
        { headers },
      )
      .pipe(
        catchError(
          this.handleError('EventsCrudOperation', {
            success: false,
            message: 'Events CRUD operation failed',
          }),
        ),
      );
  }

  getEvents(): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)
    const viewEventModel: EventModel = {
      eventId: 0,
      eventName: '',
      eventDate: '',
      eventCategory: 'Upcoming', // Default value
      eventDetails: '',
      imageUrl: '',
    };
    // 2. Prepare FormData with Action='View'
    const formData = this.prepareFormData(viewEventModel, 'View');

    return this.http
      .post(BASE_URL + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(catchError(this.handleError('getEvents', [])));
  }

  createEvent(event: EventModel): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)
    const formData = this.prepareFormData(event, 'Insert');
    return this.http
      .post(BASE_URL + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(
        catchError(
          this.handleError('createEvent', {
            success: false,
            message: 'Event creation failed',
          }),
        ),
      );
  }

  updateEvent(event: EventModel): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)

    const formData = this.prepareFormData(event, 'Update');
    return this.http
      .post(BASE_URL + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(
        catchError(
          this.handleError('updateEvent', {
            success: false,
            message: 'Event update failed',
          }),
        ),
      );
  }

  deleteEvent(eventId: number): Observable<any> {
    var authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    // .set('Authorization', 'Bearer ' + this.authToken)
    const deleteEventModel: EventModel = {
      eventId: eventId,
      eventName: '',
      eventDate: '',
      eventCategory: 'Upcoming',
      eventDetails: '',
      imageUrl: '',
    };
    const formData = this.prepareFormData(deleteEventModel, 'Delete');
    return this.http
      .post(BASE_URL + 'api/LpuCIF/EventsCrudOperation', formData, { headers })
      .pipe(
        catchError(
          this.handleError('deleteEvent', {
            success: false,
            message: 'Event deletion failed',
          }),
        ),
      );
  }

  UploadPaymentReceipt(PaymentReceipt: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(
      // 'https://localhost:7125/api/LpuCIF/CIFUploadPaymentReceipt', PaymentReceipt, { headers }
      BASE_URL + 'api/LpuCIF/CIFUploadPaymentReceipt',
      PaymentReceipt,
      { headers },
    ); // for new user account creatinng
  }

  GetBookingPaymentProofDetails(BookingId: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      // .set('Authorization', 'Bearer ' + this.authToken)
      .set('Content-Type', 'application/json');
    return this.http
      .get(
        // 'https://localhost:7125/api/LpuCIF/CIFGetBookingPaymentProofDetails?BookingId=' + BookingId, { headers })
        BASE_URL +
          'api/LpuCIF/CIFGetBookingPaymentProofDetails?UserId=' +
          BookingId,
        { headers },
      )
      .pipe(
        catchError(this.handleError('GetBookingPaymentProofDetails', null)),
      );
  }

  // Method to call the stored procedure for new instrument details with analysis
  callStoredProcedure(payload: any): Observable<any> {
    const formData = new FormData();

    // Append all payload properties to formData
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    return this.http
      .post(
        // 'https://localhost:7125/api/LpuCIF/CIFNewInstrumentDetails', formData, { headers })
        BASE_URL + 'api/LpuCIF/CIFNewInstrumentDetails',
        formData,
        { headers },
      )
      .pipe(
        catchError(this.handleError('callStoredProcedure', { NewId: null })),
      );
  }

  UpdatePrice(PricesDetails: FormData): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(
      // 'https://projectsapi.lpu.in/api/LpuCIF/CIFUpdatePrice', PricesDetails, { headers }
      BASE_URL + 'api/LpuCIF/CIFUpdatePrice',
      PricesDetails,
      { headers },
    ); // for new user account creatinng
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




  // Upload Excel sheet Record data into University Database (Offline Booking Details)
  AddCIFBookingDetailsUsingExcelSheet(model: xmlBookingSlots): Observable<any> {
    const authToken = this.storageService.getUser();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (authToken) {
      headers = headers.set('Authorization', 'Bearer ' + authToken);
    }
    return this.http.post(
      BASE_URL + 'api/LpuCIFHeaderFooter/AddCIFBookingDetailsUsingExcelSheet',
      model,
      { headers }
    );
  }
}
