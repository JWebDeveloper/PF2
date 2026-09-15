import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProofStatusComponent } from './UploadProofStatus.component';

describe('UploadProofStatusComponent', () => {
  let component: UploadProofStatusComponent;
  let fixture: ComponentFixture<UploadProofStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadProofStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadProofStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
