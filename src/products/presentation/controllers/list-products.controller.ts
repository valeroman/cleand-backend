// Controlador de listado de productos: adapta la peticion HTTP al caso de uso.
// Mantiene los casos de uso libres de detalles HTTP.

import type { ListProductsUseCase } from '../../application/use-cases/list-products.use-case.ts';

export class ListProductsController {
    private readonly listProductsUseCase: ListProductsUseCase;

    constructor(listProductsUseCase: ListProductsUseCase) {
        this.listProductsUseCase = listProductsUseCase;
    }

    async handle() {
        return this.listProductsUseCase.execute();
    }
}
