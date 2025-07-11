import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServizComponent } from './serviz.component';

describe('ServizComponent', () => {
  let component: ServizComponent;
  let fixture: ComponentFixture<ServizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServizComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
