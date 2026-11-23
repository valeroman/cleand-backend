// Pruebas del caso de uso CreateProductUseCase: verifican alta con id inyectado y validaciones.
// Aseguran que la secuencia crear -> guardar se mantenga correcta.

import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProductUseCase } from '../../../../src/products/application/use-cases/create-product.use-case.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';

const fixedId = '123e4567-e89b-42d3-a456-426614174000';

const input = {
    name: 'Teclado',
    price: 50,
    stock: 3,
    description: 'Teclado mecanico',
    category: 'perifericos',
    images: ['a.png'],
};

describe('CreateProductUseCase', () => {
    let repository: InMemoryProductRepository;
    let useCase: CreateProductUseCase;
    const idGenerator: IdGenerator = { generate: () => fixedId };

    beforeEach(() => {
        repository = new InMemoryProductRepository();
        useCase = new CreateProductUseCase(repository, idGenerator);
    });

    it('crea un producto con el id inyectado', async () => {
        const product = await useCase.execute(input);

        expect(product).toBeInstanceOf(Product);
        expect(product.id).toBe(fixedId);
        expect(product.name).toBe('Teclado');
    });

    it('guarda el producto en el repositorio', async () => {
        const product = await useCase.execute(input);

        expect(await repository.findById(fixedId)).toBe(product);
    });

    it('lanza ValidationError y no guarda si el precio es invalido', async () => {
        await expect(useCase.execute({ ...input, price: -1 })).rejects.toThrow(ValidationError);

        expect(await repository.findAll()).toEqual([]);
    });
});
