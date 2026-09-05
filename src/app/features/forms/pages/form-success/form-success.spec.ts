import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
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

  it('does not show navigation to anonymous visitors', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Voltar');
  });

  it('shows back action for authenticated users', async () => {
    const auth = TestBed.inject(AuthService);

    await firstValueFrom(auth.login({ email: 'admin@fiap.com.br', password: 'fiap123' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Voltar');
  });
});
