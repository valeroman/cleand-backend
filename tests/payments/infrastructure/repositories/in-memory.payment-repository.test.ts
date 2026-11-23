// Pruebas de InMemoryPaymentRepository: verifican guardado, busquedas y unicidad de referencia.
// Aseguran que la implementacion cumple el contrato PaymentRepository.

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const customerId = '223e4567-e89b-42d3-a456-426614174000';

function buildPayment(id: string, reference: string) {
    return Payment.create({ id, reference, amount: 10, customerId, createdAt: new Date() });
}

describe('InMemoryPaymentRepository', () => {
    let repository: InMemoryPaymentRepository;

    beforeEach(() => {
        repository = new InMemoryPaymentRepository();
    });

    it('guarda y encuentra por id', async () => {
        const payment = buildPayment('123e4567-e89b-42d3-a456-426614174000', 'A');
        await repository.save(payment);

        expect(await repository.findById(payment.id)).toBe(payment);
    });

    it('encuentra por referencia', async () => {
        const payment = buildPayment('123e4567-e89b-42d3-a456-426614174000', 'A');
        await repository.save(payment);

        expect(await repository.findByReference('A')).toBe(payment);
    });

    it('devuelve undefined si no existe', async () => {
        expect(await repository.findById('x')).toBeUndefined();
        expect(await repository.findByReference('x')).toBeUndefined();
    });

    it('lanza ConflictError al guardar una referencia duplicada', async () => {
        await repository.save(buildPayment('123e4567-e89b-42d3-a456-426614174000', 'A'));

        await expect(
            repository.save(buildPayment('123e4567-e89b-42d3-a456-426614174001', 'A')),
        ).rejects.toThrow(ConflictError);
    });

    it('lista todos los pagos', async () => {
        await repository.save(buildPayment('123e4567-e89b-42d3-a456-426614174000', 'A'));
        await repository.save(buildPayment('123e4567-e89b-42d3-a456-426614174001', 'B'));

        expect(await repository.findAll()).toHaveLength(2);
    });
});
