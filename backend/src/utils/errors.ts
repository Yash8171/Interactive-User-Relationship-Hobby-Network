export class BadRequest extends Error { status = 400 }
export class NotFound extends Error { status = 404 }
export class ConflictError extends Error { status = 409 }
