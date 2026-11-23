// Controlador de busqueda de producto por id: adapta el parametro HTTP al caso de uso.
// Mantiene los casos de uso libres de detalles HTTP.

import type { FindProductByIdUseCase } from '../../application/use-cases/find-product-by-id.use-case.ts';

export class FindProductByIdController {
    private readonly findProductByIdUseCase: FindProductByIdUseCase;

    constructor(findProductByIdUseCase: FindProductByIdUseCase) {
        this.findProductByIdUseCase = findProductByIdUseCase;
    }

    async handle(id: string) {
        return this.findProductByIdUseCase.execute(id);
    }
}
