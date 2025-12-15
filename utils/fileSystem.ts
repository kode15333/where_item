import * as FileSystem from 'expo-file-system/legacy';

export const IMAGES_DIR = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + 'images/';

// Ensure directory exists
const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
};

/**
 * Moves an image from a temporary URI (cache) to persistent persistent storage.
 * If a file with the same filename exists, it will be overwritten.
 * @param uri - The temporary URI of the image (e.g. from Camera).
 * @param filename - The desired filename (e.g. `item_${id}.jpg`).
 * @returns The new persistent URI.
 */
export const saveImage = async (uri: string, filename: string): Promise<string> => {
    await ensureDirExists();
    const dest = IMAGES_DIR + filename;

    // Check if file exists and delete if so (overwrite strategy)
    const fileInfo = await FileSystem.getInfoAsync(dest);
    if (fileInfo.exists) {
        await FileSystem.deleteAsync(dest, { idempotent: true });
    }

    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
};

/**
 * Deletes an image from persistent storage.
 * @param uri - The persistent URI of the image to delete.
 */
export const deleteImage = async (uri: string): Promise<void> => {
    if (!uri) return;
    // Only delete if it is inside our managed directory
    if (uri.startsWith(IMAGES_DIR)) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    }
};
