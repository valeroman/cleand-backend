import express from "express";
import type { Router } from "express";

export function createExpressApp(router: Router) {
  const app = express();

  app.disable("x-powered-by"); // desactivar el encabezado X-Powered-By para mejorar la seguridad

  app.use(router);

  app.use((_request, response) => {
    response.status(404).json({
      error: "Ruta no encontrada",
    });
  });

  // TODO: Manejo de los errors

  return app;
}
