// Pruebas de la entidad Product: verifican creacion, normalizacion, validaciones e inmutabilidad.
// Aseguran que no circulen productos invalidos por el dominio.

import { describe, it, expect } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';

const validData = {
    id,
    name: 'Teclado',
    price: 100.5,
    stock: 10,
    description: 'Teclado mecanico',
    category: 'perifericos',
    images: ['https://cdn.test/a.png'],
};

describe('Product', () => {
    it('crea un producto valido', () => {
        const product = Product.create(validData);

        expect(product.id).toBe(id);
        expect(product.name).toBe('Teclado');
        expect(product.price).toBe(100.5);
        expect(product.stock).toBe(10);
        expect(product.description).toBe('Teclado mecanico');
        expect(product.category).toBe('perifericos');
        expect(product.images).toEqual(['https://cdn.test/a.png']);
    });

    it('acepta stock 0 y lista de imagenes vacia', () => {
        const product = Product.create({ ...validData, stock: 0, images: [] });

        expect(product.stock).toBe(0);
        expect(product.images).toEqual([]);
    });

    it('normaliza texto con trim', () => {
        const product = Product.create({
            ...validData,
            name: '  Teclado ',
            description: ' desc ',
            category: ' cat ',
            images: [' a.png '],
        });

        expect(product.name).toBe('Teclado');
        expect(product.description).toBe('desc');
        expect(product.category).toBe('cat');
        expect(product.images).toEqual(['a.png']);
    });

    it('no comparte la referencia del arreglo de imagenes recibido', () => {
        const images = ['a.png'];
        const product = Product.create({ ...validData, images });
        images.push('b.png');

        expect(product.images).toEqual(['a.png']);
    });

    it('lanza ValidationError si el id no es UUID', () => {
        expect(() => Product.create({ ...validData, id: 'abc' })).toThrow(ValidationError);
    });

    it('lanza ValidationError si el nombre esta vacio', () => {
        expect(() => Product.create({ ...validData, name: '   ' })).toThrow(ValidationError);
    });

    it.each([0, -5, Number.NaN, Infinity])('lanza ValidationError si el precio es %s', (price) => {
        expect(() => Product.create({ ...validData, price })).toThrow(ValidationError);
    });

    it('lanza ValidationError si el precio tiene mas de 2 decimales', () => {
        expect(() => Product.create({ ...validData, price: 10.123 })).toThrow(ValidationError);
    });

    it('acepta precios con 2 decimales aunque el flotante sea impreciso', () => {
        expect(Product.create({ ...validData, price: 0.29 }).price).toBe(0.29);
    });

    it.each([-1, 1.5, Number.NaN, Infinity])('lanza ValidationError si el stock es %s', (stock) => {
        expect(() => Product.create({ ...validData, stock })).toThrow(ValidationError);
    });

    it('lanza ValidationError si la descripcion esta vacia', () => {
        expect(() => Product.create({ ...validData, description: '  ' })).toThrow(ValidationError);
    });

    it('lanza ValidationError si la categoria esta vacia', () => {
        expect(() => Product.create({ ...validData, category: '' })).toThrow(ValidationError);
    });

    it('lanza ValidationError si alguna imagen esta vacia', () => {
        expect(() => Product.create({ ...validData, images: ['a.png', '  '] })).toThrow(ValidationError);
    });

    it('es inmutable', () => {
        const product = Product.create(validData);

        expect(Object.isFrozen(product)).toBe(true);
        expect(Object.isFrozen(product.images)).toBe(true);
    });
});
