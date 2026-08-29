import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationMapComponent } from './generation-map.component';
import { provideTranslateService } from '@ngx-translate/core';

describe('GenerationMapComponent', () => {
  let component: GenerationMapComponent;
  let fixture: ComponentFixture<GenerationMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()],
      imports: [GenerationMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
