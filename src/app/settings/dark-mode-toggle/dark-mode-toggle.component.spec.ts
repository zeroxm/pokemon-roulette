import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkModeToggleComponent } from './dark-mode-toggle.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DarkModeToggleComponent', () => {
  let component: DarkModeToggleComponent;
  let fixture: ComponentFixture<DarkModeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkModeToggleComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DarkModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
