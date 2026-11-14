import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';

import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { LoginSessionService } from 'src/app/_services/login-session.service';

import { ColumnMode } from '@swimlane/ngx-datatable';

import Swal from 'sweetalert2';

interface UploadProofRecord {
  bookingId: string;
  instrumentName: string;
  noOfSamples: number;
  totalCharges: number;
  requestDate: string;
  proofRemarks: string;
  isProofApproved: string;
  proofApprovedOn: string | null;
  receiptProofFile: string | null;
  [key: string]: unknown;
}

interface ApiResponse {
  item1: UploadProofRecord[];
}

@Component({
  selector: 'app-upload-proof-status',
  templateUrl: './UploadProofStatus.component.html',
  styleUrls: ['./UploadProofStatus.component.scss'],
})
export class UploadProofStatusComponent implements OnInit {
  // Template references
  @ViewChild('dataTable') dataTable!: ElementRef<HTMLTableElement>;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Search
  searchQuery = '';

  // Data
  uploadProofStatusData: UploadProofRecord[] = [];
  filteredData: UploadProofRecord[] = [];

  // UI State
  loadingIndicator = false;

  // User info
  userId = '';
  userRole = '';
  userEmail = '';

  // Modal data
  samplesCase: UploadProofRecord | null = null;

  // Server config
  private readonly serverUrl = 'https://files.lpu.in/umsweb/CIFDocuments/';

  // Column definitions
  readonly displayedColumns = [
    'instrumentName',
    'analysisType',
    'analysisCharges',
    'noOfSamples',
    'totalCharges',
    'remarks',
    'SamplesRequestDate',
    'Uploaded Proof',
  ];

  ColumnMode = ColumnMode;
  columns: string[] = [];
  Math = Math;

  viewDocument(url: string): void {
    if (!url) {
      Swal.fire('Notice', 'No document found for this record.', 'info');
      return;
    }
    this.onDownloadFile(url);
  }

  downloadFile(fileName: any): void {
    if (!fileName) {
      Swal.fire('Notice', 'No document found for this record.', 'info');
      return;
    }
    this.onDownloadFile(fileName);
  }

  onDownloadFile(remoteUrl: string): void {
    if (!remoteUrl) {
      Swal.fire('Notice', 'No document found for this record.', 'info');
      return;
    }

    const fileName = remoteUrl.split('?')[0].split('/').pop() || 'Document.pdf';
    const directUrl =
      remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://')
        ? remoteUrl
        : `${this.serverUrl.replace(/\/+$/, '')}/${remoteUrl.replace(/^\/+/, '')}`;

    Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while your document is being fetched.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    const triggerBlobDownload = (blob: Blob, downloadFileName: string) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      Swal.close();
    };

    const fallbackDirectDownload = () => {
      fetch(directUrl)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const blob = await response.blob();
          triggerBlobDownload(blob, fileName);
        })
        .catch(() => {
          // If direct fetch is blocked by CORS or fails, download/open via direct link
          const link = document.createElement('a');
          link.href = directUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Swal.close();
        });
    };

    // The backend CIFDownloadFiles API combines BaseUrl with the file name.
    // Try downloading via fileName first; if it returns 400 or fails, try directUrl before falling back directly.
    this.cifWebService.downloadFile(fileName).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0 && blob.type !== 'application/json') {
          triggerBlobDownload(blob, fileName);
        } else {
          fallbackDirectDownload();
        }
      },
      error: () => {
        if (remoteUrl !== fileName) {
          this.cifWebService.downloadFile(directUrl).subscribe({
            next: (blob: Blob) => {
              if (blob && blob.size > 0 && blob.type !== 'application/json') {
                triggerBlobDownload(blob, fileName);
              } else {
                fallbackDirectDownload();
              }
            },
            error: () => {
              fallbackDirectDownload();
            },
          });
        } else {
          fallbackDirectDownload();
        }
      },
    });
  }

  constructor(
    private cifWebService: LpuCIFWebService,
    private storageService: StorageService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private authSession: LoginSessionService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) {}
  UserRole: any;
  candidateName: any;
  MobileNo: any;
  ngOnInit(): void {
    // this.loadUserFromCookie();

    const GetCookieData = this.cookieService.get('InternalUserAuthData');
    if (GetCookieData) {
      try {
        const retrievedCookies = JSON.parse(GetCookieData);
        this.UserRole = retrievedCookies.UserRole;
        this.userId = retrievedCookies.EmailId;
        this.userEmail = retrievedCookies.EmailId;
        this.candidateName = retrievedCookies.CandidateName;
        this.MobileNo = retrievedCookies.MobileNo;
      } catch (e) {
        console.error('Error parsing cookie in UploadProofStatus:', e);
      }
    }

    this.fetchPaymentProofDetails();
  }

  private loadUserFromCookie(): void {
    const cookieData = this.cookieService.get('InternalUserAuthData');
    if (cookieData) {
      const parsedData = JSON.parse(cookieData);
      this.userRole = parsedData.UserRole;
      this.userId = this.userEmail = parsedData.EmailId;
    }
  }

  private fetchPaymentProofDetails(): void {
    this.loadingIndicator = true;
    const startTime = Date.now();
    this.cifWebService.GetBookingPaymentProofDetails(this.userId).subscribe({
      next: (response: ApiResponse) => {
        this.handleApiResponse(response);
        this.ensureMinimumLoadingTime(startTime);
      },
      error: (error) => {
        console.error('Error fetching payment proof details:', error);
        this.loadingIndicator = false;
      },
    });
  }

  private handleApiResponse(response: ApiResponse): void {
    if (response.item1 && response.item1.length > 0) {
      this.uploadProofStatusData = response.item1;
      this.filteredData = [...this.uploadProofStatusData];
      this.initializeTableColumns();
    } else {
      this.uploadProofStatusData = [];
      this.filteredData = [];
    }
  }

  private initializeTableColumns(): void {
    if (this.filteredData.length > 0) {
      const firstRow = this.filteredData[0];
      this.columns = Object.keys(firstRow).filter(
        (key) => !['ResultFile', 'userId', 'id', 'analysisId'].includes(key),
      );
    }
  }

  private ensureMinimumLoadingTime(startTime: number): void {
    const elapsed = Date.now() - startTime;
    const minimumDelay = 500;
    const remainingDelay = Math.max(minimumDelay - elapsed, 0);

    setTimeout(() => {
      this.loadingIndicator = false;
    }, remainingDelay);
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredData = [...this.uploadProofStatusData];
    } else {
      this.filteredData = this.uploadProofStatusData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(query),
        ),
      );
    }

    this.currentPage = 1;
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  getCurrentPageData(): UploadProofRecord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.hasPrevPage) {
      this.currentPage--;
    }
  }

  // Export to Excel
  exportToExcel(): void {
    const fileName = 'Payment_Proof_Details.xlsx';
    const exportedData = this.uploadProofStatusData.map((item) => ({
      BookingId: item.bookingId,
      InstrumentName: item.instrumentName,
      NumberOfSamples: item.noOfSamples,
      TotalCharges: item.totalCharges,
      RequestDate: item.requestDate,
      ProofRemarks: item.proofRemarks,
      Status: this.getStatusLabel(item.isProofApproved),
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportedData);
    const wscols = [
      { wpx: 120 },
      { wpx: 150 },
      { wpx: 120 },
      { wpx: 100 },
      { wpx: 120 },
      { wpx: 150 },
      { wpx: 100 },
    ];
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PaymentProof');

    const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blobData], { type: 'application/octet-stream' }),
    );
    link.download = fileName;
    link.click();
  }

  // Status helper
  getStatusLabel(isApproved: string | undefined): string {
    if (isApproved === '1') return 'Accepted';
    if (isApproved === '0') return 'Rejected';
    return 'Pending';
  }

  getStatusClass(isApproved: string | undefined): string {
    if (isApproved === '1') return 'status-accepted';
    if (isApproved === '0') return 'status-rejected';
    return 'status-pending';
  }

  // Check if data exists
  get hasData(): boolean {
    return this.uploadProofStatusData.length > 0;
  }

  get hasFilteredData(): boolean {
    return this.filteredData.length > 0;
  }
}
