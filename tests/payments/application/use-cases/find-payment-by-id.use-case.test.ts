// Pruebas del caso de uso FindPaymentByIdUseCase: verifican busqueda exitosa y no encontrado.
// Aseguran que un id inexistente se traduzca en NotFoundError.

import { describe, it, expect } from 'vitest';
import { FindPaymentByIdUseCase } from '../../../../src/payments/application/use-cases/find-payment-by-id.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { NotFoundError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';
const customerId = '223e4567-e89b-42d3-a456-426614174000';

describe('FindPaymentByIdUseCase', () => {
    it('devuelve el pago existente', async () => {
        const repository = new InMemoryPaymentRepository();
        const payment = Payment.create({ id, reference: 'PAY-001', amount: 10, customerId, createdAt: new Date() });
        await repository.save(payment);

        expect(await new FindPaymentByIdUseCase(repository).execute(id)).toBe(payment);
    });

    it('lanza NotFoundError si no existe', async () => {
        const useCase = new FindPaymentByIdUseCase(new InMemoryPaymentRepository());

        await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    });
});
