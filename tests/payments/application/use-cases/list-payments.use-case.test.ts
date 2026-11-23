// Pruebas del caso de uso ListPaymentsUseCase: verifican listado vacio y con pagos.
// Aseguran que el caso de uso devuelva lo que contiene el repositorio.

import { describe, it, expect } from 'vitest';
import { ListPaymentsUseCase } from '../../../../src/payments/application/use-cases/list-payments.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';

const customerId = '223e4567-e89b-42d3-a456-426614174000';

describe('ListPaymentsUseCase', () => {
    it('devuelve lista vacia si no hay pagos', async () => {
        expect(await new ListPaymentsUseCase(new InMemoryPaymentRepository()).execute()).toEqual([]);
    });

    it('devuelve todos los pagos guardados', async () => {
        const repository = new InMemoryPaymentRepository();
        const a = Payment.create({ id: '123e4567-e89b-42d3-a456-426614174000', reference: 'A', amount: 1, customerId, createdAt: new Date() });
        const b = Payment.create({ id: '123e4567-e89b-42d3-a456-426614174001', reference: 'B', amount: 2, customerId, createdAt: new Date() });
        await repository.save(a);
        await repository.save(b);

        expect(await new ListPaymentsUseCase(repository).execute()).toEqual([a, b]);
    });
});
