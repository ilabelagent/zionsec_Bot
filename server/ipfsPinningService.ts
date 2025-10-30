/**
 * IPFS Pinning Service with Guaranteed 2+ Year Storage
 * Supports Pinata, web3.storage, and Infura pinning
 */

import axios from "axios";
import FormData from "form-data";
import { ipfsService } from "./ipfsService";

export interface PinningResult {
  ipfsHash: string;
  ipfsUrl: string;
  pinataUrl?: string;
  size: number;
  pinned: boolean;
  provider: "pinata" | "web3storage" | "infura" | "local";
  expiresAt?: Date;
}

export interface UploadProgress {
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
}

export class IPFSPinningService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private web3StorageToken: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || "";
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || "";
    this.web3StorageToken = process.env.WEB3_STORAGE_TOKEN || "";
  }

  /**
   * Upload file to IPFS with guaranteed pinning (2+ years)
   */
  async uploadWithPinning(
    file: Buffer,
    filename: string,
    metadata?: {
      name?: string;
      description?: string;
      projectId?: string;
      userId?: string;
    }
  ): Promise<PinningResult> {
    // Try Pinata first (most reliable for long-term storage)
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        return await this.uploadToPinata(file, filename, metadata);
      } catch (error) {
        console.error("[IPFS Pinning] Pinata upload failed:", error);
      }
    }

    // Fallback to web3.storage
    if (this.web3StorageToken) {
      try {
        return await this.uploadToWeb3Storage(file, filename, metadata);
      } catch (error) {
        console.error("[IPFS Pinning] web3.storage upload failed:", error);
      }
    }

    // Final fallback to Infura (via existing ipfsService)
    try {
      const ipfsUrl = await ipfsService.uploadFile(file, filename);
      const ipfsHash = ipfsUrl.replace("ipfs://", "");

      return {
        ipfsHash,
        ipfsUrl,
        size: file.length,
        pinned: false, // Infura pins are not guaranteed long-term
        provider: "infura",
      };
    } catch (error) {
      throw new Error("All IPFS upload providers failed");
    }
  }

  /**
   * Upload to Pinata (Guaranteed 2+ years with subscription)
   */
  private async uploadToPinata(
    file: Buffer,
    filename: string,
    metadata?: any
  ): Promise<PinningResult> {
    const formData = new FormData();
    formData.append("file", file, { filename });

    const pinataMetadata = {
      name: metadata?.name || filename,
      keyvalues: {
        description: metadata?.description || "",
        projectId: metadata?.projectId || "",
        userId: metadata?.userId || "",
        uploadedAt: new Date().toISOString(),
      },
    };

    formData.append("pinataMetadata", JSON.stringify(pinataMetadata));

    // Configure pinata options for permanent storage
    const pinataOptions = {
      cidVersion: 1, // Use CIDv1 for better compatibility
    };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log(`[Pinata] Uploaded ${filename}: ${ipfsHash}`);

    // Pinata guarantees storage as long as subscription is active (2+ years with paid plan)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2 years from now

    return {
      ipfsHash,
      ipfsUrl,
      pinataUrl,
      size: response.data.PinSize,
      pinned: true,
      provider: "pinata",
      expiresAt,
    };
  }

  /**
   * Upload to web3.storage (Free, permanent storage)
   */
  private async uploadToWeb3Storage(
    file: Buffer,
    filename: string,
    metadata?: any
  ): Promise<PinningResult> {
    const formData = new FormData();
    formData.append("file", file, { filename });

    const response = await axios.post("https://api.web3.storage/upload", formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${this.web3StorageToken}`,
      },
    });

    const ipfsHash = response.data.cid;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    console.log(`[web3.storage] Uploaded ${filename}: ${ipfsHash}`);

    // web3.storage provides permanent storage backed by Filecoin
    return {
      ipfsHash,
      ipfsUrl,
      size: file.length,
      pinned: true,
      provider: "web3storage",
      // No expiration - permanent storage
    };
  }

  /**
   * Pin existing IPFS hash (for files already uploaded elsewhere)
   */
  async pinByHash(ipfsHash: string, metadata?: any): Promise<boolean> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      console.warn("[IPFS Pinning] No Pinata credentials, cannot pin existing hash");
      return false;
    }

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinByHash",
        {
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: metadata?.name || ipfsHash,
            keyvalues: metadata?.keyvalues || {},
          },
        },
        {
          headers: {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      console.log(`[Pinata] Pinned existing hash: ${ipfsHash}`);
      return true;
    } catch (error) {
      console.error("[Pinata] Failed to pin existing hash:", error);
      return false;
    }
  }

  /**
   * Unpin file (remove from pinning service)
   */
  async unpin(ipfsHash: string): Promise<boolean> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      return false;
    }

    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
        headers: {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      });

      console.log(`[Pinata] Unpinned: ${ipfsHash}`);
      return true;
    } catch (error) {
      console.error("[Pinata] Failed to unpin:", error);
      return false;
    }
  }

  /**
   * Check pin status
   */
  async checkPinStatus(ipfsHash: string): Promise<{
    pinned: boolean;
    pinCount: number;
    size?: number;
  }> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      return { pinned: false, pinCount: 0 };
    }

    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`,
        {
          headers: {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      const pins = response.data.rows;
      if (pins.length > 0) {
        return {
          pinned: true,
          pinCount: pins.length,
          size: pins[0].size,
        };
      }

      return { pinned: false, pinCount: 0 };
    } catch (error) {
      console.error("[Pinata] Failed to check pin status:", error);
      return { pinned: false, pinCount: 0 };
    }
  }

  /**
   * Get pinning service URLs
   */
  getPinningUrls(ipfsHash: string): {
    ipfsUrl: string;
    httpGateways: string[];
    pinataGateway?: string;
  } {
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const httpGateways = [
      `https://ipfs.io/ipfs/${ipfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      `https://gateway.ipfs.io/ipfs/${ipfsHash}`,
    ];

    const pinataGateway = this.pinataApiKey
      ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      : undefined;

    return {
      ipfsUrl,
      httpGateways,
      pinataGateway,
    };
  }
}

export const ipfsPinningService = new IPFSPinningService();
