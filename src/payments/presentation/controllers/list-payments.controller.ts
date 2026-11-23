// Controlador de listado de pagos: adapta la peticion HTTP al caso de uso.
// Mantiene los casos de uso libres de detalles HTTP.

import type { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case.ts';

export class ListPaymentsController {
    private readonly listPaymentsUseCase: ListPaymentsUseCase;

    constructor(listPaymentsUseCase: ListPaymentsUseCase) {
        this.listPaymentsUseCase = listPaymentsUseCase;
    }

    async handle() {
        return this.listPaymentsUseCase.execute();
    }
}
