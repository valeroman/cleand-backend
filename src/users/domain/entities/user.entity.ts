// Entidad del dominio User: reune los datos y las reglasque mantienen valido e inmutable cada usuario.
// Centraliza esas garantias; sin ellas, cada consumidor tendria que repetirlas y podrian circular datos del negocio invalidos.

// El constructor privado dirige la creacion a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze() impide cambios en ejecucion.

import { ValidationError } from "../../../shared/domain/errors/domain.errors.ts";

const userRoles = ["user", "admin", "sales"] as const;
export type UserRole = (typeof userRoles)[number];

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CreateUserData {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;

  private constructor(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }) {
    const { id, email, name, role } = user;
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;

    Object.freeze(this);
  }

  static create(input: CreateUserData): User {
    const { id, email, name, role = "user" } = input;
    const cleanName = name.trim();

    if (!uuidRegex.test(id)) {
      throw new ValidationError("El id debe ser un UUID valido");
    }
    const cleanEmail = User.normalizeEmail(email);

    if (!cleanName) {
      throw new ValidationError("El nombre es obligatorio");
    }

    if (!userRoles.includes(role)) {
      throw new ValidationError(`El role ${role} no es valido`)
    }

    if (!cleanEmail.includes("@")) {
      throw new ValidationError("El email debe contener un @");
    }

    return new User({ id, name: cleanName, email: cleanEmail, role: role });
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
