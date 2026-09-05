import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormSuccess } from './form-success';

describe('FormSuccess', () => {
  let component: FormSuccess;
  let fixture: ComponentFixture<FormSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSuccess],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('confirms the response submission', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Resposta registrada');
  });
});
