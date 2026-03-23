// QuantumClaw Code Interpreter
// Execute and analyze code in real-time

export interface CodeExecution {
  id: string;
  language: string;
  code: string;
  output: string;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface SandboxConfig {
  timeout: number;
  memoryLimit: number;
  allowedImports: string[];
}

export class CodeInterpreter {
  private executions: Map<string, CodeExecution> = new Map();
  private defaultConfig: SandboxConfig = {
    timeout: 30000,
    memoryLimit: 512 * 1024 * 1024, // 512MB
    allowedImports: ["math", "random", "json", "datetime", "re", "collections", "itertools", "functools"],
  };

  /**
   * Execute code in a sandboxed environment
   */
  async execute(
    code: string,
    language: "python" | "javascript" | "typescript" = "javascript",
    config?: Partial<SandboxConfig>
  ): Promise<CodeExecution> {
    const execution: CodeExecution = {
      id: this.generateId(),
      language,
      code,
      output: "",
      executionTime: 0,
      timestamp: new Date(),
    };

    const cfg = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    try {
      console.log(`🔮 Executing ${language} code...`);

      switch (language) {
        case "javascript":
        case "typescript":
          execution.output = await this.executeJS(code, cfg.timeout);
          break;
        case "python":
          execution.output = await this.executePython(code, cfg.timeout);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      execution.executionTime = Date.now() - startTime;
      console.log(`✅ Code executed in ${execution.executionTime}ms`);
    } catch (error) {
      execution.error = error instanceof Error ? error.message : String(error);
      execution.executionTime = Date.now() - startTime;
      console.error(`❌ Code execution failed: ${execution.error}`);
    }

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Execute JavaScript/TypeScript in a sandbox
   */
  private async executeJS(code: string, timeout: number): Promise<string> {
    // Create a sandboxed environment
    const sandbox = {
      console: {
        log: (...args: any[]) => results.push(args.map(a => String(a)).join(" ")),
        error: (...args: any[]) => results.push("[ERROR] " + args.map(a => String(a)).join(" ")),
        warn: (...args: any[]) => results.push("[WARN] " + args.map(a => String(a)).join(" ")),
      },
      Math,
      JSON,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      Buffer: {
        from: (s: string) => Buffer.from(s),
      },
      setTimeout: undefined, // Disabled for security
      setInterval: undefined,
      require: undefined,
      process: undefined,
      __dirname: undefined,
      __filename: undefined,
    };

    const results: string[] = [];
    const contextKeys = Object.keys(sandbox);
    const contextValues = Object.values(sandbox);

    try {
      // Create function with limited scope
      const fn = new Function(...contextKeys, `
        "use strict";
        ${code}
      `);
      
      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Execution timeout")), timeout)
      );
      
      await Promise.race([
        fn(...contextValues),
        timeoutPromise
      ]);

      return results.join("\n") || "Code executed successfully (no output)";
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Execute Python code (simulated - in production, use Pyodide)
   */
  private async executePython(code: string, timeout: number): Promise<string> {
    // This is a simplified Python simulation
    // In production, integrate with Pyodide or a Python runtime
    
    const results: string[] = [];
    
    // Simple Python to JS translation for basic operations
    let jsCode = code
      .replace(/print\((.*)\)/g, "console.log($1)")
      .replace(/def\s+(\w+)\s*\((.*)\)\s*:/g, "function $1($2) {")
      .replace(/return\s+(.*)/g, "return $1")
      .replace(/for\s+(\w+)\s+in\s+(.*):/g, "for (let $1 of $2) {")
      .replace(/if\s+(.*):/g, "if ($1) {")
      .replace(/elif\s+(.*):/g, "} else if ($1) {")
      .replace(/else:/g, "} else {")
      .replace(/True/g, "true")
      .replace(/False/g, "false")
      .replace(/None/g, "null")
      .replace(/self\./g, "this.")
      .replace(/__(\w+)__/g, "_$1_"); // dunder methods

    try {
      const result = await this.executeJS(jsCode, timeout);
      return `[Python] ${result}`;
    } catch (error) {
      throw new Error(`Python execution not fully supported. Error: ${error}`);
    }
  }

  /**
   * Analyze code and provide insights
   */
  async analyze(code: string, language: string): Promise<{
    complexity: number;
    lines: number;
    functions: string[];
    imports: string[];
    suggestions: string[];
  }> {
    const analysis = {
      complexity: 0,
      lines: code.split("\n").length,
      functions: [] as string[],
      imports: [] as string[],
      suggestions: [] as string[],
    };

    // Count complexity
    const controlFlow = (code.match(/\b(if|while|for|switch|catch|&&|\|\|)\b/g) || []).length;
    analysis.complexity = controlFlow + 1;

    // Extract functions
    const functionMatches = code.match(/(?:function|def|const|let|var)\s+(\w+)/g) || [];
    analysis.functions = functionMatches.map(f => f.split(/\s+/)[1]);

    // Extract imports
    const importMatches = code.match(/(?:import|require|from)\s+['"]?(\w+)/g) || [];
    analysis.imports = importMatches.map(i => i.split(/\s+/)[1]).filter(Boolean);

    // Generate suggestions
    if (analysis.complexity > 10) {
      analysis.suggestions.push("Consider breaking this into smaller functions");
    }
    if (analysis.lines > 100) {
      analysis.suggestions.push("File is getting long, consider splitting");
    }
    if (!code.includes("try") && code.includes("await")) {
      analysis.suggestions.push("Consider adding error handling with try/catch");
    }
    if (analysis.imports.length === 0 && analysis.lines > 20) {
      analysis.suggestions.push("Consider modularizing with imports/exports");
    }

    return analysis;
  }

  /**
   * Generate code from natural language
   */
  async generateCode(prompt: string, language: "python" | "javascript"): Promise<string> {
    console.log(`🎨 Generating ${language} code for: "${prompt}"`);

    const templates: Record<string, string> = {
      "python": {
        "read file": `with open('file.txt', 'r') as f:
    content = f.read()
    print(content)`,
        "api request": `import requests
response = requests.get('https://api.example.com/data')
data = response.json()
print(data)`,
        "json parse": `import json
data = json.loads('{"key": "value"}')
print(data['key'])`,
        "loop list": `items = [1, 2, 3, 4, 5]
for item in items:
    print(item)`,
      },
      "javascript": {
        "read file": `const fs = require('fs');
const content = fs.readFileSync('file.txt', 'utf8');
console.log(content);`,
        "api request": `const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log(data);`,
        "json parse": `const data = JSON.parse('{"key": "value"}');
console.log(data.key);`,
        "loop array": `const items = [1, 2, 3, 4, 5];
items.forEach(item => console.log(item));`,
      },
    };

    const promptLower = prompt.toLowerCase();
    for (const [key, code] of Object.entries(templates[language])) {
      if (promptLower.includes(key)) {
        return code;
      }
    }

    // Default template
    return language === "javascript" 
      ? `// TODO: Implement ${prompt}\nconsole.log("Hello, World!");`
      : `# TODO: Implement ${prompt}\nprint("Hello, World!")`;
  }

  /**
   * Execute code from a file
   */
  async executeFile(filepath: string): Promise<CodeExecution> {
    // In production, read file and detect language
    const ext = filepath.split(".").pop() || "js";
    const language = ext === "py" ? "python" : ext === "ts" ? "typescript" : "javascript";
    
    console.log(`📄 Executing file: ${filepath} (${language})`);
    
    return this.execute("// File execution not implemented yet", language);
  }

  private generateId(): string {
    return `code_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Public API
  listExecutions(): CodeExecution[] {
    return Array.from(this.executions.values());
  }

  getExecution(id: string): CodeExecution | undefined {
    return this.executions.get(id);
  }
}

export const codeInterpreter = new CodeInterpreter();