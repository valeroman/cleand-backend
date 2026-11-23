// Entidad del dominio Product: reune los datos y las reglas que mantienen valido e inmutable cada producto.
// Centraliza esas garantias; sin ellas, cada consumidor tendria que repetirlas y podrian circular productos invalidos.

// El constructor privado dirige la creacion a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze() impide cambios en ejecucion.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';

export interface CreateProductData {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    category: string;
    images: string[];
}

export class Product {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly stock: number;
    readonly description: string;
    readonly category: string;
    readonly images: readonly string[];

    private constructor(product: {
        id: string;
        name: string;
        price: number;
        stock: number;
        description: string;
        category: string;
        images: readonly string[];
    }) {
        this.id = product.id;
        this.name = product.name;
        this.price = product.price;
        this.stock = product.stock;
        this.description = product.description;
        this.category = product.category;
        this.images = product.images;

        Object.freeze(this);
    }

    static create(input: CreateProductData): Product {
        const { id, price, stock, images } = input;
        const name = input.name.trim();
        const description = input.description.trim();
        const category = input.category.trim();

        if (!isUuid(id)) {
            throw new ValidationError('El id debe ser un UUID valido');
        }

        if (!name) {
            throw new ValidationError('El nombre es obligatorio');
        }

        if (!Number.isFinite(price) || price <= 0) {
            throw new ValidationError('El precio debe ser un numero mayor a 0');
        }

        if (Math.abs(price * 100 - Math.round(price * 100)) > 1e-9) {
            throw new ValidationError('El precio admite maximo 2 decimales');
        }

        if (!Number.isInteger(stock) || stock < 0) {
            throw new ValidationError('El stock debe ser un entero mayor o igual a 0');
        }

        if (!description) {
            throw new ValidationError('La descripcion es obligatoria');
        }

        if (!category) {
            throw new ValidationError('La categoria es obligatoria');
        }

        const cleanImages = images.map((image) => image.trim());

        if (cleanImages.some((image) => !image)) {
            throw new ValidationError('Las imagenes no pueden estar vacias');
        }

        // Copia congelada del arreglo: el array es mutable y el producto debe ser inmutable.
        return new Product({
            id,
            name,
            price,
            stock,
            description,
            category,
            images: Object.freeze(cleanImages),
        });
    }
}
