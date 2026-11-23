# Estructura y proposito de cada archivo

Capas y nombres identicos en backend y frontend. Un modulo = una carpeta `src/<modulo>/` con sus 4 capas.

## Arbol comun (backend y frontend)

```
src/
  shared/
    domain/
      errors/domain.errors.ts               # ValidationError, ConflictError, NotFoundError
      services/id-generator.ts              # contrato IdGenerator { generate(): string }
      services/clock.ts                     # contrato Clock { now(): Date }
      validators/uuid.ts                    # isUuid(): regla compartida
    infrastructure/services/
      crypto.id-generator.ts                # IdGenerator con randomUUID
      system.clock.ts                       # Clock con new Date()
  <modulo>/
    README.md
    domain/
      entities/<nombre>.entity.ts           # objeto de negocio + reglas, inmutable
      repositories/<nombre>.repository.ts   # contrato (interfaz) de acceso a datos
    application/
      use-cases/<accion>-<nombre>.use-case.ts   # una accion de negocio por archivo
    infrastructure/
      repositories/<tecnologia>.<nombre>-repository.ts
    presentation/                           # ver variante backend o frontend
tests/                                      # espeja src/
  <modulo>/<capa>/.../<archivo>.test.ts
```

Cada carpeta de `src/<modulo>/` (modulo, capa y subcarpeta) lleva `README.md` en espanol: que va ahi y por que.

## Variante backend (Express)

```
src/
  main.ts                                   # arranque del servidor
  app.composition.ts                        # (si existe) punto de composicion: new + inyeccion
  server/presentation/
    config/express.config.ts                # createExpressApp(router): app, 404, errorHandler
    http/error-handler.ts                   # errores de dominio/body-parser -> respuestas HTTP
    http/require-json.ts                    # exige Content-Type application/json (415)
    http/validate-body.ts                   # validateBody(schema zod) -> ValidationError
    routes/public.routes.ts                 # rutas publicas
  <modulo>/
    infrastructure/repositories/
      in-memory.<nombre>-repository.ts      # tambien: postgres., mongo., etc.
    presentation/
      controllers/<accion>-<nombre>.controller.ts  # adapta entrada HTTP al caso de uso
      routes/<nombre>.routes.ts                    # create<Nombres>Router
      schemas/<accion>-<nombre>.schema.ts          # zod: forma del cuerpo
```

Mapeo errores → HTTP (solo en `error-handler.ts`): ValidationError 400, NotFoundError 404, ConflictError 409, entity.too.large 413, charset/encoding.unsupported 415, otro 500.

## Variante frontend

```
src/
  main.<ext>                                # arranque de la app
  app.composition.<ext> | container | providers   # (si existe) cableado de dependencias
  shared/infrastructure/http/
    http-client.ts                          # cliente HTTP unico (fetch); traduce status -> errores de dominio
  <modulo>/
    infrastructure/repositories/
      http.<nombre>-repository.ts           # implements contrato, consume la API
                                            # tambien: local-storage., in-memory.
    presentation/
      components/<nombre>-<rol>.component.<ext>    # UI reutilizable (ej. payment-form, payment-list)
      pages/<accion>-<nombre>.page.<ext>           # pantalla/ruta del modulo
      hooks/use-<accion>-<nombre>.hook.ts          # une casos de uso con el estado de UI
      schemas/<accion>-<nombre>.schema.ts          # validacion de forma de formularios (zod)
```

`<ext>` y estilo de componentes (`.tsx`, `.vue`, `.svelte`, etc.) segun el framework del proyecto; los sufijos de rol (`.component`, `.page`, `.hook`) se mantienen.

Errores en frontend: `http-client`/repositorio HTTP convierte 400→ValidationError, 404→NotFoundError, 409→ConflictError; hooks/componentes los muestran como mensajes de UI.

## Objetivo por capa

| Capa | Objetivo | Puede importar |
|---|---|---|
| domain | Reglas y contratos del negocio, sin frameworks ni I/O | solo `shared/domain` |
| application | Orquesta el dominio con casos de uso (uno por accion) | domain (interfaces con `import type`) |
| infrastructure | Implementa contratos con una tecnologia concreta | domain, shared/domain |
| presentation | Adaptadores de entrada: HTTP (backend) o UI (frontend) | application, domain (tipos) |
| composicion (opcional) | Unico lugar con `new` de implementaciones | todas |

## Nombres de archivo

kebab-case con sufijo de rol: `.entity.ts`, `.repository.ts`, `.use-case.ts`, `.controller.ts`, `.schema.ts`, `.routes.ts`, `.component.<ext>`, `.page.<ext>`, `.hook.ts`, `.test.ts`. Implementaciones: `<tecnologia>.<nombre>-repository.ts`; servicios shared: `<tecnologia>.<servicio>.ts`.

## Monorepo / backend + frontend

Cada lado es un proyecto con su propio `src/`, `tests/` y `shared/`. Mismo nombre de modulo y de entidad en ambos para mantener paridad; no importar codigo entre ellos salvo que el usuario lo pida (paquete compartido).
