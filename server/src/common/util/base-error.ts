class BaseError extends Error {
  private httpCode: number;
  constructor(name, httpCode, message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;

    Error.captureStackTrace(this);
  }

  public get statusCode(): number {
    return this.httpCode;
  }

  public get error(): string {
    // Expose a generic error payload used by some controllers
    return this.message;
  }
}

export default BaseError;
