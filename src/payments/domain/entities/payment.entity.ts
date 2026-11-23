// Entidad del dominio Payment: reune los datos y las reglas que mantienen valido e inmutable cada pago.
// Centraliza esas garantias; sin ellas, cada consumidor tendria que repetirlas y podrian circular pagos invalidos.

// El constructor privado dirige la creacion a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze() impide cambios en ejecucion.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';

const paymentStatuses = ['pending', 'completed', 'failed'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export interface CreatePaymentData {
    id: string;
    reference: string;
    amount: number;
    customerId: string;
    createdAt: Date;
    status?: PaymentStatus;
}

export class Payment {
    readonly id: string;
    readonly reference: string;
    readonly amount: number;
    readonly status: PaymentStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly customerId: string;

    private constructor(payment: {
        id: string;
        reference: string;
        amount: number;
        status: PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
    }) {
        this.id = payment.id;
        this.reference = payment.reference;
        this.amount = payment.amount;
        this.status = payment.status;
        this.createdAt = payment.createdAt;
        this.updatedAt = payment.updatedAt;
        this.customerId = payment.customerId;

        Object.freeze(this);
    }

    static create(input: CreatePaymentData): Payment {
        const { id, reference, amount, customerId, createdAt, status = 'pending' } = input;
        const cleanReference = reference.trim();

        if (!isUuid(id)) {
            throw new ValidationError('El id debe ser un UUID valido');
        }

        if (!cleanReference) {
            throw new ValidationError('La referencia es obligatoria');
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new ValidationError('El monto debe ser un numero mayor a 0');
        }

        if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-9) {
            throw new ValidationError('El monto admite maximo 2 decimales');
        }

        if (!isUuid(customerId)) {
            throw new ValidationError('El customerId debe ser un UUID valido');
        }

        if (!paymentStatuses.includes(status)) {
            throw new ValidationError(`El status ${status} no es valido`);
        }

        // Copias de la fecha: el Date es mutable y el pago debe ser inmutable.
        return new Payment({
            id,
            reference: cleanReference,
            amount,
            status,
            createdAt: new Date(createdAt),
            updatedAt: new Date(createdAt),
            customerId,
        });
    }
}
