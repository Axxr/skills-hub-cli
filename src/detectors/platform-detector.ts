import fs from 'fs';
import path from 'path';
import { Platform, PlatformDetectionResult } from '../types';

export class PlatformDetector {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  detect(): PlatformDetectionResult {
    const detectors = [
      this.detectCursor.bind(this),
      this.detectWindsurf.bind(this),
      this.detectClaude.bind(this),
    ];

    for (const detector of detectors) {
      const result = detector();
      if (result.platform) return result;
    }

    return {
      platform: null,
      confidence: 'low',
      evidence: ['No platform-specific files found'],
    };
  }

  private detectCursor(): PlatformDetectionResult {
    const files = ['.cursorrules', '.cursor/rules'];
    const evidence = files.filter(f => this.exists(f)).map(f => `Found ${f}`);
    if (evidence.length > 0) return { platform: 'cursor', confidence: 'high', evidence };
    return { platform: null, confidence: 'low', evidence: [] };
  }

  private detectWindsurf(): PlatformDetectionResult {
    const files = ['.windsurfrules', '.windsurf/rules'];
    const evidence = files.filter(f => this.exists(f)).map(f => `Found ${f}`);
    if (evidence.length > 0) return { platform: 'windsurf', confidence: 'high', evidence };
    return { platform: null, confidence: 'low', evidence: [] };
  }

  private detectClaude(): PlatformDetectionResult {
    const files = ['.claude/project.md', '.claude/instructions.md'];
    const evidence = files.filter(f => this.exists(f)).map(f => `Found ${f}`);
    if (evidence.length > 0) return { platform: 'claude', confidence: 'high', evidence };
    return { platform: null, confidence: 'low', evidence: [] };
  }

  private exists(relativePath: string): boolean {
    return fs.existsSync(path.join(this.cwd, relativePath));
  }

  static getSupportedPlatforms(): Platform[] {
    return ['claude', 'cursor', 'openai', 'windsurf'];
  }
}
