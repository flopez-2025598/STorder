export class HttpError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 409 | 503;

  constructor(status: HttpError['status'], message: string) {
    super(message);
    this.status = status;
  }
}
