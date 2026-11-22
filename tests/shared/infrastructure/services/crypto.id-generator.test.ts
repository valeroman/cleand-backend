// Pruebas de CryptoIdGenerator: verifican formato UUID v4 y unicidad.
// Aseguran que el generador nativo cumple el contrato que espera la entidad User.

import { describe, it, expect } from 'vitest';
import { CryptoIdGenerator } from '../../../../src/shared/infrastructure/services/crypto.id-generator.ts';

describe('CryptoIdGenerator', () => {
    it('genera un UUID v4 valido', () => {
        const id = new CryptoIdGenerator().generate();

        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('genera ids distintos en cada llamada', () => {
        const generator = new CryptoIdGenerator();

        expect(generator.generate()).not.toBe(generator.generate());
    });
});
