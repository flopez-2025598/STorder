import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <header class="hero">
      <h1>{{ heading() }}</h1>
      <p>{{ description() }}</p>
    </header>
    <div class="section-note">
      <p>Esta sección estará disponible en una próxima fase.</p>
      <a routerLink="/">Volver al panel</a>
    </div>
  `,
})
export class Section {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
}
