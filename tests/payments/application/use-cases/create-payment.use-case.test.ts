// Pruebas del caso de uso CreatePaymentUseCase: verifican alta, referencia duplicada y validaciones.
// Aseguran que la secuencia crear -> comprobar duplicado -> guardar se mantenga correcta.

import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePaymentUseCase } from '../../../../src/payments/application/use-cases/create-payment.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { ConflictError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';
import type { Clock } from '../../../../src/shared/domain/services/clock.ts';

const fixedId = '123e4567-e89b-42d3-a456-426614174000';
const customerId = '223e4567-e89b-42d3-a456-426614174000';
const fixedDate = new Date('2026-01-01T10:00:00.000Z');

describe('CreatePaymentUseCase', () => {
    let repository: InMemoryPaymentRepository;
    let useCase: CreatePaymentUseCase;
    const idGenerator: IdGenerator = { generate: () => fixedId };
    const clock: Clock = { now: () => fixedDate };

    beforeEach(() => {
        repository = new InMemoryPaymentRepository();
        useCase = new CreatePaymentUseCase(repository, idGenerator, clock);
    });

    it('crea un pago pending con id y fechas inyectados', async () => {
        const payment = await useCase.execute({ reference: 'PAY-001', amount: 50, customerId });

        expect(payment).toBeInstanceOf(Payment);
        expect(payment.id).toBe(fixedId);
        expect(payment.status).toBe('pending');
        expect(payment.createdAt).toEqual(fixedDate);
        expect(payment.updatedAt).toEqual(fixedDate);
    });

    it('guarda el pago en el repositorio', async () => {
        const payment = await useCase.execute({ reference: 'PAY-001', amount: 50, customerId });

        expect(await repository.findById(fixedId)).toBe(payment);
    });

    it('lanza ConflictError si la referencia ya existe (ignorando espacios)', async () => {
        await useCase.execute({ reference: 'PAY-001', amount: 50, customerId });

        await expect(
            useCase.execute({ reference: ' PAY-001 ', amount: 20, customerId }),
        ).rejects.toThrow(ConflictError);
    });

    it('lanza ValidationError y no guarda si el monto es invalido', async () => {
        await expect(
            useCase.execute({ reference: 'PAY-001', amount: -1, customerId }),
        ).rejects.toThrow(ValidationError);

        expect(await repository.findAll()).toEqual([]);
    });
});
