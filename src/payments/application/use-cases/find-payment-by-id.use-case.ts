// Caso de uso de aplicacion: busca un pago por id y falla si no existe.
// Evita que los adaptadores decidan que significa "no encontrado"; sin el, cada uno lo resolveria a su manera.

import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class FindPaymentByIdUseCase {
    private readonly repository: PaymentRepository;

    constructor(repository: PaymentRepository) {
        this.repository = repository;
    }

    async execute(id: string): Promise<Payment> {
        const payment = await this.repository.findById(id);

        if (!payment) {
            throw new NotFoundError('Pago no encontrado');
        }

        return payment;
    }
}
