# AGENTS.md

Backend con Arquitectura Limpia. TypeScript, Node >= 24, Vitest.

## Comandos

- `npm test` — vitest run
- `npm run test:watch` — vitest en watch

## Estructura (seguir SIEMPRE antes de crear algo)

Organizado por modulo (`src/<modulo>/`), con capas dentro. Ejemplo actual: `users`.

```
src/
  shared/domain/errors/domain.errors.ts      # ValidationError, ConflictError
  <modulo>/
    domain/
      entities/<nombre>.entity.ts
      repositories/<nombre>.repository.ts    # interfaces (contratos)
    application/
      use-cases/<accion>.use-case.ts
    infrastructure/
      repositories/<tecnologia>.<nombre>-repository.ts   # ej: in-memory.user-repository.ts
    presentation/                            # HTTP/adaptadores, errores de dominio -> respuestas
tests/                                       # espeja src/ (tests/<modulo>/<capa>/...)
  <modulo>/<capa>/.../<archivo>.test.ts
```

Antes de crear un archivo: revisar el file system (`git ls-files`, archivos hermanos) y copiar nombre, ubicacion y estilo del equivalente existente.

## Convenciones

- Nombres de archivo: kebab-case con sufijo de rol: `.entity.ts`, `.repository.ts`, `.use-case.ts`, `.test.ts`.
- Imports relativos con extension `.ts` (`allowImportingTsExtensions`, `verbatimModuleSyntax`).
- Tipos/interfaces con `import type`.
- `erasableSyntaxOnly`: nada de enums, parameter properties ni namespaces. Declarar campos y asignar en el constructor.
- Indentacion 4 espacios, comillas simples, punto y coma.
- Comentarios y mensajes de error en espanol (sin tildes en el codigo existente).
- Cada archivo nuevo de codigo abre con comentario de 2 lineas: que es + por que existe.
- Cada carpeta nueva lleva `README.md` en espanol explicando que va ahi y por que.
- Entidades: constructor privado, `static create()` que valida y normaliza, campos `readonly`, `Object.freeze(this)`.
- Errores de negocio: usar `ValidationError` / `ConflictError` de `shared/domain/errors`. No depender de librerias de terceros para errores. La traduccion a HTTP ocurre solo en presentation.
- Tests: Vitest, `describe`/`it`, descripciones en espanol, ruta en `tests/` espejando `src/`.

## Inversion de dependencias (OBLIGATORIO)

Aplicar siempre al crear casos de uso o repositorios.

1. Dominio define el contrato: interfaz en `domain/repositories/`. Sin tecnologia de almacenamiento, sin frameworks.
2. Infrastructure implementa el contrato: `class X implements <Interfaz>` en `infrastructure/repositories/`.
3. Casos de uso dependen SOLO de la interfaz (`import type { UserRepository }`), recibida por constructor. Nunca importar ni instanciar una implementacion de infrastructure dentro de un caso de uso, ni usar `new` sobre dependencias.
4. Dominio y application nunca importan de infrastructure ni presentation. Direccion de dependencias: presentation/infrastructure -> application -> domain.
5. La implementacion concreta se inyecta en el punto de composicion (fuera del caso de uso) y en los tests.

Plantilla de caso de uso:

```ts
import type { XRepository } from '../../domain/repositories/x.repository.ts';

export class HacerAlgoUseCase {
    private readonly repository: XRepository;

    constructor(repository: XRepository) {
        this.repository = repository;
    }

    async execute(/* params */): Promise<...> { /* ... */ }
}
```

## Checklist al crear algo

- [ ] Ubicacion y nombre iguales a los equivalentes existentes
- [ ] Contrato en domain antes que implementacion en infrastructure
- [ ] Caso de uso recibe interfaz por constructor
- [ ] README.md en carpetas nuevas, comentario de cabecera en archivos nuevos
- [ ] Test en `tests/` espejando la ruta
- [ ] `npm test` pasa
