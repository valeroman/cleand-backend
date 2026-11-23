// Caso de uso de aplicacion: devuelve todos los pagos registrados.
// Aisla la lectura masiva del almacenamiento concreto; sin el, los adaptadores consultarian el repositorio directamente.

import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class ListPaymentsUseCase {
    private readonly repository: PaymentRepository;

    constructor(repository: PaymentRepository) {
        this.repository = repository;
    }

    async execute(): Promise<Payment[]> {
        return this.repository.findAll();
    }
}
