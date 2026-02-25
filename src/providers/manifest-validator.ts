import type { Manifest, ManifestSkill } from './github-client';

// ---------------------------------------------------------------------------
// Mensajes de error centralizados — sin strings dispersos por el código
// ---------------------------------------------------------------------------
const ERR = {
    notAnObject: '[Seguridad] Manifest inválido: la respuesta no es un objeto JSON',
    missingSkills: '[Seguridad] Manifest inválido: falta el campo "skills" (array)',
    badSkillShape: '[Seguridad] Manifest inválido: skill con formato incorrecto',
    missingId: '[Seguridad] Manifest inválido: skill sin campo "id" de tipo string',
    missingName: (id: string) => `[Seguridad] Manifest inválido: skill "${id}" sin campo "name"`,
    missingVersion: (id: string) => `[Seguridad] Manifest inválido: skill "${id}" sin campo "version"`,
    rulesNotArray: (id: string) => `[Seguridad] Manifest inválido: "rules" en "${id}" debe ser un array`,
    ruleNotString: (id: string) => `[Seguridad] Manifest inválido: ruta de regla no es string en "${id}"`,
    suspiciousRule: (id: string, rule: string) => `[Seguridad] Ruta de regla sospechosa en "${id}": "${rule}"`,
} as const;

// ---------------------------------------------------------------------------
// Validadores atómicos — cada función hace UNA sola comprobación
// ---------------------------------------------------------------------------

function assertObject(data: unknown): asserts data is Record<string, unknown> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(ERR.notAnObject);
    }
}

function assertSkillsArray(obj: Record<string, unknown>): asserts obj is { skills: unknown[] } {
    if (!Array.isArray(obj['skills'])) {
        throw new Error(ERR.missingSkills);
    }
}

function assertSkillShape(raw: unknown): asserts raw is Record<string, unknown> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(ERR.badSkillShape);
    }
}

function assertRequiredFields(s: Record<string, unknown>): void {
    if (typeof s['id'] !== 'string' || !s['id']) throw new Error(ERR.missingId);
    if (typeof s['name'] !== 'string') throw new Error(ERR.missingName(s['id'] as string));
    if (typeof s['version'] !== 'string') throw new Error(ERR.missingVersion(s['id'] as string));
}

function assertRulesPaths(id: string, rules: unknown): void {
    if (!Array.isArray(rules)) throw new Error(ERR.rulesNotArray(id));

    for (const rule of rules) {
        if (typeof rule !== 'string') throw new Error(ERR.ruleNotString(id));
        if (rule.includes('..') || rule.startsWith('/')) throw new Error(ERR.suspiciousRule(id, rule));
    }
}

function validateSkill(raw: unknown): ManifestSkill {
    assertSkillShape(raw);
    assertRequiredFields(raw);

    const id = raw['id'] as string;
    if (raw['rules'] !== undefined) {
        assertRulesPaths(id, raw['rules']);
    }

    return raw as unknown as ManifestSkill;
}

// ---------------------------------------------------------------------------
// Punto de entrada público
// ---------------------------------------------------------------------------

/**
 * Valida que un JSON desconocido sea un `Manifest` bien formado.
 * Lanza `Error` con mensaje descriptivo si alguna validación falla.
 */
export function validateManifest(data: unknown): Manifest {
    assertObject(data);
    assertSkillsArray(data);

    data.skills = data.skills.map(validateSkill);

    return data as unknown as Manifest;
}
