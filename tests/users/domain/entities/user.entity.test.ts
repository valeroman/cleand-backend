import {describe, expect, test} from 'vitest';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';


describe("User Entity", () => {
    test('crea un usuario y normaliza su nombre y email', () => {
        
        const user = User.create('   Ana Lopez  ', 'ANA@example.coM  ');

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('Ana Lopez');
        expect(user.email).toBe('ana@example.com');

    }); 

    test.each(['', '    ', '\t\n'])('rechaza el nombre vacio %j', (name) => {
        expect(() => User.create(name, 'ana@example.com')).toThrow(
            new ValidationError('El nombre es obligatorio')
        );
    });

     test.each(['&', '%%', '\t\n'])('rechaza el email sin @ %j', (email) => {
        expect(() => User.create('Ana Lopez', email)).toThrow(
            new ValidationError('El email debe contener un @')
        );
    });

    test('acepta un email con @ segun la regla actual de dominio', () => {
        const user = User.create('Ana', 'A@B');
        expect(user.email).toBe('a@b');
    });

    test('impide modifficar sus datos en ejecucion', () => {
        const user = User.create('Ana', 'ana@example.com');
        expect(Reflect.set(user, 'name', 'Pedro')).toBe(false);
    })
})