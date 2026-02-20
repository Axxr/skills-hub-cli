# Skills CLI

> Install AI development skills across any platform - Claude, Cursor, OpenAI, and more

## 🚀 Quick Start

```bash
# Install globally
npm install -g @fabio/skills-cli

# Initialize in your project
skills init

# Install a skill
skills install android-kmp-banking

# ✅ Done! Your AI now has the skill
```

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @fabio/skills-cli
```

### Local Installation (per project)

```bash
npm install --save-dev @fabio/skills-cli
```

Then use with npx:
```bash
npx skills install android-kmp-banking
```

## 🎯 Commands

### `skills init`

Initialize skills configuration in your project.

```bash
skills init
```

Creates `.skillsrc.json` with auto-detected platform:

```json
{
  "platform": "cursor",
  "outputPath": ".",
  "installedSkills": []
}
```

### `skills list`

List all available skills.

```bash
# List all skills
skills list

# Filter by category
skills list --category mobile
```

Output:
```
[MOBILE]

  ● Android KMP Banking v2.1.0
    Complete architecture for banking apps
    #kotlin #kmp #android #banking

  ● Jetpack Compose UI Patterns v2.0.5
    Reusable UI components for Compose
    #android #compose #ui
```

### `skills search <query>`

Search for skills.

```bash
skills search "kotlin"
skills search "react"
skills search "banking"
```

### `skills show <skill>`

Show detailed information about a skill.

```bash
skills show android-kmp-banking
```

Output:
```
Android KMP Banking Architecture
──────────────────────────────────────────────────

ID: android-kmp-banking
Version: 2.1.0
Author: Fabio
Category: mobile
License: MIT

Description:
Complete architecture for banking applications...

Tags:
#kotlin #kmp #android #banking #clean-architecture

Supported Platforms:
  ✓ cursor
  ✓ claude
  ✓ openai
  ✓ windsurf

Install this skill with:
  skills install android-kmp-banking
```

### `skills install <skill>`

Install a skill to your project.

```bash
# Auto-detect platform
skills install android-kmp-banking

# Force specific platform
skills install android-kmp-banking --platform cursor
skills install android-kmp-banking --platform claude

# Custom output path
skills install android-kmp-banking --output ./custom/path
```

Output:
```
✓ Detected platform: cursor
✓ Found: Android KMP Banking v2.1.0
✓ Skill transformed
✓ Installed to .cursorrules

Successfully installed Android KMP Banking
Platform: cursor
File: .cursorrules

Your AI assistant now has access to this skill! 🎉
```

## 🎨 Supported Platforms

| Platform | File | Status |
|----------|------|--------|
| **Cursor IDE** | `.cursorrules` | ✅ |
| **Claude Projects** | `.claude/custom-instructions.md` | ✅ |
| **OpenAI / GPT** | `gpt-instructions.txt` | ✅ |
| **Windsurf IDE** | `.windsurfrules` | ✅ |
| **Continue.dev** | `.continue/config.json` | 🚧 |
| **Gemini** | Coming soon | 🔜 |

## 📁 Configuration

### `.skillsrc.json`

```json
{
  "platform": "auto",        // or "cursor", "claude", etc.
  "outputPath": ".",         // where to install skills
  "registry": "https://...", // optional: custom registry
  "installedSkills": [
    {
      "id": "android-kmp-banking",
      "version": "2.1.0",
      "installedAt": "2025-02-17T10:30:00Z",
      "platform": "cursor"
    }
  ]
}
```

### Environment Variables

```bash
# Custom skills directory (default: ~/skills)
export SKILLS_DIR="/path/to/your/skills"

# Custom registry URL (future)
export SKILLS_REGISTRY="https://skills.yourcompany.com/api"
```

## 🏗️ Skill Structure

Each skill is a directory with:

```
android-kmp-banking/
├── skill.yaml           # Metadata
├── README.md           # Documentation
├── rules/              # Rule markdown files
│   ├── architecture.md
│   ├── testing.md
│   └── security.md
├── examples/           # Code examples
│   └── mvvm-example/
└── templates/          # Templates
    └── feature-template/
```

### `skill.yaml`

```yaml
id: "android-kmp-banking"
name: "Android KMP Banking Architecture"
version: "2.1.0"
author: "Fabio"
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
    adapter: "adapters/claude.ts"
  cursor:
    enabled: true
    adapter: "adapters/cursor.ts"
```

## 🔧 How It Works

1. **Detection**: CLI auto-detects your platform (Cursor, Claude, etc.)
2. **Transform**: Skill is transformed using platform-specific adapter
3. **Install**: Transformed skill is written to platform's config file

```
┌─────────────┐
│   Skill     │  skill.yaml + rules/*.md
│  (Generic)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Adapter    │  Platform-specific transformation
│  (Cursor)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│.cursorrules │  Platform config file
└─────────────┘
```

## 🎓 Creating Your Own Skills

### 1. Create Directory Structure

```bash
mkdir my-skill
cd my-skill
```

### 2. Create `skill.yaml`

```yaml
id: "my-skill"
name: "My Awesome Skill"
version: "1.0.0"
author: "Your Name"
category: "backend"
tags:
  - nodejs
  - api
description: "Best practices for Node.js APIs"

rules:
  - rules/api-design.md

platforms:
  cursor:
    enabled: true
    adapter: "adapters/cursor.ts"
  claude:
    enabled: true
    adapter: "adapters/claude.ts"
```

### 3. Create Rules

```bash
mkdir rules
echo "# API Design Guidelines" > rules/api-design.md
```

### 4. Add README

```bash
echo "# My Skill" > README.md
```

### 5. Place in Skills Directory

```bash
mv my-skill ~/skills/
```

### 6. Install It!

```bash
skills install my-skill
```

## 📚 Examples

### Android Developer

```bash
skills install android-kmp-banking
skills install jetpack-compose-patterns
skills install kotlin-best-practices
```

### Backend Developer

```bash
skills install node-express-api
skills install database-design
skills install security-patterns
```

### Full Stack

```bash
skills install react-nextjs-modern
skills install typescript-patterns
skills install api-integration
```

## 🔮 Roadmap

- [ ] Backend API integration
- [ ] Skill marketplace
- [ ] Version updates
- [ ] Skill dependencies resolution
- [ ] Templates generation
- [ ] Analytics

## 🤝 Contributing

Contributions are welcome! To add a new platform adapter:

1. Create adapter in `src/adapters/your-platform.ts`
2. Implement `SkillAdapter` interface
3. Register in `AdapterFactory`
4. Update platform detector

## 📄 License

MIT

## 👨‍💻 Author

Fabio - Banking Mobile Developer

---

Made with ❤️ for the AI development community
