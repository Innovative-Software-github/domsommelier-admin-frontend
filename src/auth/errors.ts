export class ForbiddenAccessError extends Error {
  constructor(message = 'Нет прав доступа к админ-панели') {
    super(message);
    this.name = 'ForbiddenAccessError';
  }
}
