// Entidad del dominio User: reune los datos y las reglasque mantienen valido e inmutable cada usuario.
// Centraliza esas garantias; sin ellas, cada consumidor tendria que repetirlas y podrian circular datos del negocio invalidos.

// El constructor privado dirige la creacion a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze() impide cambios en ejecucion.

import { ValidationError } from "../../../shared/domain/errors/domain.errors.ts";
export class User {
  readonly name: string;
  readonly email: string;

  private constructor(name: string, email: string) {
    this.name = name;
    this.email = email;

    Object.freeze(this);
  }

  static create(name: string, email: string): User {
    const cleanName = name.trim();
    const cleanEmail = User.normalizeEmail(email);

    if (!cleanName) {
      throw new ValidationError("El nombre es obligatorio");
    }

    if (!cleanEmail.includes("@")) {
      throw new ValidationError("El email debe contener un @");
    }

    return new User(cleanName, cleanEmail);
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
