// ---------------------------------------------------------------------------
// Límites de seguridad para peticiones HTTP salientes
// ---------------------------------------------------------------------------
export const FETCH_LIMITS = {
    timeoutMs: 10_000,    // 10 s máximo por petición
    maxBytes: 1_048_576,     // 1 MB máximo por respuesta
    maxRules: 50,     // máximo de reglas a descargar por skill
} as const;

// ---------------------------------------------------------------------------
// fetch con timeout y límite de tamaño de respuesta (SEC-4)
// ---------------------------------------------------------------------------

/**
 * Wrapper sobre `fetch` que añade:
 * - Timeout con `AbortController` (`FETCH_LIMITS.timeoutMs`)
 * - Rechazo de respuestas cuyo `Content-Length` supere `FETCH_LIMITS.maxBytes`
 */
export async function safeFetch(url: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_LIMITS.timeoutMs);

    let res: Response;
    try {
        res = await fetch(url, { signal: controller.signal });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error(`[Seguridad] Timeout al descargar: ${url}`);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }

    assertResponseSize(res, url);
    return res;
}

function assertResponseSize(res: Response, url: string): void {
    const contentLength = res.headers.get('content-length');
    if (!contentLength) return;

    const bytes = parseInt(contentLength, 10);
    if (bytes > FETCH_LIMITS.maxBytes) {
        throw new Error(
            `[Seguridad] Respuesta demasiado grande (${bytes.toLocaleString()} bytes, máx ${FETCH_LIMITS.maxBytes.toLocaleString()}): ${url}`
        );
    }
}
