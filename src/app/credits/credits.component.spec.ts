import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsComponent } from './credits.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapController } from '@ng-icons/bootstrap-icons';

describe('CreditsComponent', () => {
  let component: CreditsComponent;
  let fixture: ComponentFixture<CreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreditsComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapController }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
