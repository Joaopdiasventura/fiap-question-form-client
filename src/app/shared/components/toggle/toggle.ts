import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-toggle',
  styleUrl: './toggle.scss',
  templateUrl: './toggle.html',
})
export class Toggle {
  id = input.required<string>();
  label = input.required<string>();
  controlType = input<'checkbox' | 'radio'>('checkbox');
  name = input<string | null>(null);
  checked = input(false);
  disabled = input(false);
  checkedChange = output<boolean>();
  touched = output<void>();

  onChange(event: Event): void {
    if (this.disabled()) {
      return;
    }

    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
    this.touched.emit();
  }
}
