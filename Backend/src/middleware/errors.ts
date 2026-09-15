interface ErrorConCodigo extends Error {
    statusCode?: number;
}

function error(message: string, code?: number): ErrorConCodigo {
    const e = new Error(message) as ErrorConCodigo;

    if (code) {
        e.statusCode = code;
    }

    return e;
}

export default error;