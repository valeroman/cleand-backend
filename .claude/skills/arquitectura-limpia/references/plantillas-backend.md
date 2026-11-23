# Plantillas backend

Domain y application tambien aplican al frontend (mismos nombres y rutas). Para infrastructure http y presentation de UI ver `plantillas-frontend.md`.

Placeholders: `<modulo>` (carpeta, plural kebab, ej. `payments`), `<nombre>` (recurso singular kebab, ej. `payment`), `<Nombre>` (PascalCase), `<campo>`. Todas las cabeceras de 2 lineas: que es + por que existe. Adaptar los campos y reglas al recurso.

## domain/entities/<nombre>.entity.ts
```ts
// Entidad del dominio <Nombre>: reune los datos y las reglas que mantienen valido e inmutable cada <nombre>.
// Centraliza esas garantias; sin ellas, cada consumidor tendria que repetirlas y podrian circular datos invalidos.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';

const <nombre>Statuses = ['a', 'b'] as const;
export type <Nombre>Status = (typeof <nombre>Statuses)[number];

export interface Create<Nombre>Data {
    id: string;
    reference: string;
    createdAt: Date;
    status?: <Nombre>Status;
}

export class <Nombre> {
    readonly id: string;
    readonly reference: string;
    readonly status: <Nombre>Status;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    private constructor(data: {
        id: string;
        reference: string;
        status: <Nombre>Status;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = data.id;
        this.reference = data.reference;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;

        Object.freeze(this);
    }

    static create(input: Create<Nombre>Data): <Nombre> {
        const { id, reference, createdAt, status = 'a' } = input;
        const cleanReference = reference.trim();

        if (!isUuid(id)) {
            throw new ValidationError('El id debe ser un UUID valido');
        }

        if (!cleanReference) {
            throw new ValidationError('La referencia es obligatoria');
        }

        if (!<nombre>Statuses.includes(status)) {
            throw new ValidationError(`El status ${status} no es valido`);
        }

        // Copias de la fecha: el Date es mutable y la entidad debe ser inmutable.
        return new <Nombre>({
            id,
            reference: cleanReference,
            status,
            createdAt: new Date(createdAt),
            updatedAt: new Date(createdAt),
        });
    }
}
```

## domain/repositories/<nombre>.repository.ts
```ts
// Contrato del dominio: define como buscar y guardar <nombre>s sin elegir una tecnologia de almacenamiento.
// Invierte la dependencia hacia una abstraccion; sin el, los casos de uso quedarian acoplados a un repositorio concreto.

import type { <Nombre> } from '../entities/<nombre>.entity.ts';

export interface <Nombre>Repository {
    findById(id: string): Promise<<Nombre> | undefined>;
    findByReference(reference: string): Promise<<Nombre> | undefined>;
    findAll(): Promise<<Nombre>[]>;
    save(<nombre>: <Nombre>): Promise<void>;
}
```

## infrastructure/repositories/in-memory.<nombre>-repository.ts
```ts
// Implementacion en memoria de <Nombre>Repository: guarda los <nombre>s en un Map mientras el proceso vive.
// Sirve para desarrollo y tests sin base de datos; se reemplaza por otra tecnologia sin tocar dominio ni aplicacion.

import type { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';
import type { <Nombre>Repository } from '../../domain/repositories/<nombre>.repository.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class InMemory<Nombre>Repository implements <Nombre>Repository {
    private readonly items = new Map<string, <Nombre>>();

    async findById(id: string): Promise<<Nombre> | undefined> {
        return this.items.get(id);
    }

    async findByReference(reference: string): Promise<<Nombre> | undefined> {
        for (const item of this.items.values()) {
            if (item.reference === reference) {
                return item;
            }
        }
        return undefined;
    }

    async findAll(): Promise<<Nombre>[]> {
        return [...this.items.values()];
    }

    async save(<nombre>: <Nombre>): Promise<void> {
        if (await this.findByReference(<nombre>.reference)) {
            throw new ConflictError('La referencia ya esta registrada');
        }

        this.items.set(<nombre>.id, <nombre>);
    }
}
```

## application/use-cases/create-<nombre>.use-case.ts
```ts
// Caso de uso de aplicacion: coordina la creacion de un <nombre>, la comprobacion de duplicados y su guardado.
// Hace reutilizable el alta sin conocer HTTP ni el almacenamiento concreto; sin el, esa secuencia se repartiria entre adaptadores.

import { <Nombre>, type Create<Nombre>Data } from '../../domain/entities/<nombre>.entity.ts';
import type { <Nombre>Repository } from '../../domain/repositories/<nombre>.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';
import type { Clock } from '../../../shared/domain/services/clock.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class Create<Nombre>UseCase {
    private readonly repository: <Nombre>Repository;
    private readonly idGenerator: IdGenerator;
    private readonly clock: Clock;

    constructor(repository: <Nombre>Repository, idGenerator: IdGenerator, clock: Clock) {
        this.repository = repository;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    async execute(input: Omit<Create<Nombre>Data, 'id' | 'createdAt' | 'status'>): Promise<<Nombre>> {
        const <nombre> = <Nombre>.create({
            ...input,
            id: this.idGenerator.generate(),
            createdAt: this.clock.now(),
        });

        if (await this.repository.findByReference(<nombre>.reference)) {
            throw new ConflictError('La referencia ya esta registrada');
        }

        await this.repository.save(<nombre>);
        return <nombre>;
    }
}
```

## application/use-cases/find-<nombre>-by-id.use-case.ts
```ts
// Caso de uso de aplicacion: busca un <nombre> por id y falla si no existe.
// Evita que los adaptadores decidan que significa "no encontrado"; sin el, cada uno lo resolveria a su manera.

import type { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';
import type { <Nombre>Repository } from '../../domain/repositories/<nombre>.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class Find<Nombre>ByIdUseCase {
    private readonly repository: <Nombre>Repository;

    constructor(repository: <Nombre>Repository) {
        this.repository = repository;
    }

    async execute(id: string): Promise<<Nombre>> {
        const <nombre> = await this.repository.findById(id);

        if (!<nombre>) {
            throw new NotFoundError('<Nombre> no encontrado');
        }

        return <nombre>;
    }
}
```

## application/use-cases/list-<nombre>s.use-case.ts
```ts
// Caso de uso de aplicacion: devuelve todos los <nombre>s registrados.
// Aisla la lectura masiva del almacenamiento concreto; sin el, los adaptadores consultarian el repositorio directamente.

import type { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';
import type { <Nombre>Repository } from '../../domain/repositories/<nombre>.repository.ts';

export class List<Nombre>sUseCase {
    private readonly repository: <Nombre>Repository;

    constructor(repository: <Nombre>Repository) {
        this.repository = repository;
    }

    async execute(): Promise<<Nombre>[]> {
        return this.repository.findAll();
    }
}
```

## presentation/schemas/create-<nombre>.schema.ts
```ts
// Esquema HTTP para crear un <nombre>: valida la forma del cuerpo con zod.
// Rechaza tipos incorrectos antes del controlador; las reglas de negocio las valida la entidad.

import z from 'zod';

export const create<Nombre>Schema = z.object(
    {
        reference: z.string({ error: 'reference debe de ser texto' }),
    },
    { error: 'El cuerpo debe ser un JSON' },
);

export type Create<Nombre>Input = z.infer<typeof create<Nombre>Schema>;
```

## presentation/controllers/create-<nombre>.controller.ts
```ts
// Controlador de creacion de <nombre>s: adapta la entrada HTTP ya validada al caso de uso.
// Mantiene los casos de uso libres de detalles HTTP.

import type { Create<Nombre>UseCase } from '../../application/use-cases/create-<nombre>.use-case.ts';
import type { Create<Nombre>Input } from '../schemas/create-<nombre>.schema.ts';

export class Create<Nombre>Controller {
    private readonly create<Nombre>UseCase: Create<Nombre>UseCase;

    constructor(create<Nombre>UseCase: Create<Nombre>UseCase) {
        this.create<Nombre>UseCase = create<Nombre>UseCase;
    }

    async handle(input: Create<Nombre>Input) {
        return this.create<Nombre>UseCase.execute({
            reference: input.reference,
        });
    }
}
```

`find-<nombre>-by-id.controller.ts`: `handle(id: string)` → `execute(id)`. `list-<nombre>s.controller.ts`: `handle()` → `execute()`. Misma estructura (campo privado readonly + constructor).

## presentation/routes/<nombre>.routes.ts
```ts
// Rutas HTTP de <nombre>s: crear, listar y consultar por id.
// Conecta Express con los controladores y traduce resultados a respuestas.

import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { create<Nombre>Schema } from '../schemas/create-<nombre>.schema.ts';
import type { Create<Nombre>Controller } from '../controllers/create-<nombre>.controller.ts';
import type { Find<Nombre>ByIdController } from '../controllers/find-<nombre>-by-id.controller.ts';
import type { List<Nombre>sController } from '../controllers/list-<nombre>s.controller.ts';

export function create<Nombre>sRouter(
    create<Nombre>Controller: Create<Nombre>Controller,
    find<Nombre>ByIdController: Find<Nombre>ByIdController,
    list<Nombre>sController: List<Nombre>sController,
) {
    const router = Router();

    router.post(
        '/',
        requireJson,
        json({ limit: '64kb' }),
        validateBody(create<Nombre>Schema),
        async (request, response) => {
            const <nombre> = await create<Nombre>Controller.handle(request.body);
            response.status(201).json(<nombre>);
        },
    );

    router.get('/', async (_request, response) => {
        response.status(200).json(await list<Nombre>sController.handle());
    });

    router.get('/:id', async (request, response) => {
        response.status(200).json(await find<Nombre>ByIdController.handle(request.params.id));
    });

    router.all('/', (_request, response) => {
        response.set('Allow', 'GET, POST').status(405).json({ error: 'Método no permitido' });
    });

    return router;
}
```

## Cableado (solo si el proyecto tiene punto de composicion, ej. src/app.composition.ts)
Si no existe, no crearlo por cuenta propia: mostrar al usuario estas lineas y preguntar donde cablearlas.
Agregar imports y, en cada seccion existente (respetar el orden y estilo del archivo):
```ts
// Repositorios
const <nombre>Repository = new InMemory<Nombre>Repository();
// Casos de uso
const create<Nombre>UseCase = new Create<Nombre>UseCase(<nombre>Repository, idGenerator, clock);
const find<Nombre>ByIdUseCase = new Find<Nombre>ByIdUseCase(<nombre>Repository);
const list<Nombre>sUseCase = new List<Nombre>sUseCase(<nombre>Repository);
// Controladores
const create<Nombre>Controller = new Create<Nombre>Controller(create<Nombre>UseCase);
// ...find y list analogos
// Rutas de la app
router.use('/<nombre>s', create<Nombre>sRouter(create<Nombre>Controller, find<Nombre>ByIdController, list<Nombre>sController));
```

## README.md (espanol, una frase que diga que va ahi y por que)
- `src/<modulo>/README.md`: `# <Modulo>` — Modulo de <modulo>: <que hace>. Agrupa sus capas para aislarlo de otros modulos.
- `domain/README.md`: entidades y contratos del negocio, sin frameworks ni tecnologia de almacenamiento.
- `application/README.md`: orquesta el dominio mediante casos de uso. Depende solo de interfaces.
- `application/use-cases/README.md`: un caso de uso por accion. Reciben dependencias por constructor.
- `domain/entities/README.md`: objetos del negocio y reglas que deben cumplir.
- `domain/repositories/README.md`: contratos (interfaces); el dominio los define, infrastructure los implementa.
- `infrastructure/README.md` y `infrastructure/repositories/README.md`: implementaciones concretas por tecnologia.
- `presentation/README.md`: rutas, controladores y esquemas; errores de dominio se traducen en el error handler.
- `presentation/{controllers,routes,schemas}/README.md`: adaptan entrada HTTP / rutas Express / esquemas zod de forma.

## Tests (cabecera de 2 lineas en cada uno)
Rutas: `tests/<modulo>/domain/entities/<nombre>.entity.test.ts`, `tests/<modulo>/application/use-cases/<accion>-<nombre>.use-case.test.ts`, `tests/<modulo>/infrastructure/repositories/in-memory.<nombre>-repository.test.ts`.

Caso de uso (create):
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Create<Nombre>UseCase } from '../../../../src/<modulo>/application/use-cases/create-<nombre>.use-case.ts';
import { InMemory<Nombre>Repository } from '../../../../src/<modulo>/infrastructure/repositories/in-memory.<nombre>-repository.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';
import type { Clock } from '../../../../src/shared/domain/services/clock.ts';

const fixedId = '123e4567-e89b-42d3-a456-426614174000';
const fixedDate = new Date('2026-01-01T10:00:00.000Z');

describe('Create<Nombre>UseCase', () => {
    let repository: InMemory<Nombre>Repository;
    let useCase: Create<Nombre>UseCase;
    const idGenerator: IdGenerator = { generate: () => fixedId };
    const clock: Clock = { now: () => fixedDate };

    beforeEach(() => {
        repository = new InMemory<Nombre>Repository();
        useCase = new Create<Nombre>UseCase(repository, idGenerator, clock);
    });

    it('crea y guarda el <nombre> con id y fecha inyectados', async () => {
        const <nombre> = await useCase.execute({ reference: 'REF-001' });

        expect(<nombre>.id).toBe(fixedId);
        expect(await repository.findById(fixedId)).toBe(<nombre>);
    });

    it('lanza ConflictError si la referencia ya existe', async () => {
        await useCase.execute({ reference: 'REF-001' });

        await expect(useCase.execute({ reference: ' REF-001 ' })).rejects.toThrow(ConflictError);
    });
});
```
Entidad y repositorio: seguir `tests/payments/domain/entities/payment.entity.test.ts` y `tests/payments/infrastructure/repositories/in-memory.payment-repository.test.ts`. Find-by-id: caso existente + `NotFoundError`.
