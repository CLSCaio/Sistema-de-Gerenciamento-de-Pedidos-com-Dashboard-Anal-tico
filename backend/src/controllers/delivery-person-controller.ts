import { deliveryPersonListSchema, deliveryPersonSchema } from '../models/schemas';
import { DeliveryPersonService } from '../services/delivery-person-service';
import { asyncHandler } from '../utils/async-handler';
import { readId } from './auth-controller';

export function createDeliveryPersonController(service: DeliveryPersonService) {
  return {
    list: asyncHandler(async (req, res) => {
      res.json(await service.list(deliveryPersonListSchema.parse(req.query)));
    }),
    get: asyncHandler(async (req, res) => {
      res.json(await service.get(readId(req)));
    }),
    create: asyncHandler(async (req, res) => {
      res.status(201).json(await service.create(deliveryPersonSchema.parse(req.body)));
    }),
    update: asyncHandler(async (req, res) => {
      res.json(await service.update(readId(req), deliveryPersonSchema.parse(req.body)));
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(readId(req));
      res.status(204).send();
    }),
  };
}
