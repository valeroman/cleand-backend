import { Router } from "express";
import { createExpressApp } from "./shared/presentation/config/express.config.ts";

export function createApp() {
  // TODO: repositorios

  // TODO: casos de uso

  // TODO: controladores

  const router = Router();

  // TODO: root
  // TODO: /users
  // TODO: /payments

  return createExpressApp(router);
}
