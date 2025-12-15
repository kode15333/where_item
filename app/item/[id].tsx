import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import AppCameraView from '../../components/CameraView';
import { useStore } from '../../store/useStore';
import { saveImage } from '../../utils/fileSystem';
import i18n from '../../utils/i18n';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { items, deleteItem, updateLocation } = useStore();
    const item = items.find((i) => i.id === id);

    const [showCamera, setShowCamera] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!item) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">{i18n.t('itemNotFound')}</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-500">{i18n.t('goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(i18n.t('deleteConfirmTitle'), i18n.t('deleteConfirmMessage'), [
            { text: i18n.t('cancel'), style: "cancel" },
            {
                text: i18n.t('delete'),
                style: "destructive",
                onPress: () => {
                    deleteItem(item.id);
                    router.back();
                }
            }
        ]);
    };

    const handleCapture = async (uri: string) => {
        setIsProcessing(true);
        setShowCamera(false);
        try {
            // Save with new unique name to burst cache
            const filename = `location_${item.id}_${Date.now()}.jpg`;
            const savedUri = await saveImage(uri, filename);
            updateLocation(item.id, savedUri);
        } catch (e) {
            console.error("Failed to update location", e);
            Alert.alert(i18n.t('error'), i18n.t('failedToSaveLocationPhoto'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (showCamera) {
        return <AppCameraView onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
    }

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Overlay */}
            <View className="absolute top-12 left-4 z-10 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="bg-black/50 p-2 rounded-full mr-4">
                    <ChevronLeft color="white" size={28} />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold shadow-md">{item.name}</Text>
            </View>

            {/* Main Content (Image or Take Photo) */}
            <View className="flex-1 items-center justify-center p-6">
                {item.locationImageUri ? (
                    <Image
                        source={{ uri: item.locationImageUri }}
                        className="w-full h-full rounded-3xl"
                        resizeMode="cover"
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => setShowCamera(true)}
                        className="w-full h-3/4 border-4 border-dashed border-gray-600 rounded-3xl items-center justify-center bg-gray-900/50"
                    >
                        <Camera color="gray" size={80} className="mb-6" />
                        <Text className="text-gray-400 text-2xl font-bold text-center">{i18n.t('takePhoto')}</Text>
                        <Text className="text-gray-500 text-base mt-2">{i18n.t('tapToSaveLocation')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom Actions */}
            <View className="absolute bottom-12 w-full px-6 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => setShowCamera(true)}
                    className="flex-1 bg-blue-600 py-4 rounded-2xl mr-4 flex-row justify-center items-center shadow-lg"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Camera color="white" size={24} className="mr-2" />
                            <Text className="text-white font-bold text-lg">{i18n.t('updateLocation')}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    className="w-14 h-14 bg-red-500 rounded-2xl items-center justify-center shadow-lg"
                >
                    <Trash2 color="white" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
