import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemModalComponent } from './item-modal.component';

describe('ItemModalComponent', () => {
  let fixture: ComponentFixture<ItemModalComponent>;
  let component: ItemModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemModalComponent, TranslateModule.forRoot()],
      providers: [NgbActiveModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemModalComponent);
    component = fixture.componentInstance;
    component.titleKey = 'a.title';
    component.sprite = 'sprite.png';
    component.descriptionKey = 'a.description';
  });

  // This component merges two former templates (consolation prize / item activation).
  // The suffix is the only thing that differed, so it is what the tests pin down.

  it('renders the heading without a suffix when none is given', () => {
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h1').textContent.trim();
    expect(heading).toBe('a.title');
  });

  it('appends the suffix when one is given', () => {
    component.titleSuffixKey = 'a.suffix';
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h1').textContent.trim();
    expect(heading).toBe('a.title a.suffix');
  });

  it('closes itself rather than dismissing every open modal', () => {
    const activeModal = TestBed.inject(NgbActiveModal);
    const close = spyOn(activeModal, 'close');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal-footer button').click();
    expect(close).toHaveBeenCalled();
  });
});
