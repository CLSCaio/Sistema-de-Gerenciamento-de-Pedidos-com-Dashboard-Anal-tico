import { reportQuerySchema } from '../models/schemas';
import { ReportService } from '../services/report-service';
import { asyncHandler } from '../utils/async-handler';

export function createReportController(service: ReportService) {
  return {
    get: asyncHandler(async (req, res) => {
      res.json(await service.get(reportQuerySchema.parse(req.query)));
    }),
  };
}
