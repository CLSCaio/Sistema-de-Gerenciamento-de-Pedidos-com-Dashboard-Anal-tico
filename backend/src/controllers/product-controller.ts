import { availabilitySchema, createProductSchema, productListSchema, updateProductSchema } from '../models/schemas';
import { ProductService, toProductWrite } from '../services/product-service';
import { asyncHandler } from '../utils/async-handler';
import { readId } from './auth-controller';

export function createProductController(service: ProductService) {
  return {
    list: asyncHandler(async (req, res) => {
      res.json(await service.list(productListSchema.parse(req.query)));
    }),
    get: asyncHandler(async (req, res) => {
      res.json(await service.get(readId(req)));
    }),
    create: asyncHandler(async (req, res) => {
      const product = await service.create(toProductWrite(createProductSchema.parse(req.body)));
      res.status(201).json(product);
    }),
    update: asyncHandler(async (req, res) => {
      const product = await service.update(readId(req), toProductWrite(updateProductSchema.parse(req.body)));
      res.json(product);
    }),
    setAvailability: asyncHandler(async (req, res) => {
      const body = availabilitySchema.parse(req.body);
      res.json(await service.setAvailability(readId(req), body.isAvailable));
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(readId(req));
      res.status(204).send();
    }),
  };
}
