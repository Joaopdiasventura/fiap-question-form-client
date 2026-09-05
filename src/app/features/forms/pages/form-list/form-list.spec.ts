import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormList } from './form-list';

describe('FormList', () => {
  let component: FormList;
  let fixture: ComponentFixture<FormList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
