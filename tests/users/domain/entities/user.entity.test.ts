import {describe, expect, test} from 'vitest';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '123e4567-e89b-42d3-a456-426614174000';

describe("User Entity", () => {
    test('crea un usuario y normaliza su nombre y email', () => {

        const user = User.create({ id, name: '   Ana Lopez  ', email: 'ANA@example.coM  ' });

        expect(user).toBeInstanceOf(User);
        expect(user.id).toBe(id);
        expect(user.name).toBe('Ana Lopez');
        expect(user.email).toBe('ana@example.com');
        expect(user.role).toBe('user');

    });

    test.each(['', 'abc', '123e4567-e89b-42d3-a456', 'zzzzzzzz-zzzz-4zzz-azzz-zzzzzzzzzzzz'])('rechaza el id invalido %j', (badId) => {
        expect(() => User.create({ id: badId, name: 'Ana', email: 'ana@example.com' })).toThrow(
            new ValidationError('El id debe ser un UUID valido')
        );
    });

    test.each(['', '    ', '\t\n'])('rechaza el nombre vacio %j', (name) => {
        expect(() => User.create({ id, name, email: 'ana@example.com' })).toThrow(
            new ValidationError('El nombre es obligatorio')
        );
    });

     test.each(['&', '%%', '\t\n'])('rechaza el email sin @ %j', (email) => {
        expect(() => User.create({ id, name: 'Ana Lopez', email })).toThrow(
            new ValidationError('El email debe contener un @')
        );
    });

    test('acepta un email con @ segun la regla actual de dominio', () => {
        const user = User.create({ id, name: 'Ana', email: 'A@B' });
        expect(user.email).toBe('a@b');
    });

    test('impide modifficar sus datos en ejecucion', () => {
        const user = User.create({ id, name: 'Ana', email: 'ana@example.com' });
        expect(Reflect.set(user, 'name', 'Pedro')).toBe(false);
        expect(Reflect.set(user, 'id', 'otro')).toBe(false);
    })
})
