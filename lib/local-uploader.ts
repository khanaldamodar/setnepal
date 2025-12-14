import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

/**
 * Uploads a file to the local filesystem (public/uploads folder).
 * @param file The file object (from FormData)
 * @param folder The subfolder within public/uploads
 * @returns The relative URL of the uploaded file (e.g., /uploads/products/image.jpg)
 */
export async function uploadFileToLocal(
  file: File,
  folder: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  // Create unique filename using timestamp and random number to avoid collisions
  // We sanitize the original name to keep it safe
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${uniquePrefix}-${originalName}`;

  // Define the upload directory
  // In Next.js, process.cwd() is the root of the project
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  // Ensure the directory exists
  await mkdir(uploadDir, { recursive: true });

  // Write the file
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  // Return the relative URL for the frontend
  return `/uploads/${folder}/${filename}`;
}

/**
 * Deletes a file from the local filesystem.
 * @param fileUrl The relative URL of the file (e.g., /uploads/products/image.jpg)
 */
export async function deleteLocalFile(fileUrl: string): Promise<void> {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;

  try {
    const relativePath = fileUrl.replace(/^\/uploads\//, "");
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      relativePath
    );
    await unlink(filePath);
  } catch (error: any) {
    // Ignore if file doesn't exist
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete file: ${fileUrl}`, error);
    }
  }
}
