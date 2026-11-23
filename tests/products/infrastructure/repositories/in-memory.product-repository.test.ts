// Pruebas de InMemoryProductRepository: verifican guardado, busqueda y listado.
// Aseguran que la implementacion cumple el contrato ProductRepository.

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';

function buildProduct(id: string, name: string) {
    return Product.create({
        id,
        name,
        price: 10,
        stock: 1,
        description: 'Descripcion',
        category: 'cat',
        images: [],
    });
}

describe('InMemoryProductRepository', () => {
    let repository: InMemoryProductRepository;

    beforeEach(() => {
        repository = new InMemoryProductRepository();
    });

    it('guarda y encuentra por id', async () => {
        const product = buildProduct('123e4567-e89b-42d3-a456-426614174000', 'A');
        await repository.save(product);

        expect(await repository.findById(product.id)).toBe(product);
    });

    it('devuelve undefined si no existe', async () => {
        expect(await repository.findById('x')).toBeUndefined();
    });

    it('lista todos los productos', async () => {
        await repository.save(buildProduct('123e4567-e89b-42d3-a456-426614174000', 'A'));
        await repository.save(buildProduct('123e4567-e89b-42d3-a456-426614174001', 'B'));

        expect(await repository.findAll()).toHaveLength(2);
    });
});
