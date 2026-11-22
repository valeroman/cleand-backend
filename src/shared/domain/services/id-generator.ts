// Contrato del dominio: define como obtener identificadores unicos sin elegir una tecnologia de generacion.
// Invierte la dependencia hacia una abstraccion; sin el, los casos de uso quedarian acoplados al runtime y los tests no serian deterministas.

export interface IdGenerator {
    generate(): string;
}
