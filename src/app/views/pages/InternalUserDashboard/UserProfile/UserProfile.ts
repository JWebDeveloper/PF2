import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import swal from 'sweetalert2';

import { Router } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { LoginSessionService } from 'src/app/_services/login-session.service';



@Component({
  selector: 'app-user-profile',
  templateUrl: './UserProfile.html',
  styleUrls: ['./UserProfile.scss'],
})
export class UserProfile implements OnInit {
  cifUserForm!: FormGroup;
  isForm1Submitted = false;
  isEditMode = false;
  UserDetails: any;
  isLoading = false;
  isSubmitted = false;
  submissionError = false;
  submissionSuccess = false;

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private CIFwebService: LpuCIFWebService,
    private routerLink: Router,
    private router: Router,
    private AuthSession: LoginSessionService,
  ) { }

  ngOnInit(): void {
    this.LoadPageDetails();
  }

  LoadPageDetails() {

    this.loadForm();
    this.populateUserData();

  }
  loadForm(): void {
    this.cifUserForm = this.fb.group({
      EmailId: [{ value: '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(150)]],
      CandidateName: ['', [Validators.required, Validators.maxLength(30)]],
      SupervisorName: ['', [Validators.required, Validators.maxLength(30)]],
      MobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      InstituteName: ['', [Validators.required, Validators.maxLength(30)]],
      DepartmentName: ['', [Validators.required, Validators.maxLength(30)]],
      IdProofType: ['', Validators.required],
      IdProofNumber: ['', [Validators.required, Validators.maxLength(15)]],
      Address: ['', [Validators.required, Validators.maxLength(150)]],
    });
  }

  populateUserData() {
    const GetCookieData = this.cookieService.get('InternalUserAuthData');
    if (!GetCookieData) {
        this.LogoutUser();
      // return;
    }
    const retrievedCookies = JSON.parse(GetCookieData);

    this.CIFwebService.CIFGetUserDetails(retrievedCookies.EmailId).subscribe({
      next: (data) => {
        this.UserDetails = data.item1[0];
        // console.log('User  Details:', JSON.stringify( this.UserDetails));

        this.cifUserForm.patchValue({
          EmailId: retrievedCookies.EmailId,
          CandidateName: this.UserDetails.candidateName || '',
          SupervisorName: this.UserDetails.supervisorName || '',
          MobileNumber: this.UserDetails.mobileNumber || '',
          InstituteName: this.UserDetails.organisation || '',
          DepartmentName: this.UserDetails.departmentName || '',
          IdProofType: this.UserDetails.idProofType || '',
          IdProofNumber: this.UserDetails.idProofNumber || '',
          Address: this.UserDetails.address || '',
        });

        // Disable form initially (view mode)
        this.cifUserForm.disable();
        this.cifUserForm.get('EmailId')?.disable(); // ensure email disabled
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
      }
    });
  }

  get form1() {
    return this.cifUserForm.controls;
  }

  onEdit() {
    this.isEditMode = true;
    this.isForm1Submitted = false;
    this.cifUserForm.enable();
    this.cifUserForm.get('EmailId')?.disable(); // keep email disabled
  }

  onUpdate() {
    this.isForm1Submitted = true;

    if (this.cifUserForm.valid) {
      this.isEditMode = false;
      this.cifUserForm.disable();
      this.cifUserForm.get('EmailId')?.disable();

      const updatedData = this.cifUserForm.getRawValue();
      // console.log('Updated profile:', updatedData);

      this.isSubmitted = true;
      this.isLoading = true;
      this.submissionError = false;
      this.submissionSuccess = false;

      const formData = new FormData();
      formData.append("CandidateName", updatedData.CandidateName);
      formData.append("SupervisorName", updatedData.SupervisorName);
      formData.append("MobileNumber", updatedData.MobileNumber);
      formData.append("InstituteName", updatedData.InstituteName);
      formData.append("DepartmentName", updatedData.DepartmentName);
      formData.append("IdProofType", updatedData.IdProofType);
      formData.append("IdProofNumber", updatedData.IdProofNumber);
      formData.append("Address", updatedData.Address);
      formData.append("UserEmail", updatedData.EmailId);

      this.CIFwebService.UpdateUserDetails(formData).subscribe({
        next: (data: any) => {
          const returnId = data.item1[0]['returnId'];
          const message = data.item1[0]['msg'];

          if (returnId === 1 || returnId === -1) {
            swal.fire({
              title: returnId === 1 ? 'Upload Successful' : 'Receipt Already Exists',
              text: returnId === 1 ? 'Receipt saved successfully!' : (message || 'A receipt has already been uploaded.'),
              icon: returnId === 1 ? 'success' : 'warning'
            }).then(() => {
              this.LoadPageDetails();

            });
          } else if (returnId === 0) {
            swal.fire({
              title: 'Upload Failed',
              text: message || 'Failed to upload receipt. Please try again.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false
            });
          }
        },
        error: (error: any) => {
          swal.fire({
            title: 'Error',
            text: 'Internal Server error',
            icon: 'error',
            showConfirmButton: false
          });
        }
      });

    } else {
      console.log('Form invalid');
    }
  }

  LogoutUser() {
    swal.fire({
      title: 'Logging out...',
      allowOutsideClick: false,
      didOpen: () => { },
    });

    this.cookieService.delete('InternalUserAuthData', '/');
    this.AuthSession.clearSession();

    this.router.navigate(['Home'], { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }
}
