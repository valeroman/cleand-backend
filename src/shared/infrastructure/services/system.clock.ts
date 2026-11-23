// Implementacion de Clock que usa el reloj del sistema.
// Existe para inyectar la fecha real en produccion; los tests usan un Clock fijo.

import type { Clock } from '../../domain/services/clock.ts';

export class SystemClock implements Clock {
    now(): Date {
        return new Date();
    }
}
