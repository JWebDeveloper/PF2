import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

// ─── Interfaces matching the stored procedure columns ────────────────────────

export interface MouInsertPayload {
  action: 'Insert';
  mouTitle: string;
  mouDocumentUrl?: string;
  mouDocumentData?: string;
  mouStartDate: string;
  mouEndDate: string;
  mouRemarks?: string;
  userId: string;
}
export interface MouUpdatePayload {
  action: 'Update';
  mouId: string;
  mouTitle?: string;
  mouDocumentData: string;  
  mouDocumentUrl: string;   
  mouStartDate?: string;
  mouEndDate: string;
  mouRemarks?: string;
  loginName: string;
    userId: string;
}

export interface MouDeletePayload {
  action: 'Delete';
  mouId: string;
  mouTitle: string;
  userId: string;
  loginName: string;
}

export interface MouApprovePayload {
  action: 'Approve' | 'DisApprove';
  mouId: string;
  userId: string;
  approvalRemarks?: string;
  loginName: string;
}

export interface MouRecord {
  mouTitle: string;
  mouStartDate: string;
  mouEndDate: string;
  mouStatus: any;
  mouRemarks: string;
  isApproved: any;
  isActive: any;
  userEmailId: string;
  createdOn: string;
  userName: string;
  userRole: any;
  userType: string;
  mouDocumentUrl?: string;
  mouId?: string;
  approvalRemarks?: string;
}

export interface MouApiResponse {
  item1: { msg: string; returnId: string | number }[];
}

export interface MouViewResponse {
  item1: MouRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MOUCrudOperation {
  private readonly http           = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  // private readonly baseUrl = 'https://localhost:7125/api/LpuCIF';//'https://localhost:7125/api/LpuCIF'; 'https://localhost:7125/api/LpuCIF';//
  private readonly baseUrl = 'https://webapi.lpu.in/cif/api/LpuCIF';//'https://localhost:7125/api/LpuCIF'; 'https://localhost:7125/api/LpuCIF';//

  private get authHeadersFormData(): HttpHeaders {
    const token = this.storageService.getUser();
    return new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);
  }

  // ── Shared error handler ──────────────────────────────────────────────────
  private handleError<T>(operation: string, fallback: T) {
    return (error: any): Observable<T> => {
      console.error(`[CIFMOUCrudOperation] ${operation} failed:`, error);
      return of(fallback);
    };
  }

  
  private buildFormData(fields: Record<string, string | undefined | null>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null && value !== '') {
        fd.append(key, value);
      }
    }
    return fd;
  }

  // ── Insert new MOU (Simple User) ──────────────────────────────────────────
  insertMou(payload: MouInsertPayload): Observable<MouApiResponse> {
    const fd = this.buildFormData({
      Action:          'Insert',
      MOUTitle:        payload.mouTitle,
      MOUDocumentUrl:  payload.mouDocumentUrl,
      MOUDocumentData: payload.mouDocumentData,
      MouStartDate:    payload.mouStartDate,
      MouEndDate:      payload.mouEndDate,
      MOURemarks:      payload.mouRemarks,
      UserId:          payload.userId,
    });

    return this.http.post<MouApiResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('insertMou',
        { item1: [{ msg: 'Failed', returnId: -1 }] }))
    );
  }

  // ── Update existing MOU (Simple User) ────────────────────────────────────
  updateMou(payload: MouUpdatePayload): Observable<MouApiResponse> {
    const fd = this.buildFormData({
      Action:          'Update',
      MouId:           payload.mouId,
      MOUTitle:        payload.mouTitle,
      MOUDocumentData: payload.mouDocumentData,   
      MOUDocumentUrl:  payload.mouDocumentUrl,
      MouStartDate:    payload.mouStartDate,
      MouEndDate:      payload.mouEndDate,
      MOURemarks:      payload.mouRemarks,
      LoginName:       payload.loginName,
      UserId:          payload.userId,             
    });

    return this.http.post<MouApiResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('updateMou',
        { item1: [{ msg: 'Failed', returnId: -1 }] }))
    );
  }


  // ── Delete / deactivate MOU (Admin) ──────────────────────────────────────
  deleteMou(payload: MouDeletePayload): Observable<MouApiResponse> {
    const fd = this.buildFormData({
      Action:    'Delete',
      MouId:     payload.mouId,
      MOUTitle:  payload.mouTitle,
      UserId:    payload.userId,
      LoginName: payload.loginName,
    });

    return this.http.post<MouApiResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('deleteMou',
        { item1: [{ msg: 'Failed', returnId: -1 }] }))
    );
  }

  // ── View MOUs for a specific user (Simple User) ───────────────────────────
  viewMyMous(userId: string): Observable<MouViewResponse> {
    const fd = this.buildFormData({
      Action: 'View',
      UserId: userId,
    });

    return this.http.post<MouViewResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('viewMyMous', { item1: [] }))
    );
  }

  
  viewAllMous(): Observable<MouViewResponse> {
    const fd = this.buildFormData({
      Action: 'ViewAll',
    });

    return this.http.post<MouViewResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('viewAllMous', { item1: [] }))
    );
  }

  // ── Approve MOU (Admin) ───────────────────────────────────────────────────
  approveMou(payload: MouApprovePayload): Observable<MouApiResponse> {
    const fd = this.buildFormData({
      Action:          'Approve',
      MouId:           payload.mouId,
      UserId:          payload.userId,
      ApprovalRemarks: payload.approvalRemarks,
      LoginName:       payload.loginName,
    });

    return this.http.post<MouApiResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('approveMou',
        { item1: [{ msg: 'Failed', returnId: -1 }] }))
    );
  }

  // ── Disapprove MOU (Admin) ────────────────────────────────────────────────
  disapproveMou(payload: MouApprovePayload): Observable<MouApiResponse> {
    const fd = this.buildFormData({
      Action:          'DisApprove',
      MouId:           payload.mouId,
      UserId:          payload.userId,
      ApprovalRemarks: payload.approvalRemarks,
      LoginName:       payload.loginName,
    });

    return this.http.post<MouApiResponse>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('disapproveMou',
        { item1: [{ msg: 'Failed', returnId: -1 }] }))
    );
  }

  // ── Upload MOU document — multipart FormData ──────────────────────────────
  uploadMouDocument(file: File): Observable<{ fileUrl: string }> {
    const fd = new FormData();
    fd.append('File', file);   // PascalCase 'File' to match controller param
    return this.http.post<{ fileUrl: string }>(
      `${this.baseUrl}/CIFMOUCrudOperation`,
      fd,
      { headers: this.authHeadersFormData }
    ).pipe(
      catchError(this.handleError('uploadMouDocument', { fileUrl: '' }))
    );
  }
}
