import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoragePcComponent } from './storage-pc.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapPcDisplayHorizontal } from '@ng-icons/bootstrap-icons';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { provideTranslateService } from '@ngx-translate/core';

describe('StoragePcComponent', () => {
  let component: StoragePcComponent;
  let fixture: ComponentFixture<StoragePcComponent>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        StoragePcComponent,
        NgIconsModule
      ],
      providers: [
        provideTranslateService(),
        provideIcons({ bootstrapPcDisplayHorizontal }),
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoragePcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the storage modal scrollable, so Log out cannot scroll out of reach', () => {
    // The stored grid grows with the box. Without this the dialog outgrew the viewport,
    // and because it is centred with a static backdrop and no keyboard, the only way out
    // ended up below the fold with nothing to scroll it into view. See issue #83.
    const open = spyOn(TestBed.inject(NgbModal), 'open').and.stub();

    component.showPCModal();

    expect(open).toHaveBeenCalled();
    expect(open.calls.mostRecent().args[1]?.scrollable).toBeTrue();
  });
});
