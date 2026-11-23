// Pruebas del caso de uso ListProductsUseCase: verifican listado vacio y con datos.
// Aseguran que el caso de uso devuelva lo que contiene el repositorio.

import { describe, it, expect } from 'vitest';
import { ListProductsUseCase } from '../../../../src/products/application/use-cases/list-products.use-case.ts';
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

describe('ListProductsUseCase', () => {
    it('devuelve lista vacia si no hay productos', async () => {
        const useCase = new ListProductsUseCase(new InMemoryProductRepository());

        expect(await useCase.execute()).toEqual([]);
    });

    it('devuelve todos los productos guardados', async () => {
        const repository = new InMemoryProductRepository();
        await repository.save(buildProduct('123e4567-e89b-42d3-a456-426614174000', 'A'));
        await repository.save(buildProduct('123e4567-e89b-42d3-a456-426614174001', 'B'));

        expect(await new ListProductsUseCase(repository).execute()).toHaveLength(2);
    });
});
