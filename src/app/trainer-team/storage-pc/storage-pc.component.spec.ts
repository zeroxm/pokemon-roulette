import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoragePcComponent } from './storage-pc.component';

describe('StoragePcComponent', () => {
  let component: StoragePcComponent;
  let fixture: ComponentFixture<StoragePcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoragePcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoragePcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
