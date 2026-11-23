// Pruebas del caso de uso FindProductByIdUseCase: verifican busqueda exitosa y no encontrado.
// Aseguran que un id inexistente se traduzca en NotFoundError.

import { describe, it, expect } from 'vitest';
import { FindProductByIdUseCase } from '../../../../src/products/application/use-cases/find-product-by-id.use-case.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { NotFoundError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';

describe('FindProductByIdUseCase', () => {
    it('devuelve el producto existente', async () => {
        const repository = new InMemoryProductRepository();
        const product = Product.create({
            id,
            name: 'Teclado',
            price: 10,
            stock: 1,
            description: 'Teclado mecanico',
            category: 'perifericos',
            images: [],
        });
        await repository.save(product);

        expect(await new FindProductByIdUseCase(repository).execute(id)).toBe(product);
    });

    it('lanza NotFoundError si no existe', async () => {
        const useCase = new FindProductByIdUseCase(new InMemoryProductRepository());

        await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    });
});
