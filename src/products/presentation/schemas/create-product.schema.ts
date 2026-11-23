// Esquema HTTP para crear un producto: valida la forma del cuerpo con zod.
// Rechaza tipos incorrectos antes del controlador; las reglas de negocio las valida la entidad.

import z from 'zod';

export const createProductSchema = z.object(
    {
        name: z.string({ error: 'name debe de ser texto' }),
        price: z.number({ error: 'price debe de ser numero' }),
        stock: z.number({ error: 'stock debe de ser numero' }),
        description: z.string({ error: 'description debe de ser texto' }),
        category: z.string({ error: 'category debe de ser texto' }),
        images: z.array(z.string({ error: 'images debe de contener solo texto' }), {
            error: 'images debe de ser una lista de texto',
        }),
    },
    { error: 'El cuerpo debe ser un JSON' },
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
