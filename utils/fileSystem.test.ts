import * as FileSystem from 'expo-file-system';
import { deleteImage, IMAGES_DIR } from './fileSystem';

// We rely on the global mocks provided in jest-setup.js or inline mocks
// For specific implementation checks, we can spy

describe('fileSystem', () => {
    it('images dir should be defined', () => {
        expect(IMAGES_DIR).toBeTruthy();
    });

    it('deleteImage should call FileSystem.deleteAsync if uri is essentially correct', async () => {
        const fakeUri = IMAGES_DIR + 'test.jpg';
        await deleteImage(fakeUri);
        expect(FileSystem.deleteAsync).toHaveBeenCalledWith(fakeUri, { idempotent: true });
    });

    // saveImage is harder to test purely without complex mocks because it chains getInfo, makeDir etc.
    // We assume the happy path for now based on simpler mocks.
});
