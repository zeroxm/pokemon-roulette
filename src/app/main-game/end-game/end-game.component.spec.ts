import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import Fireworks from 'fireworks-js';

import { EndGameComponent } from './end-game.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapClock, bootstrapShare } from '@ng-icons/bootstrap-icons';
import { HttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';

describe('EndGameComponent', () => {
  let component: EndGameComponent;
  let fixture: ComponentFixture<EndGameComponent>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        EndGameComponent,
        NgIconsModule
      ],
      providers: [
        provideTranslateService(),
        provideIcons({ bootstrapShare, bootstrapClock }),
        {provide: HttpClient, useValue: httpSpyObj }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts the fireworks outside the Angular zone', () => {
    // zone.js patches `requestAnimationFrame`, which is what fireworks-js drives itself
    // with. Started inside the zone it ran a full application-wide change detection pass
    // sixty times a second for as long as the player sat on the win screen, and opening
    // the achievements panel on top of that froze the tab. See issue #83.
    const zone = TestBed.inject(NgZone);
    let startedInsideZone: boolean | null = null;
    spyOn(Fireworks.prototype, 'start').and.callFake(() => {
      startedInsideZone = NgZone.isInAngularZone();
    });

    // Explicitly inside the zone: a TestBed spec body is not, so calling straight through
    // would pass whether or not the component wrapped anything.
    zone.run(() => component.ngAfterViewInit());

    expect(startedInsideZone).toBeFalse();
  });
});
