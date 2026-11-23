---
name: arquitectura-limpia
description: Crea modulos, entidades, repositorios, casos de uso y tests con Arquitectura Limpia en proyectos TypeScript, tanto backend (Express) como frontend. Usar al pedir "crear modulo", "nuevo caso de uso", "nueva entidad", "repositorio", "endpoint", "pantalla/componente de un modulo", "CRUD" o "arquitectura limpia". Impone estructura de carpetas, nombres de archivo, proposito de cada capa e inversion de dependencias. No asume que exista un archivo de composicion.
---

# Arquitectura Limpia (backend y frontend)

Mismas carpetas, mismos nombres y misma regla de dependencias en ambos lados. Solo cambian `infrastructure` (como se persiste/consume) y `presentation` (HTTP vs UI).

## Archivos de apoyo (leer segun necesidad)

- `references/estructura.md` — arbol comun + variantes backend/frontend, objetivo de cada carpeta/archivo.
- `references/convenciones.md` — estilo, flags TS, errores, DI, capas.
- `references/plantillas-backend.md` — plantillas: entidad, repo, casos de uso, schema, controller, routes, tests.
- `references/plantillas-frontend.md` — plantillas: repo http, componentes/paginas/hooks, mapeo de errores.

## Paso 0: detectar el proyecto (no asumir)

1. `git ls-files` y `package.json`: tipo = **backend** (express/fastify/etc.), **frontend** (react/vue/angular/svelte/next/etc.) o **ambos** (monorepo / dos carpetas).
2. Si hay un modulo existente, usarlo como referencia canonica; copiar su nombre, ubicacion y estilo. Si el proyecto es nuevo, seguir `references/estructura.md`.
3. **Punto de composicion**: buscar donde se hace `new` de implementaciones (ej. `app.composition.ts`, `main.ts`, `container.ts`, providers/contexto del framework). 
   - Si existe: cablear ahi siguiendo su orden y estilo.
   - Si NO existe: no inventarlo ni asumirlo. Entregar el modulo completo y mostrar al usuario las lineas de cableado (que instanciar y con que dependencias); preguntar si quiere crearlo. Los tests siempre inyectan la implementacion a mano.
4. Framework del frontend desconocido o ambiguo: preguntar una vez antes de crear la capa presentation.

## Flujo comun al crear un modulo `<modulo>` con recurso `<nombre>`

1. **Domain**: `entities/<nombre>.entity.ts` → `repositories/<nombre>.repository.ts` (interfaz; sin tecnologia, frameworks ni `fetch`/Express).
2. **Application**: `use-cases/<accion>-<nombre>.use-case.ts`. Una accion por archivo; interfaces por constructor (`IdGenerator`, `Clock` de `shared/domain/services/` si aplica). Nunca `new` de dependencias ni imports de infrastructure/presentation.
3. **Infrastructure**: `repositories/<tecnologia>.<nombre>-repository.ts` con `implements <Nombre>Repository`.
   - Backend: `in-memory`, base de datos, etc.
   - Frontend: `http` (API), `local-storage`, `in-memory`, etc.
4. **Presentation**:
   - Backend: `schemas/`, `controllers/`, `routes/` (ver plantillas-backend).
   - Frontend: `components/`, `pages/`, `hooks/` (y `schemas/` para formularios) (ver plantillas-frontend).
5. **Cableado** (si hay punto de composicion; ver Paso 0).
6. **Docs**: `README.md` en espanol en cada carpeta nueva; comentario de 2 lineas (que es + por que existe) al abrir cada archivo de codigo nuevo.
7. **Tests** en `tests/` espejando `src/`: entidad, casos de uso, repositorio. Dobles fijos de `IdGenerator`/`Clock`; en frontend, repositorio in-memory o doble del contrato.
8. **Verificar**: ejecutar el comando de tests del proyecto (`npm test`) y typecheck si existe.

## Reglas duras

- Direccion de dependencias: presentation/infrastructure → application → domain. Domain y application nunca importan infrastructure ni presentation (ni React/Express/fetch).
- Casos de uso dependen SOLO de interfaces (`import type`), inyectadas por constructor.
- Errores de negocio: `ValidationError` / `ConflictError` / `NotFoundError` de `shared/domain/errors/domain.errors.ts`.
  - Backend: traduccion a HTTP solo en el error handler del servidor.
  - Frontend: la infraestructura traduce respuestas HTTP a errores de dominio; presentation los traduce a mensajes de UI.
- Reglas de negocio en la entidad; schemas (zod) solo validan forma.
- Entidades: constructor privado, `static create()` valida y normaliza, campos `readonly`, `Object.freeze(this)`.
- Sin enums/parameter properties/namespaces (`erasableSyntaxOnly`) si el tsconfig lo activa: `as const` + tipo union.
- Respetar idioma y estilo del proyecto (en este: espanol sin tildes, 4 espacios, comillas simples, `;`).

## Checklist final

- [ ] Tipo de proyecto y punto de composicion detectados (no asumidos)
- [ ] Ubicacion y nombres iguales al equivalente existente / a `estructura.md`
- [ ] Contrato en domain antes que implementacion
- [ ] Casos de uso reciben interfaz por constructor
- [ ] README en carpetas nuevas, cabecera en archivos nuevos
- [ ] Cableado hecho o lineas entregadas al usuario
- [ ] Tests espejando la ruta y en verde
