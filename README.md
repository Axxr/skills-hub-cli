# Skills CLI

> Instala "skills" de IA desde GitHub directamente en tu editor — Claude, Cursor, OpenAI y Windsurf

## 🚀 Quick Start

```bash
# Instalar globalmente
npm install -g @axxr/skills-cli

# Instalar un skill desde un repositorio GitHub
skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking

# ✅ ¡Listo! Tu IA ya tiene el skill
```

## 📦 Instalación

### Global (recomendado)

```bash
npm install -g @axxr/skills-cli
```

### Local por proyecto

```bash
npm install --save-dev @axxr/skills-cli
```

Con npx:
```bash
npx skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking
```

## 🎯 Comandos

### `skills add <repo-url> --skill <id>`

Descarga e instala un skill desde un repositorio GitHub.

```bash
# Detección automática de plataforma
skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking

# Forzar plataforma específica
skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking --platform cursor
skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking --platform claude

# Directorio de salida personalizado
skills add https://github.com/Axxr/skills-hub --skill android-kmp-banking --output ./mi-carpeta
```

**Opciones:**

| Opción | Descripción |
|--------|-------------|
| `--skill <id>` | **(Requerido)** ID del skill a instalar |
| `-p, --platform <platform>` | Plataforma destino: `cursor`, `claude`, `openai`, `windsurf` |
| `-o, --output <path>` | Directorio de salida (default: `.`) |

**Salida:**
```
✓ Detected platform: cursor
✓ Downloaded: Android KMP Banking v2.1.0
✓ Integridad verificada: a3f9c2b1d4e5f6a7...
✓ Transformed
✓ Installed    android-kmp-banking v2.1.0
ℹ Platform    : cursor
ℹ File        : .cursorrules
ℹ Config      : .skillsrc.json
```

---

### `skills list`

Lista los skills instalados localmente en el proyecto actual.

```bash
skills list
```

**Salida:**
```
> Installed Skills

  ● android-kmp-banking v2.1.0
     platform : cursor
     source   : https://github.com/Axxr/skills-hub
     installed: 25/2/2026

ℹ Total: 1 skill(s)
```

---

### `skills remove <skill-id>`

Elimina el archivo generado y borra el skill del registro local.

```bash
skills remove android-kmp-banking

# Si el archivo está en un directorio personalizado
skills remove android-kmp-banking --output ./mi-carpeta
```

## 🎨 Plataformas soportadas

| Plataforma | Archivo generado | Estado |
|------------|-----------------|--------|
| **Cursor IDE** | `.cursorrules` | ✅ |
| **Claude Projects** | `.claude/custom-instructions.md` | ✅ |
| **OpenAI / GPT** | `gpt-instructions.txt` | ✅ |
| **Windsurf IDE** | `.windsurfrules` | ✅ |
| **Continue.dev** | `.continue/config.json` | 🚧 |
| **Gemini** | Coming soon | 🔜 |

La plataforma se detecta automáticamente buscando archivos de configuración conocidos (`.cursorrules`, `.windsurfrules`, `.claude/`). Si no se detecta ninguna, usa `--platform` para especificarla.

## 📁 Configuración local — `.skillsrc.json`

Al instalar el primer skill se crea `.skillsrc.json` en el directorio actual:

```json
{
  "platform": "auto",
  "outputPath": ".",
  "installedSkills": [
    {
      "id": "android-kmp-banking",
      "version": "2.1.0",
      "source": "https://github.com/Axxr/skills-hub",
      "installedAt": "2026-02-25T10:30:00Z",
      "platform": "cursor",
      "contentHash": "a3f9c2b1...",
      "contentHashAlgorithm": "sha-256"
    }
  ]
}
```

## 🏗️ Estructura de un skill (en el repositorio remoto)

```
android-kmp-banking/
├── skill.yaml           # Metadatos e IDs de plataforma
├── README.md            # Documentación del skill
└── rules/               # Archivos markdown con las reglas
    ├── architecture.md
    ├── testing.md
    └── security.md
```

### `skill.yaml`

```yaml
id: "android-kmp-banking"
name: "Android KMP Banking Architecture"
version: "2.1.0"
author: "Axxr"
category: "mobile"
tags:
  - kotlin
  - kmp
  - android
description: "Complete architecture for banking apps..."

rules:
  - rules/architecture.md
  - rules/testing.md
  - rules/security.md

platforms:
  claude:
    enabled: true
  cursor:
    enabled: true
```

## 🔧 Cómo funciona

```
┌─────────────────────┐
│  GitHub Repository  │  manifest.json + skill.yaml + rules/*.md
└──────────┬──────────┘
           │ GitHubClient (descarga + valida)
           ▼
┌─────────────────────┐
│    Skill (genérico) │  metadatos + contenido de reglas
└──────────┬──────────┘
           │ Adapter (transforma según plataforma)
           ▼
┌─────────────────────┐
│  .cursorrules       │  archivo de configuración del editor
│  .claude/...        │
│  gpt-instructions   │
└─────────────────────┘
           │ ConfigManager
           ▼
┌─────────────────────┐
│  .skillsrc.json     │  registro local de skills instalados
└─────────────────────┘
```

## 🤝 Contribuir

Para añadir soporte a una nueva plataforma:

1. Crear `src/adapters/mi-plataforma.ts` extendiendo `BaseAdapter`
2. Implementar `platform`, `filename` y `transform(skill)`
3. Registrar en `AdapterFactory` (`src/adapters/index.ts`)
4. Añadir detección en `PlatformDetector` (`src/detectors/platform-detector.ts`)

## 🔮 Roadmap

- [ ] Comando `skills search` para explorar skills disponibles en el repositorio remoto
- [ ] Comando `skills show <id>` para ver detalles de un skill antes de instalarlo
- [ ] Actualizaciones de versión (`skills update`)
- [ ] Resolución de dependencias entre skills
- [ ] Soporte para Continue.dev
- [ ] Marketplace de skills

## 📄 Licencia

MIT

## 👨‍💻 Autor

Axxr

---

Made with ❤️ for the AI development community
