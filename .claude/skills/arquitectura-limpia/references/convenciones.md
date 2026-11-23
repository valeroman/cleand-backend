# Convenciones

Valores del proyecto de referencia (backend). Ante un proyecto existente, prevalece lo que ya haga su codigo, tsconfig y linter.

## Stack de referencia
TypeScript, Node >= 24 (ejecuta `.ts` directo), Express 5, zod, Vitest. Comandos: `npm test`, `npm run test:watch`.

## TypeScript
- Imports relativos con extension `.ts` (`allowImportingTsExtensions`) si el tsconfig lo permite.
- Tipos/interfaces con `import type` (`verbatimModuleSyntax`). Mezcla: `import { Payment, type CreatePaymentData } from ...`.
- `erasableSyntaxOnly`: sin enums, parameter properties ni namespaces. Declarar campos y asignar en el constructor. Enums → `const x = [...] as const; type X = (typeof x)[number];`.

## Estilo
- 4 espacios, comillas simples, punto y coma.
- Comentarios y mensajes de error en espanol, sin tildes.
- Cada archivo de codigo nuevo abre con comentario de 2 lineas: que es + por que existe.
- Cada carpeta nueva lleva `README.md` en espanol.

## Entidades (backend y frontend)
- Constructor privado; `static create(input)` valida y normaliza (`trim`, copia de `Date`).
- Campos `readonly`; `Object.freeze(this)` al final del constructor.
- Lanzan `ValidationError` con mensaje en espanol.
- Ids: UUID via `isUuid`; generados por `IdGenerator`, fechas por `Clock` (inyectados en el caso de uso).
- En frontend la entidad se construye desde la respuesta de la API (`create` con los datos recibidos); no se usa el DTO crudo en la UI.

## Errores
- `ValidationError`, `ConflictError`, `NotFoundError` de `shared/domain/errors/domain.errors.ts`. Sin librerias de terceros.
- Backend: traduccion a HTTP solo en el error handler; error nuevo → mapearlo ahi.
- Frontend: traduccion HTTP→dominio solo en infrastructure (`http-client` / repositorio http); dominio→mensaje solo en presentation.
- `NotFoundError` lo lanza el caso de uso (`find-by-id`), no el repositorio (devuelve `undefined`).
- Unicidad: el caso de uso consulta y lanza `ConflictError`; el repositorio tambien protege en `save` si la tecnologia lo permite.

## Inversion de dependencias (obligatorio)
1. Dominio define contrato en `domain/repositories/`.
2. Infrastructure: `class X implements Interfaz`.
3. Caso de uso recibe interfaz por constructor (campos `private readonly` asignados en el constructor). Sin `new` de dependencias.
4. Dominio/application nunca importan infrastructure/presentation ni librerias de framework (Express, React, fetch...).
5. La implementacion concreta se inyecta en el punto de composicion (si el proyecto lo tiene) y en los tests. Sin punto de composicion: no crear uno por cuenta propia; entregar el cableado al usuario.

## Presentation backend
- Schema zod valida solo la forma (tipos); mensajes en espanol.
- Controlador: clase con `handle(...)`, caso de uso por constructor, sin `request/response`.
- Ruta: `create<Nombres>Router(controladores...)`; POST con `requireJson, json({ limit: '64kb' }), validateBody(schema)`; 201 al crear, 200 al leer; `router.all('/', ...)` responde 405 con `Allow`.

## Presentation frontend
- Componentes y paginas no instancian repositorios ni casos de uso: los reciben (props, contexto, hook de inyeccion o el mecanismo del framework).
- Hooks (`use-<accion>-<nombre>.hook.ts`) llaman al caso de uso y exponen `data/loading/error`.
- Componentes solo pintan y delegan; sin reglas de negocio (viven en la entidad).
- Schemas zod de formulario validan forma; la entidad valida negocio.

## Tests
- Vitest (o el runner del proyecto), `describe`/`it`, descripciones en espanol, ruta espejando `src/`, cabecera de 2 lineas.
- Casos de uso: repo in-memory real (o doble del contrato) + dobles fijos `const idGenerator: IdGenerator = { generate: () => fixedId }`, `const clock: Clock = { now: () => fixedDate }`.
- Entidad: creacion, normalizacion, cada validacion, inmutabilidad (`Object.isFrozen`).
- Repo in-memory: guardar/buscar, no existe → `undefined`, duplicado → `ConflictError`, listar.
- Repo http (frontend): doble de `fetch`; probar mapeo status → errores de dominio y respuesta → entidad.
