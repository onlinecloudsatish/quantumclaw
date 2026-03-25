// QuantumClaw Lightpanda Browser Integration
// Lightpanda: The headless browser designed for AI and automation
// https://github.com/lightpanda-io/browser

import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface LightpandaConfig {
  port?: number;           // CDP port (default: 9222)
  dataDir?: string;        // Browser data directory
  obeyRobots?: boolean;   // Obey robots.txt
  headless?: boolean;     // Run headless
}

export interface BrowserResult {
  success: boolean;
  error?: string;
  pid?: number;
  port?: number;
}

/**
 * Lightpanda Browser Engine
 * 
 * A lightweight, fast headless browser written in Zig
 * 9x less memory, 11x faster than Chrome
 * 
 * Requirements:
 * - Linux x86_64 or macOS ARM64
 * - Or Docker container
 */
export class LightpandaEngine {
  private binaryPath: string;
  private config: LightpandaConfig;
  private process: any = null;
  private isRunning: boolean = false;

  constructor(config: LightpandaConfig = {}) {
    this.config = {
      port: config.port || 9222,
      dataDir: config.dataDir || path.join(os.homedir(), '.quantumclaw', 'lightpanda'),
      obeyRobots: config.obeyRobots !== false,
      headless: config.headless !== false
    };
    
    // Look for lightpanda binary
    this.binaryPath = this.findBinary();
  }

  /**
   * Find Lightpanda binary
   */
  private findBinary(): string {
    // Check common locations
    const locations = [
      './lightpanda',
      '/usr/local/bin/lightpanda',
      '/usr/bin/lightpanda',
      path.join(os.homedir(), 'bin', 'lightpanda'),
      path.join(os.homedir(), '.local', 'bin', 'lightpanda')
    ];

    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        return loc;
      }
    }

    return 'lightpanda'; // Assume in PATH
  }

  /**
   * Check if Lightpanda is installed
   */
  async isInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`${this.binaryPath} --version`, (err, stdout) => {
        resolve(!err && stdout.includes('lightpanda'));
      });
    });
  }

  /**
   * Install Lightpanda (download binary)
   */
  async install(): Promise<boolean> {
    const platform = os.platform();
    const arch = os.arch();
    
    let downloadUrl: string;
    
    if (platform === 'linux' && arch === 'x64') {
      downloadUrl = 'https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux';
    } else if (platform === 'darwin' && arch === 'arm64') {
      downloadUrl = 'https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos';
    } else {
      console.log('⚠️ Lightpanda not available for this platform');
      return false;
    }

    const installPath = path.join(os.homedir(), 'bin', 'lightpanda');
    
    return new Promise((resolve) => {
      console.log(`📥 Downloading Lightpanda to ${installPath}...`);
      
      const curl = exec(`curl -L -o ${installPath} ${downloadUrl} && chmod +x ${installPath}`, (err) => {
        if (err) {
          console.log('❌ Failed to download Lightpanda');
          resolve(false);
        } else {
          console.log('✅ Lightpanda installed!');
          this.binaryPath = installPath;
          resolve(true);
        }
      });
    });
  }

  /**
   * Start Lightpanda browser
   */
  async start(): Promise<BrowserResult> {
    // Check if installed
    const installed = await this.isInstalled();
    if (!installed) {
      const installedNow = await this.install();
      if (!installedNow) {
        return { success: false, error: 'Lightpanda not installed' };
      }
    }

    // Ensure data directory exists
    if (!fs.existsSync(this.config.dataDir!)) {
      fs.mkdirSync(this.config.dataDir!, { recursive: true });
    }

    // Build arguments
    const args = [
      'serve',
      '--port', this.config.port!.toString(),
      '--data-dir', this.config.dataDir!,
    ];
    
    if (this.config.obeyRobots) {
      args.push('--obey-robots');
    }
    
    if (this.config.headless) {
      args.push('--headless');
    }

    return new Promise((resolve) => {
      try {
        this.process = spawn(this.binaryPath, args, {
          stdio: 'ignore',
          detached: true
        });

        this.process.on('error', (err: any) => {
          resolve({ success: false, error: err.message });
        });

        this.process.on('spawn', () => {
          this.isRunning = true;
          console.log(`🌐 Lightpanda started on port ${this.config.port}`);
          resolve({ 
            success: true, 
            pid: this.process.pid, 
            port: this.config.port 
          });
        });
      } catch (err: any) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  /**
   * Stop Lightpanda browser
   */
  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.isRunning = false;
      console.log('🛑 Lightpanda stopped');
    }
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; port: number } {
    return {
      running: this.isRunning,
      port: this.config.port!
    };
  }

  /**
   * Check if working
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isRunning) return false;
    
    return new Promise((resolve) => {
      exec(`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${this.config.port}/`, (err, stdout) => {
        resolve(!err && stdout.trim() === '200');
      });
    });
  }
}

// Export singleton
export const lightpandaBrowser = new LightpandaEngine();

// CLI helper
export async function manageLightpanda(action: 'start' | 'stop' | 'status' | 'install'): Promise<void> {
  switch (action) {
    case 'start':
      await lightpandaBrowser.start();
      break;
    case 'stop':
      await lightpandaBrowser.stop();
      break;
    case 'status':
      const status = lightpandaBrowser.getStatus();
      console.log(`Lightpanda: ${status.running ? 'Running' : 'Stopped'} on port ${status.port}`);
      break;
    case 'install':
      await lightpandaBrowser.install();
      break;
  }
}
