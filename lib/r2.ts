/**
 * Factory for Cloudflare R2 storage operations via the S3-compatible API.
 *
 * Requires `@aws-sdk/client-s3` as a peer dependency — it is NOT bundled.
 *
 * Usage:
 * ```ts
 * import { createR2Client } from "@myresto/shared/lib/r2";
 *
 * const r2 = createR2Client({
 *   accountId: process.env.R2_ACCOUNT_ID!,
 *   accessKeyId: process.env.R2_ACCESS_KEY_ID!,
 *   secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
 *   bucket: "my-bucket",
 *   publicUrl: "https://assets.example.com",
 * });
 *
 * const url = await r2.upload("images/hero.webp", buffer, "image/webp");
 * await r2.remove("images/hero.webp");
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface R2Config {
  /** Cloudflare account ID */
  accountId: string;
  /** R2 access key ID */
  accessKeyId: string;
  /** R2 secret access key */
  secretAccessKey: string;
  /** R2 bucket name */
  bucket: string;
  /** Public URL prefix for uploaded objects (no trailing slash) */
  publicUrl: string;
}

interface R2Client {
  /** Upload an object and return its public URL. */
  upload(key: string, body: Buffer | Uint8Array | string, contentType: string): Promise<string>;
  /** Delete an object by key. */
  remove(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Inline type stubs for @aws-sdk/client-s3 (peer dep — may not be installed)
// ---------------------------------------------------------------------------

interface S3ClientConfig {
  region: string;
  endpoint: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
}

interface S3CommandInput {
  Bucket: string;
  Key: string;
  Body?: Buffer | Uint8Array | string;
  ContentType?: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an R2 storage client backed by the S3-compatible API.
 *
 * `@aws-sdk/client-s3` is loaded dynamically so the package remains an
 * optional peer dependency.
 */
export function createR2Client(config: R2Config): R2Client {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = config;

  // Lazy-initialised S3 client
  let s3: { send(cmd: unknown): Promise<unknown> } | null = null;
  let S3Client: new (cfg: S3ClientConfig) => { send(cmd: unknown): Promise<unknown> };
  let PutObjectCommand: new (input: S3CommandInput) => unknown;
  let DeleteObjectCommand: new (input: { Bucket: string; Key: string }) => unknown;

  async function ensureClient(): Promise<void> {
    if (s3) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    // @ts-expect-error — optional peer dependency; may not be installed at compile time
    const sdk = (await import("@aws-sdk/client-s3")) as any;
    S3Client = sdk.S3Client;
    PutObjectCommand = sdk.PutObjectCommand;
    DeleteObjectCommand = sdk.DeleteObjectCommand;

    s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return {
    async upload(key, body, contentType) {
      await ensureClient();
      await s3!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      return `${publicUrl}/${key}`;
    },

    async remove(key) {
      await ensureClient();
      await s3!.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    },
  };
}
