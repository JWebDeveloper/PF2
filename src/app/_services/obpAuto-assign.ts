import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
const AUTH_API = 'https://projectsapi.lpu.in/';//'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';//'https://localhost:7125/';

@Injectable({
  providedIn: 'root'
})

export class ObpAutoAssignService {

  FileData: string;
  fileName: string;

  constructor(private http: HttpClient, private storageService: StorageService) { }


  GetEmployeeDetails(): Observable<any> {
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


  GetObpMetricDetails(Id:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API_LOCAL + 'api/LpuObpAutomation/GetObpMetricDetails?MetricId='+Id, { headers }
    );
  }
  GetAllOBPPlannerSessions(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API_LOCAL + 'api/LpuObpAutomation/GetOBPPlannerSessions', { headers }
    );
  }
  
  GetOBPQueryResultsData(Query: any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    return this.http.get(
      // AUTH_API + 'api/LpuObpAutomation/GetAGetInstrumentChargesDetailsllSpecifications', { headers }
      AUTH_API_LOCAL + 'api/LpuObpAutomation/GetQueryResultsData?queryData='+Query, { headers }
    );
  }

  CallWebApiInsertData(DataValues: FormData): Observable<any> {
    // console.log("Form Values in API HIT Services" + DataValues)
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
    return this.http.post(
      // AUTH_API_LOCAL + 'api/LpuCIF/NewBookingSlot', newBookingData, { headers }
      AUTH_API_LOCAL+'api/LpuObpAutomation/OBPInsertMetricAutoIntegration',DataValues, { headers });
  }
  
}
