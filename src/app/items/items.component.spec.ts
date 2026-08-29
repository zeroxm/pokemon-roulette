import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsComponent } from './items.component';
import { HttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  
  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideTranslateService(),
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

  describe('slot / sprite alignment', () => {
    const item = (name: string): any => ({
      name, text: `items.${name}.name`, description: `items.${name}.description`,
      sprite: `${name}.png`, fillStyle: 'purple', weight: 1,
    });

    it('renders every slot with its own sprite', () => {
      // Twelve distinct items, so any slot reading the wrong index is visible.
      component.trainerItems = Array.from({ length: 12 }, (_, i) => item(`item-${i}`));
      fixture.detectChanges();

      const rendered: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.item-container img') as NodeListOf<HTMLImageElement>,
      ).map(img => img.getAttribute('src')!);

      expect(rendered.length).toBe(12);
      rendered.forEach((src, slot) => {
        expect(src)
          .withContext(`slot ${slot} must show its own item, not a neighbour's`)
          .toBe(`item-${slot}.png`);
      });
    });

    it('shows the placeholder in an empty slot next to a filled one', () => {
      component.trainerItems = Array.from({ length: 6 }, (_, i) => item(`item-${i}`));
      fixture.detectChanges();

      const imgs = fixture.nativeElement.querySelectorAll('.item-container img');
      expect(imgs[5].getAttribute('src')).toBe('item-5.png');
      expect(imgs[6].getAttribute('src'))
        .withContext('an empty slot must not borrow the previous slot\'s sprite')
        .toBe('./place-holder-pixel.png');
    });
  });
});
