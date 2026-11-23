// Contrato del dominio: define como obtener la fecha actual sin elegir una fuente de tiempo.
// Invierte la dependencia hacia una abstraccion; sin el, los casos de uso dependerian del reloj del sistema y los tests no serian deterministas.

export interface Clock {
    now(): Date;
}
