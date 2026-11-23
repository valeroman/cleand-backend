// Caso de uso de aplicacion: coordina la creacion de un producto con id generado y su guardado.
// Hace reutilizable el alta sin conocer HTTP ni el almacenamiento concreto; sin el, esa secuencia se repartiria entre adaptadores.

import { Product, type CreateProductData } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';

export class CreateProductUseCase {
    private readonly repository: ProductRepository;
    private readonly idGenerator: IdGenerator;

    constructor(repository: ProductRepository, idGenerator: IdGenerator) {
        this.repository = repository;
        this.idGenerator = idGenerator;
    }

    async execute(input: Omit<CreateProductData, 'id'>): Promise<Product> {
        const product = Product.create({
            ...input,
            id: this.idGenerator.generate(),
        });

        await this.repository.save(product);
        return product;
    }
}
