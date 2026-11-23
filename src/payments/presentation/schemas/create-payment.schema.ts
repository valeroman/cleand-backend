// Esquema HTTP para crear un pago: valida la forma del cuerpo con zod.
// Rechaza tipos incorrectos antes del controlador; las reglas de negocio las valida la entidad.

import z from 'zod';

export const createPaymentSchema = z.object(
    {
        reference: z.string({ error: 'reference debe de ser texto' }),
        amount: z.number({ error: 'amount debe de ser numero' }),
        customerId: z.string({ error: 'customerId debe de ser texto' }),
    },
    { error: 'El cuerpo debe ser un JSON' },
);

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
