# Plantillas frontend

Domain y application son identicos a `plantillas-backend.md` (entidad, contrato de repositorio, casos de uso, mismos nombres y rutas). Aqui solo lo propio del frontend. Placeholders: `<modulo>`, `<nombre>`, `<Nombre>`. Cabecera de 2 lineas en cada archivo. Ejemplos con TypeScript y React; adaptar `<ext>` y sintaxis al framework real del proyecto (preguntar si no es evidente).

## shared/infrastructure/http/http-client.ts
```ts
// Cliente HTTP unico: envuelve fetch y traduce los status de la API a errores de dominio.
// Centraliza esa traduccion; sin el, cada repositorio decidiria por su cuenta que significa un 404 o un 409.

import { ConflictError, NotFoundError, ValidationError } from '../../domain/errors/domain.errors.ts';

export class HttpClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async request<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: { 'Content-Type': 'application/json', ...init?.headers },
        });
        const body = await response.json().catch(() => ({}));

        if (response.ok) return body as T;

        const message = (body as { error?: string }).error ?? 'Error inesperado';
        if (response.status === 400) throw new ValidationError(message);
        if (response.status === 404) throw new NotFoundError(message);
        if (response.status === 409) throw new ConflictError(message);
        throw new Error(message);
    }
}
```

## infrastructure/repositories/http.<nombre>-repository.ts
```ts
// Implementacion de <Nombre>Repository que consume la API HTTP: convierte las respuestas en entidades.
// Aisla fetch y la forma del JSON en infrastructure; se reemplaza (local-storage, in-memory) sin tocar dominio ni aplicacion.

import { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';
import type { <Nombre>Repository } from '../../domain/repositories/<nombre>.repository.ts';
import type { HttpClient } from '../../../shared/infrastructure/http/http-client.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

interface <Nombre>Dto {
    id: string;
    reference: string;
    createdAt: string;
}

export class Http<Nombre>Repository implements <Nombre>Repository {
    private readonly client: HttpClient;

    constructor(client: HttpClient) {
        this.client = client;
    }

    async findById(id: string): Promise<<Nombre> | undefined> {
        try {
            return this.toEntity(await this.client.request<<Nombre>Dto>(`/<nombre>s/${id}`));
        } catch (error) {
            if (error instanceof NotFoundError) return undefined;
            throw error;
        }
    }

    async findByReference(reference: string): Promise<<Nombre> | undefined> {
        const items = await this.findAll();
        return items.find((item) => item.reference === reference);
    }

    async findAll(): Promise<<Nombre>[]> {
        const dtos = await this.client.request<<Nombre>Dto[]>('/<nombre>s');
        return dtos.map((dto) => this.toEntity(dto));
    }

    async save(<nombre>: <Nombre>): Promise<void> {
        await this.client.request('/<nombre>s', { method: 'POST', body: JSON.stringify(<nombre>) });
    }

    private toEntity(dto: <Nombre>Dto): <Nombre> {
        return <Nombre>.create({ id: dto.id, reference: dto.reference, createdAt: new Date(dto.createdAt) });
    }
}
```
Nota: si la API genera id y fecha en el servidor, el caso de uso de alta puede variar (el repositorio devuelve la entidad creada). Ajustar el contrato en domain primero y reflejarlo en el repositorio in-memory y en los tests.

## presentation/hooks/use-list-<nombre>s.hook.ts
```ts
// Hook de listado de <nombre>s: ejecuta el caso de uso y expone datos, carga y error a la UI.
// Mantiene los componentes libres de logica de aplicacion; solo pintan el estado.

import { useEffect, useState } from 'react';
import type { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';
import type { List<Nombre>sUseCase } from '../../application/use-cases/list-<nombre>s.use-case.ts';

export function useList<Nombre>s(useCase: List<Nombre>sUseCase) {
    const [data, setData] = useState<<Nombre>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        useCase
            .execute()
            .then(setData)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error inesperado'))
            .finally(() => setLoading(false));
    }, [useCase]);

    return { data, loading, error };
}
```

## presentation/components/<nombre>-list.component.tsx
```tsx
// Componente de lista de <nombre>s: pinta los datos recibidos y el estado de carga/error.
// Es presentacional; no conoce casos de uso ni repositorios.

import type { <Nombre> } from '../../domain/entities/<nombre>.entity.ts';

interface <Nombre>ListProps {
    items: <Nombre>[];
    loading: boolean;
    error?: string;
}

export function <Nombre>List({ items, loading, error }: <Nombre>ListProps) {
    if (loading) return <p>Cargando...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>{item.reference}</li>
            ))}
        </ul>
    );
}
```

## presentation/pages/list-<nombre>s.page.tsx
```tsx
// Pagina de listado de <nombre>s: conecta el hook con el componente.
// Recibe el caso de uso desde fuera (props/contexto); no instancia dependencias.

import type { List<Nombre>sUseCase } from '../../application/use-cases/list-<nombre>s.use-case.ts';
import { useList<Nombre>s } from '../hooks/use-list-<nombre>s.hook.ts';
import { <Nombre>List } from '../components/<nombre>-list.component.tsx';

export function List<Nombre>sPage({ useCase }: { useCase: List<Nombre>sUseCase }) {
    const { data, loading, error } = useList<Nombre>s(useCase);
    return <<Nombre>List items={data} loading={loading} error={error} />;
}
```

## Cableado (solo si el proyecto tiene punto de composicion)
```ts
const httpClient = new HttpClient(import.meta.env.VITE_API_URL);
const <nombre>Repository = new Http<Nombre>Repository(httpClient);
const list<Nombre>sUseCase = new List<Nombre>sUseCase(<nombre>Repository);
// entregar list<Nombre>sUseCase a la pagina via props / contexto / router
```
Sin punto de composicion: mostrar estas lineas al usuario y preguntar donde quiere cablearlas.

## Tests
- `tests/<modulo>/infrastructure/repositories/http.<nombre>-repository.test.ts`: `vi.stubGlobal('fetch', ...)`; 200 → entidades, 404 en `findById` → `undefined`, 409 → `ConflictError`, 400 → `ValidationError`.
- Casos de uso y entidad: igual que backend (repo in-memory + dobles fijos).
- Hooks/componentes: con la libreria de testing del framework; inyectar un caso de uso con repo in-memory.
