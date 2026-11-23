// Implementacion en memoria de ProductRepository: guarda los productos en un Map mientras el proceso vive.
// Sirve para desarrollo y tests sin base de datos; se reemplaza por otra tecnologia sin tocar dominio ni aplicacion.

import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class InMemoryProductRepository implements ProductRepository {
    private readonly products = new Map<string, Product>();

    async findById(id: string): Promise<Product | undefined> {
        return this.products.get(id);
    }

    async findAll(): Promise<Product[]> {
        return [...this.products.values()];
    }

    async save(product: Product): Promise<void> {
        this.products.set(product.id, product);
    }
}
