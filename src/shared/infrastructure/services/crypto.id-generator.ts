// Implementacion de IdGenerator con el modulo nativo node:crypto: genera UUID v4 sin dependencias de terceros.
// Aisla la tecnologia concreta en infrastructure; sin ella, dominio y aplicacion tendrian que conocer el runtime.

import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../../domain/services/id-generator.ts';

export class CryptoIdGenerator implements IdGenerator {
    generate(): string {
        return randomUUID();
    }
}
