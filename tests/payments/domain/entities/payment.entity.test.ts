// Pruebas de la entidad Payment: verifican creacion, normalizacion, validaciones e inmutabilidad.
// Aseguran que no circulen pagos invalidos por el dominio.

import { describe, it, expect } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';
const customerId = '223e4567-e89b-42d3-a456-426614174000';
const createdAt = new Date('2026-01-01T10:00:00.000Z');

const validData = { id, reference: 'PAY-001', amount: 100.5, customerId, createdAt };

describe('Payment', () => {
    it('crea un pago valido con status pending por defecto', () => {
        const payment = Payment.create(validData);

        expect(payment.id).toBe(id);
        expect(payment.reference).toBe('PAY-001');
        expect(payment.amount).toBe(100.5);
        expect(payment.customerId).toBe(customerId);
        expect(payment.status).toBe('pending');
    });

    it('asigna createdAt y updatedAt iguales', () => {
        const payment = Payment.create(validData);

        expect(payment.createdAt).toEqual(createdAt);
        expect(payment.updatedAt).toEqual(createdAt);
    });

    it('no comparte la referencia del Date recibido', () => {
        const date = new Date(createdAt);
        const payment = Payment.create({ ...validData, createdAt: date });
        date.setFullYear(2000);

        expect(payment.createdAt).toEqual(createdAt);
    });

    it('acepta un status valido', () => {
        expect(Payment.create({ ...validData, status: 'completed' }).status).toBe('completed');
    });

    it('normaliza la referencia con trim', () => {
        expect(Payment.create({ ...validData, reference: '  PAY-001 ' }).reference).toBe('PAY-001');
    });

    it('lanza ValidationError si el id no es UUID', () => {
        expect(() => Payment.create({ ...validData, id: 'abc' })).toThrow(ValidationError);
    });

    it('lanza ValidationError si el customerId no es UUID', () => {
        expect(() => Payment.create({ ...validData, customerId: 'abc' })).toThrow(ValidationError);
    });

    it('lanza ValidationError si la referencia esta vacia', () => {
        expect(() => Payment.create({ ...validData, reference: '   ' })).toThrow(ValidationError);
    });

    it.each([0, -5, Number.NaN, Infinity])('lanza ValidationError si el monto es %s', (amount) => {
        expect(() => Payment.create({ ...validData, amount })).toThrow(ValidationError);
    });

    it('lanza ValidationError si el monto tiene mas de 2 decimales', () => {
        expect(() => Payment.create({ ...validData, amount: 10.123 })).toThrow(ValidationError);
    });

    it('acepta montos con 2 decimales aunque el flotante sea impreciso', () => {
        expect(Payment.create({ ...validData, amount: 0.29 }).amount).toBe(0.29);
    });

    it('lanza ValidationError si el status no es valido', () => {
        expect(() => Payment.create({ ...validData, status: 'otro' as never })).toThrow(ValidationError);
    });

    it('es inmutable', () => {
        const payment = Payment.create(validData);

        expect(Object.isFrozen(payment)).toBe(true);
    });
});
