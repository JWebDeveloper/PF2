import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { LpuCIFWebServiceNewService } from 'src/app/_services/lpu-cifweb-new-way.service';

@Component({
  selector: 'app-NewAnalysis',
  templateUrl: './New-Analysis.html',
  styleUrls: ['./New-Analysis.scss']
})
export class NewAnalysis implements OnInit {
  formdata!: FormGroup;
  loadingIndicator = false;
  isSubmitting = false;

  // Master & Selected Instrument Data
  InstrumentData: any[] = [];
  ExistingAnalyses: any[] = [];
  selectedInstrumentId: number | null = null;
  selectedInstrumentName: string = '';
  user_Email: string = '';

  // Filter for existing analyses table
  searchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    private CIFwebService: LpuCIFWebService,
    private CIFwebServiceNew: LpuCIFWebServiceNewService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserEmail();
    this.initForm();
    this.GetAllInstruments();
  }

  // --- Form Initialization & FormArray Helpers ---

  initForm(): void {
    this.formdata = this.fb.group({
      InstrumentId: ['', [Validators.required, this.instrumentSelectedValidator]],
      analyses: this.fb.array([
        this.createAnalysisRow()
      ])
    });
  }

  get analysesArray(): FormArray {
    return this.formdata.get('analyses') as FormArray;
  }

  createAnalysisRow(initialValue: string = ''): FormGroup {
    return this.fb.group({
      analysisType: [initialValue, [Validators.required, this.notEmptyValidator]]
    });
  }

  addAnalysisRow(initialValue: string = ''): void {
    this.analysesArray.push(this.createAnalysisRow(initialValue));
  }

  removeAnalysisRow(index: number): void {
    if (this.analysesArray.length > 1) {
      this.analysesArray.removeAt(index);
    } else {
      // If only 1 row left, clear its text
      this.analysesArray.at(0).reset({ analysisType: '' });
    }
  }

  clearAllAnalyses(): void {
    while (this.analysesArray.length > 0) {
      this.analysesArray.removeAt(0);
    }
    this.addAnalysisRow();
  }

  // --- Validators ---

  private instrumentSelectedValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val || val === 'Select' || val === '') {
      return { required: true };
    }
    return null;
  }

  private notEmptyValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      return { emptyOrWhitespace: true };
    }
    return null;
  }

  // --- Session & Master Data ---

  loadUserEmail(): void {
    const getCookieData = this.cookieService.get('authData');
    if (getCookieData && getCookieData.length > 0) {
      try {
        const retrievedCookies = JSON.parse(getCookieData);
        this.user_Email = retrievedCookies.EmailId || '';
      } catch (e) {
        console.error('Failed to parse auth cookie:', e);
      }
    }
  }

  GetAllInstruments(): void {
    this.loadingIndicator = true;
    this.CIFwebServiceNew.GetAllInstruments().subscribe({
      next: (response: any) => {
        this.InstrumentData = response.item1 || [];
        this.loadingIndicator = false;
      },
      error: (err: any) => {
        console.error('Error fetching instruments:', err);
        this.loadingIndicator = false;
      }
    });
  }

  // --- Instrument Selection Handler ---

  onInstrumentChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (value && value !== 'Select' && value !== '') {
      const parts = value.split('-');
      this.selectedInstrumentId = parseInt(parts[0], 10);
      this.selectedInstrumentName = parts.slice(1).join('-');
      this.loadExistingAnalyses(this.selectedInstrumentId);
    } else {
      this.selectedInstrumentId = null;
      this.selectedInstrumentName = '';
      this.ExistingAnalyses = [];
    }
  }

  loadExistingAnalyses(instrumentId: number): void {
    this.loadingIndicator = true;
    this.CIFwebServiceNew.GetAnalysisDetails(instrumentId).subscribe({
      next: (res: any) => {
        this.ExistingAnalyses = res.item1 || [];
        this.loadingIndicator = false;
      },
      error: (err: any) => {
        console.error('Error fetching existing analyses:', err);
        this.ExistingAnalyses = [];
        this.loadingIndicator = false;
      }
    });
  }

  // --- Helpers & Visual Validation for Template ---

  isDuplicateEntry(index: number): boolean {
    const currentVal = (this.analysesArray.at(index)?.get('analysisType')?.value || '').trim().toLowerCase();
    if (!currentVal) return false;

    return this.analysesArray.controls.some((ctrl, i) => {
      if (i === index) return false;
      const otherVal = (ctrl.get('analysisType')?.value || '').trim().toLowerCase();
      return otherVal === currentVal;
    });
  }

  alreadyExistsInDb(index: number): boolean {
    const currentVal = (this.analysesArray.at(index)?.get('analysisType')?.value || '').trim().toLowerCase();
    if (!currentVal || !this.ExistingAnalyses || this.ExistingAnalyses.length === 0) return false;

    return this.ExistingAnalyses.some(a =>
      (a.analysisType || '').toString().trim().toLowerCase() === currentVal
    );
  }

  get validRowsCount(): number {
    return this.analysesArray.controls.filter(ctrl => {
      const val = (ctrl.get('analysisType')?.value || '').trim();
      return val.length > 0;
    }).length;
  }

  get filteredExistingAnalyses(): any[] {
    if (!this.searchQuery.trim()) {
      return this.ExistingAnalyses;
    }
    const term = this.searchQuery.toLowerCase().trim();
    return this.ExistingAnalyses.filter(a =>
      (a.analysisType || '').toLowerCase().includes(term) ||
      (a.analysisId || '').toString().toLowerCase().includes(term)
    );
  }

  resetForm(): void {
    this.formdata.reset({
      InstrumentId: ''
    });
    this.selectedInstrumentId = null;
    this.selectedInstrumentName = '';
    this.ExistingAnalyses = [];
    this.clearAllAnalyses();
  }

  // --- Insertion Logic ---

  submitNewAnalyses(): void {
    if (!this.selectedInstrumentId) {
      swal.fire('Warning', 'Please select an Instrument first.', 'warning');
      return;
    }

    // Extract non-empty analysis names
    const enteredValues: string[] = this.analysesArray.controls
      .map(ctrl => (ctrl.get('analysisType')?.value || '').trim())
      .filter(val => val.length > 0);

    if (enteredValues.length === 0) {
      swal.fire('Warning', 'Please enter at least one analysis type name before saving.', 'warning');
      return;
    }

    // Check for duplicates inside the entered list
    const lowerValues = enteredValues.map(v => v.toLowerCase());
    const hasDuplicates = lowerValues.some((item, index) => lowerValues.indexOf(item) !== index);
    if (hasDuplicates) {
      swal.fire('Duplicate Entries Found', 'You have entered identical analysis names in the list. Please remove duplicates before saving.', 'warning');
      return;
    }

    // Confirm with user
    swal.fire({
      title: 'Confirm New Analysis',
      html: `You are about to add <b>${enteredValues.length}</b> analysis type(s) for <b>${this.selectedInstrumentName}</b>.<br><br>Do you want to proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef7d00',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Save Analysis',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.executeInsertion(enteredValues);
      }
    });
  }

  private executeInsertion(analysisTypes: string[]): void {
    this.isSubmitting = true;
    this.loadingIndicator = true;

    // Create an observable request for each analysis type
    const requests = analysisTypes.map(analysisType => {
      const formData = new FormData();
      formData.append('AnalysisType', analysisType);
      formData.append('InstrumentId', this.selectedInstrumentId!.toString());
      formData.append('InstrumentID', this.selectedInstrumentId!.toString());

      return this.CIFwebService.InsertNewAnalysis(formData).pipe(
        catchError(err => {
          console.error(`Error inserting analysis "${analysisType}":`, err);
          return of({ error: true, analysisType, message: err?.message || 'Network error' });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        this.loadingIndicator = false;
        this.isSubmitting = false;

        let successCount = 0;
        const failedTypes: string[] = [];

        results.forEach((res, idx) => {
          const typeName = analysisTypes[idx];
          const msg = res?.item1?.[0]?.Msg || res?.item1?.[0]?.msg;
          const isSuccess = !res?.error && (msg === 'success' || msg === '1');

          if (isSuccess) {
            successCount++;
          } else {
            failedTypes.push(typeName);
          }
        });

        if (successCount === analysisTypes.length) {
          swal.fire({
            title: 'Analysis Added!',
            text: `Successfully added ${successCount} analysis type(s) for "${this.selectedInstrumentName}".`,
            icon: 'success',
            confirmButtonColor: '#ef7d00'
          });

          // Refresh existing list and reset input rows
          this.loadExistingAnalyses(this.selectedInstrumentId!);
          this.clearAllAnalyses();
        } else if (successCount > 0) {
          swal.fire({
            title: 'Partial Insertion',
            html: `<b>${successCount}</b> analysis type(s) added successfully.<br><b>${failedTypes.length}</b> failed: ${failedTypes.join(', ')}.`,
            icon: 'warning',
            confirmButtonColor: '#ef7d00'
          });

          this.loadExistingAnalyses(this.selectedInstrumentId!);

          // Retain only failed types in the form for user to review and retry
          while (this.analysesArray.length > 0) {
            this.analysesArray.removeAt(0);
          }
          failedTypes.forEach(t => this.addAnalysisRow(t));
        } else {
          swal.fire({
            title: 'Insertion Failed',
            text: 'Unable to add analysis types. Please verify that parameters are valid and not already registered.',
            icon: 'error',
            confirmButtonColor: '#ef7d00'
          });
        }
      },
      error: (err: any) => {
        this.loadingIndicator = false;
        this.isSubmitting = false;
        console.error('Batch insert error:', err);
        swal.fire({
          title: 'System Error',
          text: 'An unexpected error occurred while communicating with the server.',
          icon: 'error',
          confirmButtonColor: '#ef7d00'
        });
      }
    });
  }
}
