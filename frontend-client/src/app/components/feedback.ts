import { Component, input } from '@angular/core';

@Component({
  selector: 'st-feedback',
  template: `
    @if (error()) { <p class="notice error" role="alert">{{ error() }}</p> }
    @if (message()) { <p class="notice success" role="status">{{ message() }}</p> }
  `,
})
export class Feedback {
  readonly error = input('');
  readonly message = input('');
}
