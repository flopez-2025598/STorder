import { Component, input } from '@angular/core';

const icons = {
  home: 'M3 10 12 3l9 7v10H3z M9 20v-7h6v7',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  orders: 'M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5',
  cart: 'M2 4h3l3 11h10l3-8H6 M9 20h.01 M17 20h.01',
  layers: 'm3 8 9-5 9 5-9 5z M3 12l9 5 9-5 M3 16l9 5 9-5',
  stock: 'M3 21V9l9-6 9 6v12z M7 21V11h10v10 M7 15h10 M7 18h10',
  edit: 'm4 16-1 5 5-1L20 8l-4-4z M13 7l4 4',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 10v6 M14 10v6',
  plus: 'M12 5v14 M5 12h14',
  search: 'M15 15l5 5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
} as const;

@Component({
  selector: 'st-icon',
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()" /></svg>`,
  styles: ':host { display: inline-flex; width: 1.15em; height: 1.15em; flex: none; } svg { width: 100%; height: 100%; }',
})
export class UiIcon {
  readonly name = input.required<keyof typeof icons>();
  protected path() { return icons[this.name()]; }
}
