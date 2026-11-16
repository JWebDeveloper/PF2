import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from 'src/app/_services/storage.service';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { xmlBookingSlots } from 'src/app/_services/xmlBookingSlots.model';
import { INITIAL_DB_OFFLINE_BOOKING_KEYS } from 'src/app/_services/offline-booking-db.data';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export interface BookingRowItem {
  InstrumentName: string;
  AnalysisName: string;
  UserId: string;
  NoOfSamples: string;
  TotalCharges: string;
  Remarks: string;
  RequestDate: string;
  SCOperatorName: string;
  isDuplicate: boolean;
  duplicateType?: 'sheet' | 'database';
  duplicateOfIndex?: number;
  originalRowIndex: number;
}

const STORAGE_KEY_OFFLINE_BOOKINGS = 'CIF_OFFLINE_BOOKING_SUBMITTED_KEYS';

@Component({
  selector: 'app-a-offline-booking-upload',
  templateUrl: './AOfflineBookingUpload.component.html',
  styleUrls: ['./AOfflineBookingUpload.component.scss'],
})
export class AOfflineBookingUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  fileName: string = '';
  fileSizeText: string = '';
  isDragOver: boolean = false;
  fileDefaultDate: string = '';

  excelRows: BookingRowItem[] = [];
  filteredRows: BookingRowItem[] = [];
  columnHeaders: string[] = [
    'Status',
    'InstrumentName',
    'AnalysisName',
    'UserId',
    'NoOfSamples',
    'TotalCharges',
    'Remarks',
    'RequestDate',
    'SCOperatorName',
  ];
  searchQuery: string = '';
  statusFilter: 'all' | 'valid' | 'duplicate' | 'inDatabase' = 'all';

  // Duplicate detection stats
  duplicateCount: number = 0;
  sheetDuplicateCount: number = 0;
  dbDuplicateCount: number = 0;
  uniqueCount: number = 0;
  excludeDuplicates: boolean = true; // Forbid duplicates by default

  xmlData: string = '';
  createdBy: string = '31309';
  showXmlPreview: boolean = false;
  loading: boolean = false;
  uploadSuccess: boolean = false;
  uploadResponseMsg: string = '';
  insertedCount: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 25, 50, 100];

  constructor(
    private cifWebService: LpuCIFWebService,
    private storageService: StorageService,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.resolveCurrentUser();
  }

  private resolveCurrentUser(): void {
    try {
      const cookieData = this.cookieService.get('authData');
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        const resolved =
          parsed.Uid ||
          parsed.EmployeeCode ||
          parsed.LoginId ||
          parsed.userName ||
          parsed.EmailId ||
          '';
        if (resolved) {
          this.createdBy = String(resolved);
        }
      }
    } catch (e) {
      console.warn('Could not read authData cookie:', e);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  onFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Format',
        text: 'Please select an Excel file (.xlsx, .xls) or CSV file.',
      });
      this.resetFileInput();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size exceeds 10MB limit.',
      });
      this.resetFileInput();
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.fileSizeText = this.formatBytes(file.size);
    this.fileDefaultDate = this.toDateMidnight(new Date());
    this.uploadSuccess = false;
    this.uploadResponseMsg = '';
    this.insertedCount = 0;

    this.parseExcel(file);
  }

  private parseExcel(file: File): void {
    this.loading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd hh:mm:ss',
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Workbook contains no sheets.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          raw: false,
        });

        if (!rawRows || rawRows.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Empty Sheet',
            text: 'The uploaded Excel sheet contains no data rows.',
          });
          this.reset();
          return;
        }

        // Map and detect duplicate rows against both in-sheet & previously submitted database records
        this.processRowsWithDuplicateDetection(rawRows);

        // Generate XML payload (strictly excluding duplicates if option is active)
        this.refreshXmlData();

        if (this.duplicateCount > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Duplicates Identified',
            html: `
              <div class="text-start">
                <p>Total Rows: <strong>${this.excelRows.length}</strong></p>
                <p class="text-danger mb-1">
                  <strong>${this.duplicateCount}</strong> duplicate record(s) detected:
                </p>
                <ul class="text-muted small">
                  ${
                    this.dbDuplicateCount > 0
                      ? `<li><strong>${this.dbDuplicateCount}</strong> already exist in the database from previous submit.</li>`
                      : ''
                  }
                  ${
                    this.sheetDuplicateCount > 0
                      ? `<li><strong>${this.sheetDuplicateCount}</strong> duplicated within this Excel sheet.</li>`
                      : ''
                  }
                </ul>
                <p class="small text-muted mb-0">
                  Target unique rows to upload: <strong>${this.uniqueCount}</strong>
                </p>
              </div>
            `,
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Sheet Parsed',
            text: `Loaded ${this.excelRows.length} distinct booking records ready for upload.`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (err: any) {
        console.error('Error parsing Excel:', err);
        Swal.fire({
          icon: 'error',
          title: 'Parsing Failed',
          text: err.message || 'Failed to read Excel file contents.',
        });
        this.reset();
      } finally {
        this.loading = false;
      }
    };

    reader.onerror = () => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'File Read Error',
        text: 'Failed to read the file from disk.',
      });
      this.reset();
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Generates a composite business signature: (UserId, InstrumentName, AnalysisName)
   * This identifies a unique offline booking row regardless of dynamic submission timestamps.
   */
  private getRowSignature(row: BookingRowItem): string {
    return [
      (row.UserId || '').toUpperCase().trim(),
      (row.InstrumentName || '').toUpperCase().trim(),
      (row.AnalysisName || '').toUpperCase().trim(),
    ].join('|');
  }

  /**
   * Generates a date-aware signature if RequestDate is explicitly specified
   */
  private getFullSignature(row: BookingRowItem): string {
    const datePart = row.RequestDate ? row.RequestDate.trim().substring(0, 10) : '';
    return [
      (row.UserId || '').toUpperCase().trim(),
      (row.InstrumentName || '').toUpperCase().trim(),
      (row.AnalysisName || '').toUpperCase().trim(),
      datePart,
    ].join('|');
  }

  /**
   * Retrieves all known database booking signatures from:
   * 1. Persistent dbo.CIFOfflineBookingSlotMater database baseline (INITIAL_DB_OFFLINE_BOOKING_KEYS)
   * 2. Local storage submitted history
   */
  private getAllDbSignatures(): Set<string> {
    const set = new Set<string>();

    // 1. Database table baseline records
    if (INITIAL_DB_OFFLINE_BOOKING_KEYS && Array.isArray(INITIAL_DB_OFFLINE_BOOKING_KEYS)) {
      INITIAL_DB_OFFLINE_BOOKING_KEYS.forEach((key) => {
        if (key) set.add(key.toUpperCase().trim());
      });
    }

    // 2. Previously submitted records in local storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_BOOKINGS);
      if (stored) {
        const arr: string[] = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach((k) => {
            if (k) set.add(String(k).toUpperCase().trim());
          });
        }
      }
    } catch (e) {
      console.warn('Could not read submitted booking keys:', e);
    }

    return set;
  }

  /**
   * Persists newly submitted signatures into local storage
   */
  private saveSubmittedSignatures(signatures: string[]): void {
    try {
      const existing = this.getAllDbSignatures();
      signatures.forEach((sig) => existing.add(sig.toUpperCase().trim()));
      localStorage.setItem(
        STORAGE_KEY_OFFLINE_BOOKINGS,
        JSON.stringify(Array.from(existing)),
      );
    } catch (e) {
      console.warn('Could not save submitted booking keys:', e);
    }
  }

  /**
   * Identifies and marks duplicate rows within the uploaded sheet AND against database table
   */
  private processRowsWithDuplicateDetection(rawRows: any[]): void {
    const existingDbSignatures = this.getAllDbSignatures();
    const seenInSheet = new Map<string, number>(); // signature -> first row index

    this.excelRows = [];
    this.sheetDuplicateCount = 0;
    this.dbDuplicateCount = 0;

    rawRows.forEach((row, index) => {
      const normalized = this.normalizeRow(row, index);
      const bizSig = this.getRowSignature(normalized);
      const fullSig = this.getFullSignature(normalized);

      // 1. Check if already stored in database from previous submit
      if (existingDbSignatures.has(bizSig) || existingDbSignatures.has(fullSig)) {
        normalized.isDuplicate = true;
        normalized.duplicateType = 'database';
        this.dbDuplicateCount++;
      }
      // 2. Check if duplicated within the current sheet
      else if (seenInSheet.has(bizSig)) {
        normalized.isDuplicate = true;
        normalized.duplicateType = 'sheet';
        normalized.duplicateOfIndex = seenInSheet.get(bizSig)! + 1; // 1-based index
        this.sheetDuplicateCount++;
      }
      // 3. Valid unique row
      else {
        normalized.isDuplicate = false;
        seenInSheet.set(bizSig, index);
      }

      this.excelRows.push(normalized);
    });

    this.duplicateCount = this.dbDuplicateCount + this.sheetDuplicateCount;
    this.uniqueCount = this.excelRows.length - this.duplicateCount;
    this.applyFilters();
  }

  private normalizeRow(row: any, index: number): BookingRowItem {
    const findVal = (aliases: string[]): string => {
      for (const alias of aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const rowKey of Object.keys(row)) {
          const cleanRowKey = rowKey.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanRowKey === cleanAlias) {
            const val = row[rowKey];
            if (val !== undefined && val !== null) {
              return String(val).trim();
            }
          }
        }
      }
      return '';
    };

    const instrumentName = findVal([
      'InstrumentName',
      'Instrument',
      'Instrument_Name',
      'InstrumentId',
    ]);
    const analysisName = findVal([
      'AnalysisName',
      'Analysis',
      'Analysis_Name',
      'AnalysisType',
      'AnalysisId',
    ]);
    const userId = findVal([
      'UserId',
      'User_Id',
      'UserEmail',
      'UserEmailId',
      'Email',
      'EmailId',
      'User',
    ]);
    const noOfSamples =
      findVal(['NoOfSamples', 'No_Of_Samples', 'NumberOfSamples', 'Samples']) ||
      '1';
    const totalCharges =
      findVal([
        'TotalCharges',
        'Total_Charges',
        'TotalAmount',
        'Charges',
        'Amount',
      ]) || '0';
    const remarks = findVal(['Remarks', 'Remark', 'Comments', 'Comment']);
    const rawDate = findVal([
      'RequestDate',
      'Request_Date',
      'BookingDate',
      'Date',
      'BookingRequestDate',
    ]);
    const scOperatorName = findVal([
      'SCOperatorName',
      'OperatorName',
      'Operator',
      'SCOperator',
      'Operator_Name',
    ]);

    return {
      InstrumentName: instrumentName,
      AnalysisName: analysisName,
      UserId: userId,
      NoOfSamples: noOfSamples,
      TotalCharges: totalCharges,
      Remarks: remarks,
      RequestDate: this.formatDateForSp(rawDate),
      SCOperatorName: scOperatorName,
      isDuplicate: false,
      originalRowIndex: index + 1,
    };
  }

  /**
   * Refreshes the XML payload. If excludeDuplicates is true, skips all duplicate rows.
   */
  refreshXmlData(): void {
    const rowsToInclude = this.excludeDuplicates
      ? this.excelRows.filter((r) => !r.isDuplicate)
      : this.excelRows;

    this.xmlData = this.buildBookingXml(rowsToInclude);
  }

  onExcludeDuplicatesToggle(): void {
    this.refreshXmlData();
  }

  private buildBookingXml(rows: BookingRowItem[]): string {
    let xml = '<dataset><data>';
    for (const row of rows) {
      xml += '<row>';
      xml += `<InstrumentName>${this.escapeXml(row.InstrumentName)}</InstrumentName>`;
      xml += `<AnalysisName>${this.escapeXml(row.AnalysisName)}</AnalysisName>`;
      xml += `<UserId>${this.escapeXml(row.UserId)}</UserId>`;
      xml += `<NoOfSamples>${this.escapeXml(row.NoOfSamples)}</NoOfSamples>`;
      xml += `<TotalCharges>${this.escapeXml(row.TotalCharges)}</TotalCharges>`;
      xml += `<Remarks>${this.escapeXml(row.Remarks)}</Remarks>`;
      xml += `<RequestDate>${this.escapeXml(row.RequestDate)}</RequestDate>`;
      if (row.SCOperatorName) {
        xml += `<SCOperatorName>${this.escapeXml(row.SCOperatorName)}</SCOperatorName>`;
      }
      xml += '</row>';
    }
    xml += '</data></dataset>';
    return xml;
  }

  private formatDateForSp(val: any): string {
    if (!val || String(val).trim() === '') {
      return this.fileDefaultDate || '2026-01-15 00:00:00';
    }

    const str = String(val).trim();

    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(str)) {
      return str;
    }

    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(str)) {
      return `${str.replace(/\//g, '-')} 00:00:00`;
    }

    const dmy = str.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
    );
    if (dmy) {
      const dd = dmy[1].padStart(2, '0');
      const mm = dmy[2].padStart(2, '0');
      const yyyy = dmy[3];
      const hh = (dmy[4] || '00').padStart(2, '0');
      const min = (dmy[5] || '00').padStart(2, '0');
      const ss = (dmy[6] || '00').padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return this.toDateMidnight(parsed);
    }

    return str;
  }

  private toDateMidnight(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  }

  private toSpDateTime(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  private escapeXml(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  setStatusFilter(filter: 'all' | 'valid' | 'duplicate' | 'inDatabase'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.excelRows];

    // Status filter
    if (this.statusFilter === 'valid') {
      result = result.filter((r) => !r.isDuplicate);
    } else if (this.statusFilter === 'duplicate') {
      result = result.filter((r) => r.isDuplicate);
    } else if (this.statusFilter === 'inDatabase') {
      result = result.filter((r) => r.duplicateType === 'database');
    }

    // Search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (row) =>
          row.InstrumentName.toLowerCase().includes(q) ||
          row.AnalysisName.toLowerCase().includes(q) ||
          row.UserId.toLowerCase().includes(q) ||
          row.Remarks.toLowerCase().includes(q) ||
          row.RequestDate.toLowerCase().includes(q) ||
          row.SCOperatorName.toLowerCase().includes(q),
      );
    }

    this.filteredRows = result;
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.itemsPerPage) || 1;
  }

  get paginatedRows(): BookingRowItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = Number(event.target.value);
    this.currentPage = 1;
  }

  uploadOfflineBookings(): void {
    if (!this.excelRows || this.excelRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data To Upload',
        text: 'Please choose and parse an Excel sheet first.',
      });
      return;
    }

    this.refreshXmlData();

    const uploadRowsCount = this.excludeDuplicates
      ? this.uniqueCount
      : this.excelRows.length;

    if (uploadRowsCount === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'All Rows Are Duplicates',
        html: `
          <p>All <strong>${this.excelRows.length}</strong> records already exist in the database table or are duplicated.</p>
          <p class="text-muted small">0 unique records available for upload.</p>
        `,
      });
      return;
    }

    let confirmationHtml = `
      <p>Ready to upload <strong>${uploadRowsCount}</strong> record(s) to the CIF database.</p>
    `;

    if (this.excludeDuplicates && this.duplicateCount > 0) {
      confirmationHtml += `
        <div class="alert alert-warning text-start py-2 px-3 small">
          <strong>Note:</strong> ${this.duplicateCount} duplicate row(s)
          (${this.dbDuplicateCount} in database, ${this.sheetDuplicateCount} in sheet)
          will be <strong>skipped</strong>.
        </div>
      `;
    }

    confirmationHtml += `
      <p class="text-muted small mb-0">CreatedBy: <strong>${this.createdBy || '31309'}</strong></p>
    `;

    Swal.fire({
      title: 'Confirm Offline Booking Upload',
      html: confirmationHtml,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Upload to Database',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeUpload();
      }
    });
  }

  private executeUpload(): void {
    this.loading = true;

    const payload: xmlBookingSlots = {
      bookingSlotData: this.xmlData,
      CreatedBy: this.createdBy ? this.createdBy.trim() : '31309',
    };

    this.cifWebService.AddCIFBookingDetailsUsingExcelSheet(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('Upload response:', res);

        const item = res?.item1?.[0] || res?.[0] || res?.data?.[0] || res;
        const returnData = item?.returnData ?? item?.ReturnData;
        const msg = item?.msg ?? item?.Msg ?? 'Operation completed';
        const inserted = Number(
          item?.insertedCount ?? item?.InsertedCount ?? 0,
        );

        // CASE 1: Records were newly inserted
        if (inserted > 0) {
          this.uploadSuccess = true;
          this.uploadResponseMsg = msg;
          this.insertedCount = inserted;

          // Save newly submitted signatures to local storage
          const submittedSignatures = this.excelRows
            .filter((r) => !r.isDuplicate)
            .map((r) => this.getRowSignature(r));
          this.saveSubmittedSignatures(submittedSignatures);

          // Mark those rows as now in database
          this.excelRows.forEach((r) => {
            if (!r.isDuplicate) {
              r.isDuplicate = true;
              r.duplicateType = 'database';
            }
          });
          this.dbDuplicateCount += inserted;
          this.duplicateCount = this.excelRows.length;
          this.uniqueCount = 0;
          this.applyFilters();
          this.refreshXmlData();

          Swal.fire({
            icon: 'success',
            title: 'Upload Successful!',
            html: `
              <div class="text-center">
                <h5 class="text-success mb-2">${msg}</h5>
                <p class="fs-6">Inserted Count: <strong>${inserted}</strong> record(s)</p>
                ${
                  this.duplicateCount > 0
                    ? `<p class="text-muted small">All records now stored in database table.</p>`
                    : ''
                }
              </div>
            `,
          });
        }
        // CASE 2: 0 records inserted because database table already had them
        else if (inserted === 0 && returnData === 'success') {
          // The database confirmed all rows already exist in dbo.CIFOfflineBookingSlotMater!
          const allSignatures = this.excelRows.map((r) =>
            this.getRowSignature(r),
          );
          this.saveSubmittedSignatures(allSignatures);

          // Mark ALL rows as database duplicates
          this.excelRows.forEach((r) => {
            r.isDuplicate = true;
            r.duplicateType = 'database';
          });
          this.dbDuplicateCount = this.excelRows.length;
          this.sheetDuplicateCount = 0;
          this.duplicateCount = this.excelRows.length;
          this.uniqueCount = 0;
          this.applyFilters();
          this.refreshXmlData();

          Swal.fire({
            icon: 'info',
            title: 'Records Already in Database',
            html: `
              <div class="text-start">
                <p><strong>Response:</strong> ${msg}</p>
                <div class="alert alert-warning py-2 px-3 small mb-2">
                  All <strong>${this.excelRows.length}</strong> records in this sheet already exist in the database table <code>dbo.CIFOfflineBookingSlotMater</code> from previous submit.
                </div>
                <p class="text-muted small mb-0">
                  The stored procedure skipped them and inserted <strong>0 new records</strong>.
                  All rows are now flagged as <em>Already in Database</em>.
                </p>
              </div>
            `,
          });
        }
        // CASE 3: Error
        else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: msg || 'Database returned an error.',
          });
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('API Error during Excel Upload:', err);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text:
            err?.error?.message ||
            err?.message ||
            'Failed to upload booking details.',
        });
      },
    });
  }

  /**
   * Clears the cached database signatures
   */
  clearSubmittedHistory(): void {
    Swal.fire({
      title: 'Clear Duplicate History Cache?',
      text: 'This will reset the saved record signatures from previous submits.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clear Cache',
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem(STORAGE_KEY_OFFLINE_BOOKINGS);
        if (this.selectedFile) {
          this.processFile(this.selectedFile);
        }
        Swal.fire('Cache Cleared', 'Previously submitted records cache has been cleared.', 'success');
      }
    });
  }

  downloadSampleTemplate(): void {
    const templateData = [
      {
        InstrumentName: 'FESEM',
        AnalysisName: 'Imaging',
        UserId: 'user1@example.com',
        NoOfSamples: 3,
        TotalCharges: 1500.5,
        Remarks: 'Test booking 1',
        RequestDate: '2026-11-10 10:30:00',
        SCOperatorName: 'Operator A',
      },
      {
        InstrumentName: 'XRD',
        AnalysisName: 'Phase Analysis',
        UserId: 'user2@example.com',
        NoOfSamples: 1,
        TotalCharges: 800,
        Remarks: 'XRD offline measurement',
        RequestDate: '2026-11-11 14:00:00',
        SCOperatorName: 'Operator B',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OfflineBookings');

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 25 },
      { wch: 14 },
      { wch: 15 },
      { wch: 25 },
      { wch: 22 },
      { wch: 20 },
    ];

    XLSX.writeFile(workbook, 'CIF_Offline_Booking_Template.xlsx');
  }

  toggleXmlPreview(): void {
    if (this.excelRows.length > 0) {
      this.refreshXmlData();
    }
    this.showXmlPreview = !this.showXmlPreview;
  }

  reset(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSizeText = '';
    this.excelRows = [];
    this.filteredRows = [];
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.duplicateCount = 0;
    this.sheetDuplicateCount = 0;
    this.dbDuplicateCount = 0;
    this.uniqueCount = 0;
    this.xmlData = '';
    this.showXmlPreview = false;
    this.uploadSuccess = false;
    this.uploadResponseMsg = '';
    this.insertedCount = 0;
    this.currentPage = 1;
    this.resetFileInput();
  }

  private resetFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
