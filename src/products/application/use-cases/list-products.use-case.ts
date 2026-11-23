// Caso de uso de aplicacion: devuelve todos los productos registrados.
// Aisla la lectura masiva del almacenamiento concreto; sin el, los adaptadores consultarian el repositorio directamente.

import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class ListProductsUseCase {
    private readonly repository: ProductRepository;

    constructor(repository: ProductRepository) {
        this.repository = repository;
    }

    async execute(): Promise<Product[]> {
        return this.repository.findAll();
    }
}
