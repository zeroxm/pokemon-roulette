import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesComponent } from './badges.component';
import { Badge } from '../../interfaces/badge';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('BadgesComponent', () => {
  let component: BadgesComponent;
  let fixture: ComponentFixture<BadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NgbTooltipModule],
      declarations: []
    }).compileComponents();

    fixture = TestBed.createComponent(BadgesComponent);
    component = fixture.componentInstance;
    component.trainerBadges = [] as Badge[];
    component.darkMode = of(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

