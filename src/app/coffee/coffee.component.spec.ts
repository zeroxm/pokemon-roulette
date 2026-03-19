import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeComponent } from './coffee.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapCupHotFill } from '@ng-icons/bootstrap-icons';
import { TranslateModule } from '@ngx-translate/core';

describe('CoffeeComponent', () => {
  let component: CoffeeComponent;
  let fixture: ComponentFixture<CoffeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CoffeeComponent,
        NgIconsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideIcons({ bootstrapCupHotFill }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
