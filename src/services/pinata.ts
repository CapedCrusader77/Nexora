/**
 * Pinata IPFS Pinning Service Module
 * Handles file uploads and metadata pinning to decentralized IPFS nodes.
 *
 * When NEXT_PUBLIC_PINATA_JWT is configured, uses the real Pinata API.
 * Otherwise falls back to simulated pinning for local development.
 */

const PINATA_API_URL = "https://api.pinata.cloud";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

interface PinataMetadata {
  name: string;
  keyvalues: Record<string, string | number | boolean>;
}

function getPinataJWT(): string | null {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_PINATA_JWT as string) || null;
  }
  return null;
}

function generateSimulatedCID(): string {
  return (
    "Qm" +
    Array.from({ length: 44 }, () =>
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[
        Math.floor(Math.random() * 58)
      ]
    ).join("")
  );
}

export class PinataService {
  /**
   * Pins JSON metadata to IPFS via Pinata
   * @param metadata NFT metadata conforming to ERC721 metadata standards
   * @param customName Optional display name for the Pinata dashboard
   */
  public static async pinJSONToIPFS(
    metadata: Record<string, any>,
    customName?: string
  ): Promise<{ success: boolean; ipfsHash?: string; gatewayUrl?: string; error?: string }> {
    const jwt = getPinataJWT();

    if (!jwt) {
      // ── Simulated mode ──────────────────────────────────────────────
      console.log(
        `[Pinata Service] No JWT configured — simulating pin for: ${customName || metadata.name}`
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      const hash = generateSimulatedCID();
      return {
        success: true,
        ipfsHash: hash,
        gatewayUrl: `${PINATA_GATEWAY}/${hash}`,
      };
    }

    // ── Real Pinata API ─────────────────────────────────────────────
    console.log(
      `[Pinata Service] Pinning JSON to IPFS for: ${customName || metadata.name}`
    );

    try {
      const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: customName || `nexora-nft-${metadata.name}`,
            keyvalues: {
              category: metadata.category || "general",
              creator: metadata.creator || "unknown",
              app: "nexora-marketplace",
            },
          } as PinataMetadata,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("[Pinata Service] Pinned successfully:", data.IpfsHash);

      return {
        success: true,
        ipfsHash: data.IpfsHash,
        gatewayUrl: `${PINATA_GATEWAY}/${data.IpfsHash}`,
      };
    } catch (err: any) {
      console.error("[Pinata Service] Upload failed:", err);
      return {
        success: false,
        error: err?.message || "Failed connecting to Pinata IPFS gateway",
      };
    }
  }

  /**
   * Pins a file (image blob) to IPFS via Pinata
   */
  public static async pinFileToIPFS(
    fileBlob: Blob,
    filename: string
  ): Promise<{ success: boolean; ipfsHash?: string; gatewayUrl?: string; error?: string }> {
    const jwt = getPinataJWT();

    if (!jwt) {
      console.log(
        `[Pinata Service] No JWT configured — simulating file pin: ${filename}`
      );
      await new Promise((resolve) => setTimeout(resolve, 800));
      const hash = generateSimulatedCID();
      return {
        success: true,
        ipfsHash: hash,
        gatewayUrl: `${PINATA_GATEWAY}/${hash}`,
      };
    }

    console.log(
      `[Pinata Service] Pinning file to IPFS: ${filename} (${fileBlob.size} bytes)`
    );

    try {
      const formData = new FormData();
      formData.append("file", fileBlob, filename);
      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: filename,
          keyvalues: { app: "nexora-marketplace" },
        })
      );

      const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("[Pinata Service] File pinned:", data.IpfsHash);

      return {
        success: true,
        ipfsHash: data.IpfsHash,
        gatewayUrl: `${PINATA_GATEWAY}/${data.IpfsHash}`,
      };
    } catch (err: any) {
      console.error("[Pinata Service] File upload failed:", err);
      return {
        success: false,
        error: err?.message || "Failed uploading file to Pinata IPFS",
      };
    }
  }
}
