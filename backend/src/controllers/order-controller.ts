import { acceptAssignmentSchema, createOrderSchema, orderListSchema, statusChangeSchema } from '../models/schemas';
import { AssignmentService } from '../services/assignment-service';
import { OrderService } from '../services/order-service';
import { asyncHandler } from '../utils/async-handler';
import { readId } from './auth-controller';

export function createOrderController(orders: OrderService, assignments: AssignmentService) {
  return {
    list: asyncHandler(async (req, res) => {
      res.json(await orders.list(orderListSchema.parse(req.query)));
    }),
    get: asyncHandler(async (req, res) => {
      res.json(await orders.get(readId(req)));
    }),
    create: asyncHandler(async (req, res) => {
      res.status(201).json(await orders.create(createOrderSchema.parse(req.body)));
    }),
    changeStatus: asyncHandler(async (req, res) => {
      const body = statusChangeSchema.parse(req.body);
      res.json(await orders.transition(readId(req), body.status, body.deliveryPersonId));
    }),
    optimize: asyncHandler(async (_req, res) => {
      res.json(await assignments.suggest());
    }),
    accept: asyncHandler(async (req, res) => {
      const body = acceptAssignmentSchema.parse(req.body);
      res.json(await assignments.accept(body.orderId, body.deliveryPersonId));
    }),
  };
}
