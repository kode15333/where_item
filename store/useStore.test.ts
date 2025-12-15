import { useStore } from './useStore';

// Mock FileSystem methods via Jest
jest.mock('../utils/fileSystem', () => ({
    deleteImage: jest.fn(),
}));

describe('useStore', () => {
    beforeEach(() => {
        // Clear store before each test
        useStore.setState({ items: [] });
    });

    it('should initially have empty items', () => {
        const { items } = useStore.getState();
        expect(items).toEqual([]);
    });

    it('should add an item', () => {
        const item = {
            id: '1',
            name: 'Test Item',
            type: 'preset' as const,
            iconUri: 'test.png',
            locationImageUri: null,
            updatedAt: Date.now(),
        };

        useStore.getState().addItem(item);
        const { items } = useStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0]).toEqual(item);
    });

    it('should update location image uri', () => {
        const item = {
            id: '1',
            name: 'Test Item',
            type: 'preset' as const,
            iconUri: 'test.png',
            locationImageUri: null,
            updatedAt: Date.now(),
        };
        useStore.getState().addItem(item);

        const newUri = 'file://new-location.jpg';
        useStore.getState().updateLocation('1', newUri);

        const { items } = useStore.getState();
        expect(items[0].locationImageUri).toBe(newUri);
    });

    it('should delete an item', () => {
        const item = {
            id: '1',
            name: 'Test Item',
            type: 'preset' as const,
            iconUri: 'test.png',
            locationImageUri: 'file://loc.jpg',
            updatedAt: Date.now(),
        };
        useStore.getState().addItem(item);
        useStore.getState().deleteItem('1');

        const { items } = useStore.getState();
        expect(items).toHaveLength(0);
    });
});
