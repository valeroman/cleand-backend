// Rutas HTTP de productos: crear, listar y consultar por id.
// Conecta Express con los controladores y traduce resultados a respuestas.

import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { createProductSchema } from '../schemas/create-product.schema.ts';
import type { CreateProductController } from '../controllers/create-product.controller.ts';
import type { FindProductByIdController } from '../controllers/find-product-by-id.controller.ts';
import type { ListProductsController } from '../controllers/list-products.controller.ts';

export function createProductsRouter(
    createProductController: CreateProductController,
    findProductByIdController: FindProductByIdController,
    listProductsController: ListProductsController,
) {
    const router = Router();

    router.post(
        '/',
        requireJson,
        json({ limit: '64kb' }),
        validateBody(createProductSchema),
        async (request, response) => {
            const product = await createProductController.handle(request.body);
            response.status(201).json(product);
        },
    );

    router.get('/', async (_request, response) => {
        const products = await listProductsController.handle();
        response.status(200).json(products);
    });

    router.get('/:id', async (request, response) => {
        const product = await findProductByIdController.handle(request.params.id);
        response.status(200).json(product);
    });

    router.all('/', (_request, response) => {
        response
            .set('Allow', 'GET, POST')
            .status(405)
            .json({ error: 'Método no permitido' });
    });

    return router;
}
