import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import swal from 'sweetalert2';

import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { LoginSessionService } from 'src/app/_services/login-session.service';


import { LpuCIFWebServiceNewService } from 'src/app/_services/lpu-cifweb-new-way.service';

@Component({
    selector: 'app-AdminUpdateInstrumentPrice',
    templateUrl: './AdminUpdateInstrumentPrice.html',
    styleUrls: ['./AdminUpdateInstrumentPrice.scss']
})
export class AdminUpdateInstrumentPrice implements OnInit {
    formdata!: FormGroup;
    loadingIndicator = false;
    
    // Data Arrays
    InstrumentData: any[] = [];
    AnalysisData: any[] = [];
    InstrumentsDuration: any[] = [];
    Datagrid: any[] = [];
    
    // Selection Trackers
    selectedInstrumentId: number | null = null;
    selectedInstrumentName: string = '';
    selectedUserRole: string = '';
    user_Email: string = '';

    // Pagination properties
    currentPage = 1;
    itemsPerPage = 5;
    searchQuery: string = '';
    isAllSelected = false;

    // Items per page dropdown options
    itemsPerPageOptions = [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 },
      { label: 'All', value: 'all' }
    ];

    constructor(
        private fb: FormBuilder,
        private CIFwebService: LpuCIFWebService, private CIFwebServiceNew: LpuCIFWebServiceNewService,
        private AuthSession: LoginSessionService,
        private cookieService: CookieService,
        private router: Router,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadUserEmail();
        this.GetAllInstruments();
    }

    initForm(): void {
        this.formdata = this.fb.group({
            UserRoleS: ['Select', Validators.required],
            InstrumentName: ['Select', Validators.required],
            AnalysisId: ['Select', Validators.required],
            Duration: ['Select', Validators.required],
            Charges: [{ value: 0, disabled: false }],
            TotalAmount: [null, [Validators.required, Validators.min(1)]]
        });
    }

    loadUserEmail(): void {
        const GetCookieData = this.cookieService.get('authData');
        if (GetCookieData) {
            const retrievedCookies = JSON.parse(GetCookieData);
            this.user_Email = retrievedCookies.EmailId;
        }
    }

    GetAllInstruments(): void {
        this.loadingIndicator = true;
        this.CIFwebServiceNew.GetAllInstruments().subscribe({
        // this.CIFwebService.GetAllInstruments().subscribe({
            next: response => {
                this.InstrumentData = response.item1 || [];
                this.loadingIndicator = false;
            },
            error: () => this.loadingIndicator = false
        });
    }

    // --- Change Handlers with Chain Clearing ---

    onUserTypeChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        this.selectedUserRole = value;

        // Reset all dependent fields
        this.resetFromAnalysis();
        this.formdata.patchValue({ InstrumentName: 'Select' });
        this.AnalysisData = [];
    }

    onInstrumentChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        
        // Step 1: Clear everything downstream
        this.resetFromAnalysis();

        if (value !== 'Select') {
            const parts = value.split('-');
            this.selectedInstrumentId = parseInt(parts[0], 10);
            this.selectedInstrumentName = parts[1];
            this.loadAnalysisTypes(this.selectedInstrumentId);
        } else {
            this.AnalysisData = [];
        }
    }

    onAnalysisTypeChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        
        // Step 2: Clear duration and price
        this.resetFromDuration();

        if (value !== 'Select' && this.selectedUserRole && this.selectedUserRole !== 'Select') {
            this.loadDurationData(parseInt(value, 10));
        } else if (value !== 'Select') {
            swal.fire('Info', 'Please select User Type first', 'info');
            this.formdata.patchValue({ AnalysisId: 'Select' });
        }
    }
    selectedType :any;
    onDurationChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const analysisId = select.value;
        const typeName = select.options[select.selectedIndex].text;
        this.selectedType= typeName;
        // Step 3: Clear price only
        this.formdata.patchValue({ Charges: 0, TotalAmount: null });

        if (analysisId !== 'Select') {
            this.loadPrice(analysisId, typeName);
        }
    }

    // --- Private Reset Helpers ---

    private resetFromAnalysis(): void {
        this.formdata.patchValue({ AnalysisId: 'Select', Duration: 'Select', Charges: 0, TotalAmount: null });
        this.InstrumentsDuration = [];
    }

    private resetFromDuration(): void {
        this.formdata.patchValue({ Duration: 'Select', Charges: 0, TotalAmount: null });
        this.InstrumentsDuration = [];
    }

    // --- API Calls ---

    private loadAnalysisTypes(instrumentId: number): void {
        this.loadingIndicator = true;
        this.CIFwebServiceNew.GetAnalysisDetails(instrumentId).subscribe({
        // this.CIFwebService.GetAnalysisDetails(instrumentId).subscribe({
            next: res => {
                this.AnalysisData = res.item1 || [];
                this.loadingIndicator = false;
            },
            error: () => this.loadingIndicator = false
        });
    }

    private loadDurationData(analysisId: number): void {
        this.loadingIndicator = true;
        this.CIFwebServiceNew.GetAnalysisData(analysisId, this.selectedUserRole).subscribe({
        // this.CIFwebService.GetAnalysisData(analysisId, this.selectedUserRole).subscribe({
            next: res => {
                this.InstrumentsDuration = res.item1 || [];
                this.loadingIndicator = false;
            },
            error: () => this.loadingIndicator = false
        });
    }

    private loadPrice(analysisId: string, typeName: string): void {
        this.loadingIndicator = true;
        this.CIFwebServiceNew.GetDuationAndPrice(analysisId, this.selectedUserRole, typeName).subscribe({
        // this.CIFwebService.GetDuationAndPrice(analysisId, this.selectedUserRole, typeName).subscribe({
            next: res => {
                if (res.item1?.length > 0) {
                    const match = res.item1.find((i: any) => i.typeName === typeName);
                    const price = match ? match.price : 0;
                    
                    if (price === 'N/A' || price === 'NA') {
                        swal.fire('Warning', 'This analysis is not available for the selected User Type.', 'warning');
                        this.formdata.patchValue({ Charges: 0 });
                    } else {
                        this.formdata.patchValue({ Charges: price });
                    }
                }
                this.loadingIndicator = false;
            },
            error: () => this.loadingIndicator = false
        });
    }

    Addtogrid(): void {
        if (this.formdata.valid) {
            const vals = this.formdata.getRawValue();
            this.Datagrid.push({
                instrumentName: this.selectedInstrumentName,
                instrumentId: this.selectedInstrumentId,
                analysisId: vals.AnalysisId,
                duration: this.selectedType,
                oldPrice: vals.Charges,
                newPrice: vals.TotalAmount,
                userRole: vals.UserRoleS,
                email: this.user_Email
            });
            // alert(JSON.stringify(this.Datagrid))
            // console.log(JSON.stringify(this.Datagrid))
            swal.fire('Success', 'Price update added to list.', 'success');
        }
    }
}
