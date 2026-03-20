import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsButtonComponent } from './credits-button.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapPeopleFill } from '@ng-icons/bootstrap-icons';
import { TranslateModule } from '@ngx-translate/core';

describe('CreditsButtonComponent', () => {
  let component: CreditsButtonComponent;
  let fixture: ComponentFixture<CreditsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreditsButtonComponent,
        NgIconsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideIcons({ bootstrapPeopleFill }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
