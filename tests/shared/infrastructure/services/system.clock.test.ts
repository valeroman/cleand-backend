// Pruebas de SystemClock: verifican que devuelve la fecha actual como Date.
// Aseguran que la implementacion real cumple el contrato Clock.

import { describe, it, expect } from 'vitest';
import { SystemClock } from '../../../../src/shared/infrastructure/services/system.clock.ts';

describe('SystemClock', () => {
    it('devuelve una fecha cercana a la actual', () => {
        const before = Date.now();
        const now = new SystemClock().now();
        const after = Date.now();

        expect(now).toBeInstanceOf(Date);
        expect(now.getTime()).toBeGreaterThanOrEqual(before);
        expect(now.getTime()).toBeLessThanOrEqual(after);
    });
});
