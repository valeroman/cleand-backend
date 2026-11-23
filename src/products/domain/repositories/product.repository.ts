// Contrato del dominio: define como buscar y guardar productos sin elegir una tecnologia de almacenamiento.
// Invierte la dependencia hacia una abstraccion; sin el, los casos de uso quedarian acoplados a un repositorio concreto.

import type { Product } from '../entities/product.entity.ts';

export interface ProductRepository {
    findById(id: string): Promise<Product | undefined>;
    findAll(): Promise<Product[]>;
    save(product: Product): Promise<void>;
}
