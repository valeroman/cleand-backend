// Contrato del dominio: define como buscar y guardar usuarios sin elegir una tecnologia de almacenamiento.
// Invierte ls dependencia hacia una abstraccion
// Sin el, los casos de uso quedarian aclopados a un repositorio concreto.

import type { User } from '../entities/user.entity';

export interface UserRepository {
    findByEmail(email: string): Promise<User | undefined>;
    save(user: User): Promise<void>;
}