// Pruebas del caso de uso RegisterUserUseCase: verifican registro, duplicados y validaciones.
// Aseguran que la secuencia crear -> comprobar duplicado -> guardar se mantenga correcta.

import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../../src/users/application/use-cases/register-user.use-case.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ConflictError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

describe('RegisterUserUseCase', () => {
    let repository: InMemoryUserRepository;
    let useCase: RegisterUserUseCase;

    beforeEach(() => {
        repository = new InMemoryUserRepository();
        useCase = new RegisterUserUseCase(repository);
    });

    it('registra un usuario y lo devuelve', async () => {
        const user = await useCase.execute('Ana', 'ana@example.com');

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('Ana');
        expect(user.email).toBe('ana@example.com');
    });

    it('guarda el usuario en el repositorio', async () => {
        const user = await useCase.execute('Ana', 'ana@example.com');

        expect(await repository.findByEmail('ana@example.com')).toBe(user);
    });

    it('normaliza nombre y email antes de guardar', async () => {
        const user = await useCase.execute('  Ana  ', '  ANA@Example.com ');

        expect(user.name).toBe('Ana');
        expect(user.email).toBe('ana@example.com');
        expect(await repository.findByEmail('ana@example.com')).toBe(user);
    });

    it('lanza ConflictError si el email ya esta registrado', async () => {
        await useCase.execute('Ana', 'ana@example.com');

        await expect(useCase.execute('Otra Ana', 'ana@example.com')).rejects.toThrow(ConflictError);
    });

    it('lanza ConflictError si el email duplicado difiere en mayusculas o espacios', async () => {
        await useCase.execute('Ana', 'ana@example.com');

        await expect(useCase.execute('Otra Ana', '  ANA@example.com ')).rejects.toThrow(ConflictError);
    });

    it('no sobrescribe el usuario original tras un conflicto', async () => {
        const original = await useCase.execute('Ana', 'ana@example.com');

        await useCase.execute('Otra Ana', 'ana@example.com').catch(() => undefined);

        expect(await repository.findByEmail('ana@example.com')).toBe(original);
    });

    it('lanza ValidationError si el nombre esta vacio y no guarda nada', async () => {
        await expect(useCase.execute('   ', 'ana@example.com')).rejects.toThrow(ValidationError);

        expect(await repository.findByEmail('ana@example.com')).toBeUndefined();
    });

    it('lanza ValidationError si el email no contiene @ y no guarda nada', async () => {
        await expect(useCase.execute('Ana', 'ana.example.com')).rejects.toThrow(ValidationError);

        expect(await repository.findByEmail('ana.example.com')).toBeUndefined();
    });

    it('permite registrar usuarios con emails distintos', async () => {
        await useCase.execute('Ana', 'ana@example.com');
        const otro = await useCase.execute('Luis', 'luis@example.com');

        expect(await repository.findByEmail('luis@example.com')).toBe(otro);
    });
});
