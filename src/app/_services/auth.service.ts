import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

const BASE_URL = environment.apiUrl;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  LoginJournalAccessTemp(username: string): Observable<any> {
    return this.http.post(
      BASE_URL + 'security/createCifPortalToken',
      {
        username,
      },
      httpOptions,
    );
  }

  loginTemp(username: string, menuName: string = ''): Observable<any> {
    const checkData = {
      UserName: username,
      MenuName: menuName,
    };

    return this.http.post(
      // BASE_URL + 'security/createcommonToken',
      BASE_URL + 'security/createcommonToken',
      checkData,
      httpOptions,
    );
  }

  loginInternalUser(userId: string, key: string): Observable<any> {
    // // debugger
    return this.http.post(
      BASE_URL + 'security/createtoken ',
      {
        userName: userId,
        password: key,
      },
      httpOptions,
    );
  }

  loginUMSTemp(username: string): Observable<any> {
    return this.http.post(
      BASE_URL + 'security/createumscommonToken',
      {
        username,
      },
      httpOptions,
    );
  }
}
// const BASE_URL = 'https://webapi.lpu.in/cif/';
// const BASE_URL = 'https://localhost:7125/';
// const BASE_URL = 'https://localhost:7125/';
// const BASE_URLS = 'https://localhost:7125/';
// getModeratorBoard(): Observable<any> {
//   return this.http.get(API_URL + 'mod', { responseType: 'text' });
// }

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

// const BASE_URL = 'https://projectsapi.lpu.in/';
// const BASE_URL = 'https://projectsapi.lpu.in/';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   constructor(private http: HttpClient) {}

//   loginTemp(username: string,menuName:string=''): Observable<any> {
//     const checkData = {
//       UserName:username,
//       MenuName:menuName
//      }

//     return this.http.post(
//       BASE_URL + 'security/createcommonToken',
//       checkData,
//       httpOptions
//     );
//   }

//   loginUMSTemp(username: string): Observable<any> {
//     return this.http.post(
//       BASE_URL + 'security/createumscommonToken',
//       {
//         username
//       },
//       httpOptions
//     );
//   }

//   loginInternalUser(userId: string, key: string): Observable<any> {
//     // // debugger
//     return this.http.post(
//       BASE_URL + 'security/createtoken ',
//       {
//         userName: userId,
//         password: key
//       },
//       httpOptions
//     );
//   }

//   // getModeratorBoard(): Observable<any> {
//   //   return this.http.get(API_URL + 'mod', { responseType: 'text' });
//   // }
// }
