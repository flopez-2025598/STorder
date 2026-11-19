type HttpErrorStatus = 400 | 401 | 403 | 404 | 409;

export class HttpError extends Error {
  readonly status: HttpErrorStatus;

  constructor(status: HttpErrorStatus, message: string) {
    super(message);
    this.status = status;
  }
}
