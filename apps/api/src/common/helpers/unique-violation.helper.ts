import { QueryFailedError } from 'typeorm';

type PostgresError = {
  code?: string;
};

export function isPostgresUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as PostgresError;

  return driverError.code === '23505';
}
