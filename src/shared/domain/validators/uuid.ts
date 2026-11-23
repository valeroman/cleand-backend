// Validador de dominio: comprueba si un texto es un UUID valido.
// Existe para que todas las entidades compartan la misma regla en vez de repetir la expresion regular.

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
    return uuidRegex.test(value);
}
