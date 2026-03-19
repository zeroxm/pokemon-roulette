import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsComponent } from './items.component';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  
  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [ItemsComponent, TranslateModule.forRoot()],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemsComponent);
    component = fixture.componentInstance;
    component.trainerItems = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
