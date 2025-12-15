import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { deleteImage } from '../utils/fileSystem';

export interface Item {
    id: string;
    name: string;
    type: 'preset' | 'custom';
    iconUri: string;
    locationImageUri: string | null;
    updatedAt: number;
}

interface AppState {
    items: Item[];
    addItem: (item: Item) => void;
    updateLocation: (id: string, newImageUri: string) => void;
    deleteItem: (id: string) => void;
    initializeDefaults: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            items: [
                { id: 'default-1', name: 'Keys', type: 'preset', iconUri: 'preset:Keys', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-2', name: 'Wallet', type: 'preset', iconUri: 'preset:Wallet', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-3', name: 'Glasses', type: 'preset', iconUri: 'preset:Glasses', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-4', name: 'Remote', type: 'preset', iconUri: 'preset:Remote', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-5', name: 'Bag', type: 'preset', iconUri: 'preset:Bag', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-6', name: 'Headphones', type: 'preset', iconUri: 'preset:Headphones', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-7', name: 'Umbrella', type: 'preset', iconUri: 'preset:Umbrella', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-8', name: 'Watch', type: 'preset', iconUri: 'preset:Watch', locationImageUri: null, updatedAt: Date.now() },
                { id: 'default-9', name: 'Game', type: 'preset', iconUri: 'preset:Game', locationImageUri: null, updatedAt: Date.now() },
            ],
            addItem: (item) => set((state) => ({ items: [...state.items, item] })),
            updateLocation: (id, newImageUri) =>
                set((state) => {
                    const item = state.items.find(i => i.id === id);
                    if (item?.locationImageUri) {
                        void deleteImage(item.locationImageUri);
                    }
                    return {
                        items: state.items.map((item) =>
                            item.id === id ? { ...item, locationImageUri: newImageUri, updatedAt: Date.now() } : item
                        ),
                    };
                }),
            deleteItem: (id) =>
                set((state) => {
                    const itemToDelete = state.items.find((item) => item.id === id);
                    if (itemToDelete) {
                        if (itemToDelete.iconUri && itemToDelete.type === 'custom') {
                            void deleteImage(itemToDelete.iconUri);
                        }
                        if (itemToDelete.locationImageUri) {
                            void deleteImage(itemToDelete.locationImageUri);
                        }
                    }
                    return { items: state.items.filter((item) => item.id !== id) };
                }),
            initializeDefaults: () => set({
                items: [
                    { id: 'default-1', name: 'Keys', type: 'preset', iconUri: 'preset:Keys', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-2', name: 'Wallet', type: 'preset', iconUri: 'preset:Wallet', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-3', name: 'Glasses', type: 'preset', iconUri: 'preset:Glasses', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-4', name: 'Remote', type: 'preset', iconUri: 'preset:Remote', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-5', name: 'Bag', type: 'preset', iconUri: 'preset:Bag', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-6', name: 'Headphones', type: 'preset', iconUri: 'preset:Headphones', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-7', name: 'Umbrella', type: 'preset', iconUri: 'preset:Umbrella', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-8', name: 'Watch', type: 'preset', iconUri: 'preset:Watch', locationImageUri: null, updatedAt: Date.now() },
                    { id: 'default-9', name: 'Game', type: 'preset', iconUri: 'preset:Game', locationImageUri: null, updatedAt: Date.now() },
                ]
            }),
        }),
        {
            name: 'where-is-it-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
