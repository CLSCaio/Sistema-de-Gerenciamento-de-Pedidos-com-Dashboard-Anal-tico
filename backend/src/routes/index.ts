import { Router } from 'express';
import { createAuthController } from '../controllers/auth-controller';
import { createDeliveryPersonController } from '../controllers/delivery-person-controller';
import { createOrderController } from '../controllers/order-controller';
import { createProductController } from '../controllers/product-controller';
import { createReportController } from '../controllers/report-controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { AssignmentService } from '../services/assignment-service';
import { AuthService } from '../services/auth-service';
import { PrismaAuthStore } from '../services/auth-store';
import { DeliveryPersonService } from '../services/delivery-person-service';
import { PrismaDeliveryPersonStore } from '../services/delivery-person-store';
import { OrderService } from '../services/order-service';
import { PrismaOrderStore } from '../services/order-store';
import { ProductService } from '../services/product-service';
import { PrismaProductStore } from '../services/product-store';
import { ReportService } from '../services/report-service';
import { PrismaReportStore } from '../services/report-store';

export function createApiRouter(): Router {
  const router = Router();
  const auth = createAuthController(new AuthService(new PrismaAuthStore()));
  const products = createProductController(new ProductService(new PrismaProductStore()));
  const orders = new OrderService(new PrismaOrderStore());
  const couriers = new DeliveryPersonService(new PrismaDeliveryPersonStore());
  const orderController = createOrderController(orders, new AssignmentService(new PrismaOrderStore(), new PrismaDeliveryPersonStore()));
  const courierController = createDeliveryPersonController(couriers);
  const reports = createReportController(new ReportService(new PrismaReportStore()));
  const readers = [authenticate, authorize('admin', 'viewer')] as const;
  const admins = [authenticate, authorize('admin')] as const;

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.post('/auth/login', auth.login);
  router.post('/auth/refresh', auth.refresh);
  router.post('/auth/logout', auth.logout);
  router.get('/auth/me', authenticate, auth.me);

  router.get('/products', ...readers, products.list);
  router.get('/products/:id', ...readers, products.get);
  router.post('/products', ...admins, products.create);
  router.put('/products/:id', ...admins, products.update);
  router.patch('/products/:id/availability', ...admins, products.setAvailability);
  router.delete('/products/:id', ...admins, products.remove);

  router.get('/orders', ...readers, orderController.list);
  router.post('/orders/optimize-assignment', ...admins, orderController.optimize);
  router.post('/orders/accept-assignment', ...admins, orderController.accept);
  router.get('/orders/:id', ...readers, orderController.get);
  router.post('/orders', ...admins, orderController.create);
  router.patch('/orders/:id/status', ...admins, orderController.changeStatus);

  router.get('/delivery-persons', ...admins, courierController.list);
  router.get('/delivery-persons/:id', ...admins, courierController.get);
  router.post('/delivery-persons', ...admins, courierController.create);
  router.put('/delivery-persons/:id', ...admins, courierController.update);
  router.delete('/delivery-persons/:id', ...admins, courierController.remove);

  router.get('/reports', ...readers, reports.get);
  return router;
}
