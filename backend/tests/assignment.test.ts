import { describe, expect, it } from 'vitest';
import { haversineKm } from '../src/algorithms/haversine';
import { minimizeAssignmentCost } from '../src/algorithms/hungarian';
import { optimizeAssignment } from '../src/algorithms/optimize-assignment';

describe('otimização de atribuição', () => {
  it('encontra a atribuição de custo mínimo', () => {
    expect(minimizeAssignmentCost([
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ])).toEqual([1, 0, 2]);

    const result = optimizeAssignment(
      [
        { id: 'order-a', latitude: 0, longitude: 0 },
        { id: 'order-b', latitude: 0, longitude: 0.02 },
      ],
      [
        { id: 'courier-1', latitude: 0, longitude: 0.001 },
        { id: 'courier-2', latitude: 0, longitude: 0.019 },
      ],
    );
    expect(result.assignments).toEqual([
      expect.objectContaining({ orderId: 'order-a', deliveryPersonId: 'courier-1' }),
      expect.objectContaining({ orderId: 'order-b', deliveryPersonId: 'courier-2' }),
    ]);
    expect(result.unassigned).toEqual([]);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
  });

  it('marca os pedidos como não atribuídos quando não há entregadores', () => {
    const result = optimizeAssignment(
      [
        { id: 'order-1', latitude: -23.55, longitude: -46.63 },
        { id: 'order-2', latitude: -23.56, longitude: -46.64 },
      ],
      [],
    );
    expect(result.assignments).toEqual([]);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.unassigned).toEqual([
      { orderId: 'order-1', reason: 'No available delivery person' },
      { orderId: 'order-2', reason: 'No available delivery person' },
    ]);
  });

  it('deixa o pedido excedente sem entregador', () => {
    const result = optimizeAssignment(
      [
        { id: 'near', latitude: 0, longitude: 0 },
        { id: 'far', latitude: 0, longitude: 1 },
      ],
      [{ id: 'only', latitude: 0, longitude: 0 }],
    );
    expect(result.assignments).toEqual([
      expect.objectContaining({ orderId: 'near', deliveryPersonId: 'only', estimatedDistanceKm: 0 }),
    ]);
    expect(result.unassigned).toEqual([{ orderId: 'far', reason: 'No available delivery person' }]);
  });

  it('calcula distância zero para o mesmo ponto', () => {
    expect(haversineKm(-23.55, -46.63, -23.55, -46.63)).toBe(0);
  });
});
