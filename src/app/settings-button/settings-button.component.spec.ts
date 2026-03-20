import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsButtonComponent } from './settings-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { bootstrapGear } from '@ng-icons/bootstrap-icons';

describe('SettingsButtonComponent', () => {
  let component: SettingsButtonComponent;
  let fixture: ComponentFixture<SettingsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsButtonComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({ bootstrapGear })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
