// Pruebas del caso de uso RegisterUserUseCase: verifican registro, duplicados y validaciones.
// Aseguran que la secuencia crear -> comprobar duplicado -> guardar se mantenga correcta.

import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../../src/users/application/use-cases/register-user.use-case.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ConflictError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';

const fixedId = '123e4567-e89b-42d3-a456-426614174000';

describe('RegisterUserUseCase', () => {
    let repository: InMemoryUserRepository;
    let useCase: RegisterUserUseCase;
    const idGenerator: IdGenerator = { generate: () => fixedId };

    beforeEach(() => {
        repository = new InMemoryUserRepository();
        useCase = new RegisterUserUseCase(repository, idGenerator);
    });

    it('registra un usuario y lo devuelve', async () => {
        const user = await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('Ana');
        expect(user.email).toBe('ana@example.com');
    });

    it('asigna el id generado por el IdGenerator', async () => {
        const user = await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        expect(user.id).toBe(fixedId);
    });

    it('guarda el usuario en el repositorio', async () => {
        const user = await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        expect(await repository.findByEmail('ana@example.com')).toBe(user);
    });

    it('normaliza nombre y email antes de guardar', async () => {
        const user = await useCase.execute({ name: '  Ana  ', email: '  ANA@Example.com ' });

        expect(user.name).toBe('Ana');
        expect(user.email).toBe('ana@example.com');
        expect(await repository.findByEmail('ana@example.com')).toBe(user);
    });

    it('lanza ConflictError si el email ya esta registrado', async () => {
        await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        await expect(useCase.execute({ name: 'Otra Ana', email: 'ana@example.com' })).rejects.toThrow(ConflictError);
    });

    it('lanza ConflictError si el email duplicado difiere en mayusculas o espacios', async () => {
        await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        await expect(useCase.execute({ name: 'Otra Ana', email: '  ANA@example.com ' })).rejects.toThrow(ConflictError);
    });

    it('no sobrescribe el usuario original tras un conflicto', async () => {
        const original = await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        await useCase.execute({ name: 'Otra Ana', email: 'ana@example.com' }).catch(() => undefined);

        expect(await repository.findByEmail('ana@example.com')).toBe(original);
    });

    it('lanza ValidationError si el nombre esta vacio y no guarda nada', async () => {
        await expect(useCase.execute({ name: '   ', email: 'ana@example.com' })).rejects.toThrow(ValidationError);

        expect(await repository.findByEmail('ana@example.com')).toBeUndefined();
    });

    it('lanza ValidationError si el email no contiene @ y no guarda nada', async () => {
        await expect(useCase.execute({ name: 'Ana', email: 'ana.example.com' })).rejects.toThrow(ValidationError);

        expect(await repository.findByEmail('ana.example.com')).toBeUndefined();
    });

    it('permite registrar usuarios con emails distintos', async () => {
        await useCase.execute({ name: 'Ana', email: 'ana@example.com' });
        const otro = await useCase.execute({ name: 'Luis', email: 'luis@example.com' });

        expect(await repository.findByEmail('luis@example.com')).toBe(otro);
    });
});
