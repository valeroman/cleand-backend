import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';

describe('InMemoryUserRepository', () => {
    let repository: InMemoryUserRepository;

    beforeEach(() => {
        repository = new InMemoryUserRepository();
    });

    it('findByEmail devuelve undefined si el usuario no existe', async () => {
        const result = await repository.findByEmail('nadie@example.com');

        expect(result).toBeUndefined();
    });

    it('save guarda el usuario y findByEmail lo recupera', async () => {
        const user = User.create({ id, name: 'Ana', email: 'ana@example.com' });

        await repository.save(user);

        expect(await repository.findByEmail('ana@example.com')).toBe(user);
    });

    it('save lanza ConflictError si el email ya esta registrado', async () => {
        await repository.save(User.create({ id, name: 'Ana', email: 'ana@example.com' }));

        await expect(
            repository.save(User.create({ id, name: 'Otra Ana', email: 'ana@example.com' })),
        ).rejects.toThrow(ConflictError);
    });

    it('save no sobrescribe el usuario original tras un conflicto', async () => {
        const original = User.create({ id, name: 'Ana', email: 'ana@example.com' });
        await repository.save(original);

        await repository
            .save(User.create({ id, name: 'Otra Ana', email: 'ana@example.com' }))
            .catch(() => undefined);

        expect(await repository.findByEmail('ana@example.com')).toBe(original);
    });
});
