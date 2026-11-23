// Contrato del dominio: define como buscar y guardar pagos sin elegir una tecnologia de almacenamiento.
// Invierte la dependencia hacia una abstraccion; sin el, los casos de uso quedarian acoplados a un repositorio concreto.

import type { Payment } from '../entities/payment.entity.ts';

export interface PaymentRepository {
    findById(id: string): Promise<Payment | undefined>;
    findByReference(reference: string): Promise<Payment | undefined>;
    findAll(): Promise<Payment[]>;
    save(payment: Payment): Promise<void>;
}
