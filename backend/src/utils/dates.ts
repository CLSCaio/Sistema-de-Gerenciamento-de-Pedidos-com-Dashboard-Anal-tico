import { AppError } from './errors';

const SAO_PAULO_OFFSET = '-03:00';

export function parsePeriod(startDate: string, endDate: string): { start: Date; end: Date } {
  const start = parseBoundary(startDate, 'start');
  const end = parseBoundary(endDate, 'end');
  if (start.getTime() > end.getTime()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'A data inicial não pode ser posterior à data final', [
      { field: 'startDate', message: 'A data inicial não pode ser posterior à data final' },
    ]);
  }
  return { start, end };
}

function parseBoundary(date: string, boundary: 'start' | 'end'): Date {
  const time = boundary === 'start' ? '00:00:00.000' : '23:59:59.999';
  const parsed = new Date(`${date}T${time}${SAO_PAULO_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) {
    const field = boundary === 'start' ? 'startDate' : 'endDate';
    throw new AppError(400, 'VALIDATION_ERROR', 'Data inválida', [{ field, message: 'Data inválida' }]);
  }
  return parsed;
}
