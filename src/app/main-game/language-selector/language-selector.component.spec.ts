import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideIcons } from '@ng-icons/core';
import { bootstrapCheck } from '@ng-icons/bootstrap-icons';

import { LanguageSelectorComponent } from './language-selector.component';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LanguageSelectorComponent,
        TranslateModule.forRoot(),
        NgbModule
      ],
      providers: [
        provideIcons({ bootstrapCheck })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change language when changeLanguage is called', () => {
    spyOn(translateService, 'use');
    component.changeLanguage('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should update current language', () => {
    component.changeLanguage('en');
    expect(component.currentLanguage.code).toBe('en');
  });
});
