// Caso de uso de aplicacion: coordina la creacion de usuario, la comprobacion de duplicados por email y su guardado.
// Hace reutilizable el registro sin conocer HTTP ni el almacenamiento concreto; sin el, esa secuencia se repartiria entre adaptadores.

import { User } from '../../domain/entities/user.entity.ts';
import type { UserRepository } from '../../domain/repositories/user.repository.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';


export class RegisterUserUseCase {

    private readonly repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async execute(name: string, email: string): Promise<User> {
        
        const user = User.create(name, email);

        if (await this.repository.findByEmail(email)) {
            throw new ConflictError('El email ya esta registrado');
        }

        await this.repository.save(user);
        return user;
    }
}