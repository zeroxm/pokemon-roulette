import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapController } from '@ng-icons/bootstrap-icons';
import { TranslateModule } from '@ngx-translate/core';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        NgIconsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideIcons({ bootstrapController }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders translated copy and a way back to the game', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('notFound.title');
    expect(text).toContain('notFound.message');
    expect(fixture.nativeElement.querySelector('app-main-game-button')).toBeTruthy();
  });
});
