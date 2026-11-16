import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { LpuCIFWebService } from 'src/app/_services/lpu-cifweb.service';
import { LoginSessionService } from 'src/app/_services/login-session.service';
import { CookieService } from 'ngx-cookie-service';

import { LpuCIFWebServiceNewService } from 'src/app/_services/lpu-cifweb-new-way.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-StaffUserlogin',
  templateUrl: './StaffUser-login.component.html',
  styleUrls: ['./StaffUser-login.component.scss'],
})
export class StaffUserLoginComponent implements OnInit {
  @ViewChild('table') table: ElementRef;
  @ViewChild('facilitiesSection') facilitiesSection!: ElementRef;
  gotoFacilities() {
    this.facilitiesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  formdata!: FormGroup;
  submitted = false;
  showPassword = false;
  loginError: string | null = null;
  isLoginFailed = false;
  showNoDataFoundMessage = false;
  loadingIndicator = false;
  storeResult = 0;
  CandidateName: any;
  UserId: any;
  Department: any;
  DepartmentName: any;
  Designation: any;
  EmailId: any;
  MobileNo: any;
  UserRole: any;
  SupervisorName: any;
  SecretKey: any;
  EmployeeDetails: any;
  EmployeeName: any;
  EmployeeCode: any;
  ErrMessage: any = '';
  serverConnectionError = false;
  constructor(
    private fb: FormBuilder,
    private CIFwebServiceNew: LpuCIFWebServiceNewService,
    private authService: AuthService,
    private storageService: StorageService,
    private CIFwebService: LpuCIFWebService,
    private AuthSession: LoginSessionService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.AuthSession.clearSession(); // Keep session clear on entry, not cookie
    this.loadForm();
  }

  loadForm(): void {
    this.formdata = this.fb.group({
      Email: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
    this.submitted = false;
    this.loginError = null;
  }

  get email(): AbstractControl | null {
    return this.formdata.get('Email');
  }

  get passwordText(): AbstractControl | null {
    return this.formdata.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  OnSubmit(): void {
    if (this.formdata.invalid) return;

    const { Email, password } = this.formdata.value;
    const encodedEmail = btoa(Email ?? '');
    const encodedPassword = btoa(password ?? '');
    this.SecretKey = password ?? '';

    this.getToken(encodedEmail, encodedPassword);
  }

  getToken(encodedEmail: string, encodedPassword: string): void {
    this.authService
      .loginInternalUser(atob(encodedEmail), atob(encodedPassword))
      .subscribe({
        next: (data) => {
          this.storageService.saveUser(data.token);
          // this.GetEmployeeDetails();
          this.getAllCifUserList();
          this.GetEmployeeDetails(encodedEmail);
        },
        error: (err) => {
          this.handleLoginFailure(err);
        },
      });
  }
  AllCifUserList: any[] = [];
  AllallowedIds: string[] = [];

  AdditionalAllowedIds: string[] = ['31309'];

  getAllCifUserList(): void {
    this.CIFwebService.GetAllUserLists().subscribe({
      next: (response) => {
        if (response.item1 && response.item1.length > 0) {
          this.AllCifUserList = response.item1;

          // Extract all UIDs dynamically
          this.AllallowedIds = this.AllCifUserList.map((item: any) =>
            String(item.uid),
          );
        } else {
          this.AllCifUserList = [];
          this.AllallowedIds = [];
        }
      },
      error: (err) => {
        console.error('Failed to get UIDS:', err);
        this.AllCifUserList = [];
        this.AllallowedIds = [];
      },
    });
  }

  // [{"uid":"24374","name":"Dr. Vijay Kumar","uiD_Name":"Dr. Vijay Kumar 24374"},{"uid":"20362","name":"Dr. Nupur Prasad","uiD_Name":"Dr. Nupur Prasad 20362"},{"uid":"16477","name":"Prashant Kumar","uiD_Name":"Prashant Kumar 16477"},{"uid":"27727","name":"Dr. Nabaparna Chakraborty","uiD_Name":"Dr. Nabaparna Chakraborty 27727"},{"uid":"26918","name":"Baljit Bangar","uiD_Name":"Baljit Bangar 26918"},{"uid":"30694","name":"Amandeep Kaur","uiD_Name":"Amandeep Kaur 30694"},{"uid":"29159","name":"Kamlash Rani","uiD_Name":"Kamlash Rani 29159"},{"uid":"31691","name":"Sameer Singh Pathania","uiD_Name":"Sameer Singh Pathania 31691"},{"uid":"33476","name":"Sanjeev Kumar Verma","uiD_Name":"Sanjeev Kumar Verma 33476"},{"uid":"34185","name":"Dr. Puneet","uiD_Name":"Dr. Puneet 34185"},{"uid":"34228","name":"Monika Kumari","uiD_Name":"Monika Kumari 34228"},{"uid":"35395","name":"Dr. Vandana Sharma","uiD_Name":"Dr. Vandana Sharma 35395"},{"uid":"35317","name":"Dr. Diksha Devi","uiD_Name":"Dr. Diksha Devi 35317"},{"uid":"35479","name":"Kajal Dadwal","uiD_Name":"Kajal Dadwal 35479"}]
  // GetEmployeeDetails(): void {
  //   this.mouDocumentsService.GetEmployeeDetails().subscribe({
  // GetEmployeeDetails(UserId: any) {
  //   this.CIFwebService.GetInternalUserDetails(UserId).subscribe({
  //     next: (response) => {
  //       if (response.item1 && response.item1.length > 0) {
  //         this.EmployeeDetails = response.item1;
  //         const emp = response.item1[0];

  //         this.CandidateName = this.EmployeeName = emp.employeeName;
  //         this.UserId = this.EmployeeCode = emp.employeeCode;
  //         this.Department = emp.department;
  //         this.DepartmentName = emp.departmentName;
  //         this.Designation = emp.department;
  //         this.EmailId = emp.email;
  //         this.MobileNo = emp.contactNo;
  //         this.UserRole = 'Admin-User';
  //         this.SupervisorName = emp.department;
  //         this.loadingIndicator = false;
  //         this.showNoDataFoundMessage = false;
  //         // const AllallowedIds = [
  //         //   { uid: '24374' },
  //         //   { uid: '20362' },
  //         //   { uid: '25760' },
  //         //   { uid: '34228' },
  //         //   { uid: '34185' },
  //         //   { uid: '16477' },
  //         //   { uid: '27727' },
  //         //   { uid: '27808' },
  //         //   { uid: '26918' },
  //         //   { uid: '30694' },
  //         //   { uid: '29159' },
  //         //   { uid: '31691' },
  //         //   { uid: '33476' },
  //         //   { uid: '31309' },
  //         // ];

  //         // const isAllowed = AllallowedIds.some(
  //         //   (item) => item.uid === this.EmployeeCode,
  //         // );
  //         const isAllowed = this.AllallowedIds.includes(
  //           String(this.EmployeeCode),
  //         );

  //         if (!isAllowed) {
  //           this.isLoginFailed = true;
  //           this.ErrMessage =
  //             'Not Authorised. This Dashboard is only for CIF Staff Members!';
  //         } else {
  //           // if (!isAllowed) {
  //           //   this.isLoginFailed = true;
  //           //   this.ErrMessage =
  //           //     'Not Authorised.  This Dashboard is only for CIF Staff Members!';
  //           // } else {
  //           const userCookiesData = {
  //             CandidateName: this.CandidateName,
  //             UserId: this.UserId,
  //             Department: this.Department,
  //             DepartmentName: this.DepartmentName,
  //             Designation: this.Designation,
  //             EmailId: this.EmailId,
  //             MobileNo: this.MobileNo,
  //             UserRole: this.UserRole,
  //             SupervisorName: this.SupervisorName,
  //             ProofNumber: this.MobileNo,
  //             ProofName: 'Mobile',
  //             PasswordText: this.SecretKey,
  //           };
  //           this.isLoginFailed = false;
  //           this.AuthSession.addToSession(this.EmployeeDetails);

  //           const UserCookies = JSON.stringify(userCookiesData);
  //           // this.cookieService.set('StaffUserAuthData', UserCookies);
  //           const expirationMinutes = 35; // Set expiration time in minutes
  //           const expirationDate = new Date();
  //           expirationDate.setMinutes(
  //             expirationDate.getMinutes() + expirationMinutes,
  //           ); // Set expiration time
  //           this.cookieService.set(
  //             'StaffUserAuthData',
  //             UserCookies,
  //             expirationDate, // Set the expiration date
  //             '/', // Path
  //             undefined, // Domain
  //             true, // Secure: should be true in production
  //             'Lax', // SameSite policy
  //           );
  //           // this.router.navigate(['/StaffActionBookings']);
  //         }
  //       } else {
  //         this.EmployeeDetails = [];
  //         this.showNoDataFoundMessage = true;
  //         this.isLoginFailed = true;
  //       }
  //     },
  //     error: (err) => {
  //       this.handleLoginFailure(err);
  //     },
  //   });

  //   this.formdata.reset();
  // }

  GetEmployeeDetails(UserId: any) {
    forkJoin({
      employee: this.CIFwebService.GetInternalUserDetails(UserId),
      cifUsers: this.CIFwebService.GetAllUserLists(),
    }).subscribe({
      next: (response) => {
        // Get dynamic CIF user list
        this.AllCifUserList = response.cifUsers?.item1 || [];

        // Extract API UIDs
        const ApiAllowedIds = this.AllCifUserList.map((item: any) =>
          String(item.uid).trim(),
        ).filter((uid: string) => uid && uid !== 'undefined');

        // Merge API UIDs with additional manually allowed IDs
        this.AllallowedIds = [
          ...new Set([
            ...ApiAllowedIds,
            ...this.AdditionalAllowedIds.map((id) => String(id).trim()),
          ]),
        ];

        // Employee details
        if (response.employee.item1 && response.employee.item1.length > 0) {
          this.EmployeeDetails = response.employee.item1;
          const emp = response.employee.item1[0];

          this.CandidateName = this.EmployeeName = emp.employeeName;
          this.UserId = this.EmployeeCode = emp.employeeCode;
          this.Department = emp.department;
          this.DepartmentName = emp.departmentName;
          this.Designation = emp.department;
          this.EmailId = emp.email;
          this.MobileNo = emp.contactNo;
          this.UserRole = 'Admin-User';
          this.SupervisorName = emp.department;

          this.loadingIndicator = false;
          this.showNoDataFoundMessage = false;

          // Authorization check
          const isAllowed = this.AllallowedIds.includes(
            String(this.EmployeeCode).trim(),
          );

          console.log('Employee Code:', this.EmployeeCode);
          console.log('Allowed IDs:', this.AllallowedIds);
          console.log('Is Authorized:', isAllowed);

          if (!isAllowed) {
            this.isLoginFailed = true;
            this.ErrMessage =
              'Not Authorised. This Dashboard is only for CIF Staff Members!';
          } else {
            const userCookiesData = {
              CandidateName: this.CandidateName,
              UserId: this.UserId,
              Department: this.Department,
              DepartmentName: this.DepartmentName,
              Designation: this.Designation,
              EmailId: this.EmailId,
              MobileNo: this.MobileNo,
              UserRole: this.UserRole,
              SupervisorName: this.SupervisorName,
              ProofNumber: this.MobileNo,
              ProofName: 'Mobile',
              PasswordText: this.SecretKey,
            };

            this.isLoginFailed = false;
            this.AuthSession.addToSession(this.EmployeeDetails);

            const UserCookies = JSON.stringify(userCookiesData);

            const expirationMinutes = 35;
            const expirationDate = new Date();

            expirationDate.setMinutes(
              expirationDate.getMinutes() + expirationMinutes,
            );

            this.cookieService.set(
              'StaffUserAuthData',
              UserCookies,
              expirationDate,
              '/',
              undefined,
              true,
              'Lax',
            );

            this.router.navigate(['/StaffActionBookings']);
          }
        } else {
          this.EmployeeDetails = [];
          this.showNoDataFoundMessage = true;
          this.isLoginFailed = true;
        }
      },

      error: (err) => {
        console.error('API Error:', err);
        this.handleLoginFailure(err);
      },
    });

    this.formdata.reset();
  }
  handleLoginFailure(error: any): void {
    this.cookieService.delete('StaffUserAuthData');
    this.AuthSession.clearSession();
    this.isLoginFailed = true;
    this.ErrMessage = 'Login Failed. Invalid Details.';

    swal.fire({
      title: 'Login Failed',
      text: 'Login details are invalid. Please try again.',
      icon: 'warning',
    });
  }

  StoreInternalUserInDataBase(): void {
    const formData = new FormData();
    formData.append('UserEmail', this.EmailId);
    formData.append('CandidateName', this.CandidateName);
    formData.append('SupervisorName', this.SupervisorName);
    formData.append('MobileNumber', this.MobileNo);
    formData.append('SchoolName', this.Department);
    formData.append('DepartmentName', this.DepartmentName);
    formData.append('IdProofType', 'UMSID');
    formData.append('IdProofNumber', this.UserId);
    formData.append('UserType', this.UserRole);
    formData.append('Address', 'Internal User');
    formData.append('PasswordText', btoa(this.SecretKey));

    this.CIFwebServiceNew.NewUserRecord(formData).subscribe({
      // this.CIFwebService.NewUserRecord(formData).subscribe({
      next: (data) => {
        // Check if response has error flag from service
        if (data && data.error) {
          this.serverConnectionError = true;
          this.storeResult = -1;
          return;
        }

        const result = data?.item1?.[0]?.['msg'];
        const errorCode = data?.item1?.[0]?.['returnId'];

        if (result === 'Success') {
          this.storeResult = 1;
        } else if (errorCode === -1) {
          this.storeResult = 0;
        } else {
          this.storeResult = -1;
        }
      },
      error: (err) => {
        console.error('Error saving user:', err);
        this.storeResult = -1;
      },
    });
  }
}
