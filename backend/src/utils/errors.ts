export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: Array<{ field: string; message: string }>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: Array<{ field: string; message: string }> = [],
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
