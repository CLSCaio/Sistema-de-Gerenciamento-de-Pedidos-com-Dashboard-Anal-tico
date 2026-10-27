import type { ReportQuery } from '../models/schemas';
import { parsePeriod } from '../utils/dates';
import { buildReport, type ReportSummary } from './report-summary';
import type { ReportStore } from './report-store';

export class ReportService {
  constructor(private readonly store: ReportStore) {}

  async get(query: ReportQuery): Promise<ReportSummary> {
    const { start, end } = parsePeriod(query.startDate, query.endDate);
    const [delivered, created] = await Promise.all([this.store.deliveredSales(start, end), this.store.createdOrders(start, end)]);
    return buildReport(delivered, created, start, end);
  }
}
