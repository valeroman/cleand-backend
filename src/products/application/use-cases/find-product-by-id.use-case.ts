// Caso de uso de aplicacion: busca un producto por id y falla si no existe.
// Evita que los adaptadores decidan que significa "no encontrado"; sin el, cada uno lo resolveria a su manera.

import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class FindProductByIdUseCase {
    private readonly repository: ProductRepository;

    constructor(repository: ProductRepository) {
        this.repository = repository;
    }

    async execute(id: string): Promise<Product> {
        const product = await this.repository.findById(id);

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        return product;
    }
}
