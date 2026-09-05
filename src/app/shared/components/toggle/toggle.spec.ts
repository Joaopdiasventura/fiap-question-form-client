import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toggle } from './toggle';

describe('Toggle', () => {
  let component: Toggle;
  let fixture: ComponentFixture<Toggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toggle],
    }).compileComponents();

    fixture = TestBed.createComponent(Toggle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'toggle-a');
    fixture.componentRef.setInput('label', 'Aulas');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles checked values through a real checkbox', () => {
    const values: boolean[] = [];
    component.checkedChange.subscribe((value) => values.push(value));
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input[type="checkbox"]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(values).toEqual([true]);
  });

  it('does not emit when disabled', () => {
    const values: boolean[] = [];
    component.checkedChange.subscribe((value) => values.push(value));
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(input.disabled).toBe(true);
    expect(values).toEqual([]);
  });

  it('can render as a radio control for single choice', () => {
    fixture.componentRef.setInput('controlType', 'radio');
    fixture.componentRef.setInput('name', 'periodo');
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input[type="radio"]') as HTMLInputElement;

    expect(input.name).toBe('periodo');
  });
});
