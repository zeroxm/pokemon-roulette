import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationMapComponent } from './generation-map.component';
import { TranslateModule } from '@ngx-translate/core';

describe('GenerationMapComponent', () => {
  let component: GenerationMapComponent;
  let fixture: ComponentFixture<GenerationMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationMapComponent, TranslateModule.forRoot()]
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
