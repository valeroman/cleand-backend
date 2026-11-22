// Caso de uso de aplicacion: coordina la creacion de usuario, la comprobacion de duplicados por email y su guardado.
// Hace reutilizable el registro sin conocer HTTP ni el almacenamiento concreto; sin el, esa secuencia se repartiria entre adaptadores.

import { User, type CreateUserData } from '../../domain/entities/user.entity.ts';
import type { UserRepository } from '../../domain/repositories/user.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';


export class RegisterUserUseCase {

    private readonly repository: UserRepository;
    private readonly idGenerator: IdGenerator;

    constructor(repository: UserRepository, idGenerator: IdGenerator) {
        this.repository = repository;
        this.idGenerator = idGenerator;
    }

    async execute(input: Omit<CreateUserData, 'id'>): Promise<User> {

        const user = User.create({ ...input, id: this.idGenerator.generate() });

        if (await this.repository.findByEmail(user.email)) {
            throw new ConflictError('El email ya esta registrado');
        }

        await this.repository.save(user);
        return user;
    }
}