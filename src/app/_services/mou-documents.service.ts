import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';

// const BASE_URL = 'https://webapi.lpu.in/cif/';
// // const BASE_URL = 'https://projectsapi.lpu.in/';//'https://projectsapi.lpu.in/'; //'https://projectsapi.lpu.in/';
// const BASE_URL_LOCAL = 'https://projectsapi.lpu.in/';
// const BASE_URL =  'https://webapi.lpu.in/cif/';

const BASE_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root',
})
export class MouDocumentsService {
  FileData: string;
  fileName: string;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}
  // private Localtoken = environment.authToken;

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
    });
    return this.http.post(
      BASE_URL + 'api/Mou/DownloadMOUFiles/MOUDownloadFiles',
      payload,
      {
        headers: headers,
        responseType: 'blob',
      },
    );
  }

  GetEmployeeDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetEmployeeDetails', { headers });
  }
  GetAdminEmployeeDetails(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetEmployeeDetails', { headers });
  }

  MouDocumentUpload(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(BASE_URL + 'api/Mou/MouDocumentInsert', dataSoft, {
      headers,
    });
  }

  GetAllUploadedDocuments(): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetAllUploadedDocuments', {
      headers,
    });
  }
  ApproveDocument(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(BASE_URL + 'api/Mou/ApprovalAction', dataSoft, {
      headers,
    });
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }

  MouDocumentUpdateFile(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/MouDocumentUpdateFile',
      dataSoft,
      { headers },
    );
  }

  GetUIDWiseUploadedDocuments(Id: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetUIDWiseMouDocumentDetails?Uid=' + Id,
      { headers },
    );
    // return this.http.get(
    //   BASE_URL + 'api/Mou/GetUIDWiseMouDocumentDetails?Uid=' + Id,
    //  {headers}
    // );
  }

  MouActivityInsert(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(BASE_URL + 'api/Mou/MouActivityInsert', dataSoft, {
      headers,
    });
  }

  GetUIDWiseMouActivityDetails(Id: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetUIDWiseMouActivityDetails?Uid=' + Id,
      { headers },
    );
    // return this.http.get(
    //   BASE_URL + 'api/Mou/GetUIDWiseMouDocumentDetails?Uid=' + Id,
    //  {headers}
    // );
  }

  GetAllUploadedActivities(): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetAllMouActivityDetails', {
      headers,
    });
  }

  MouActivityUpdateFile(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/MouActivityUpdateFile',
      dataSoft,
      { headers },
    );
  }

  ApproveActivity(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/ActivityApprovalAction',
      dataSoft,
      { headers },
    );
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }

  GetEmployeeData(): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(BASE_URL + 'api/Mou/GetAllEmployeeData', { headers });
  }
  MouDocumentsforApproval(EmployeeCode: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetMouDocumentsforApproval?Uid=' + EmployeeCode,
      { headers },
    );
  }

  MouNewActivityPlanAddNew(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(BASE_URL + 'api/Mou/MouNewActivityPlan', dataSoft, {
      headers,
    });
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }
  InsertMouActivityActionTaken(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/MouActivityActionTakenInsert',
      dataSoft,
      { headers },
    );
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }
  MouDocumentstoTakeAction(Uid: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetMouDocumentstoTakeAction?Uid=' + Uid,
      { headers },
    );
  }

  MouActionsTakenData(Uid: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetMouActivityActionTaken?Uid=' + Uid,
      { headers },
    );
  }
  ApproveMouActionTakenDocument(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/MouActionTakenDocumentApproval',
      dataSoft,
      { headers },
    );
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }

  MOUGetAllActivitiesAssigned(EmployeeCode: any): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + authToken)
      //.set('Authorization', 'Bearer ' + this.Localtoken)
      .set('Content-Type', 'application/json');
    return this.http.get(
      BASE_URL + 'api/Mou/GetAllActivitiesAssigned?Uid=' + EmployeeCode,
      { headers },
    );
  }

  UpdateSchoolDivision(dataSoft: FormData): Observable<any> {
    let authToken = this.storageService.getUser();
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);
    //.set('Authorization', 'Bearer ' + this.Localtoken)
    return this.http.post(
      BASE_URL + 'api/Mou/MouUpdateSchoolInvolved',
      dataSoft,
      { headers },
    );
    // // Create an HttpHeaders object with the Authorization header
    //// debugger
    // let headers = new HttpHeaders()
    //   .set('Authorization', 'Bearer ' + this.authToken)
  }
}
