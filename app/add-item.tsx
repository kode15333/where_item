import * as Crypto from 'expo-crypto';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useNavigation, useRouter } from 'expo-router';
import { Briefcase, Camera, Check, ChevronLeft, Gamepad2, Glasses, Headphones, Key, Tv, Umbrella, Wallet, Watch } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCameraView from '../components/CameraView';
import { useStore } from '../store/useStore';
import { saveImage } from '../utils/fileSystem';
import i18n from '../utils/i18n';

// Map preset names to Lucide icons
const PRESETS = [
    { name: 'Keys', icon: Key, id: 'preset:Keys' },
    { name: 'Wallet', icon: Wallet, id: 'preset:Wallet' },
    { name: 'Glasses', icon: Glasses, id: 'preset:Glasses' },
    { name: 'Remote', icon: Tv, id: 'preset:Remote' },
    { name: 'Bag', icon: Briefcase, id: 'preset:Bag' },
    { name: 'Headphones', icon: Headphones, id: 'preset:Headphones' },
    { name: 'Umbrella', icon: Umbrella, id: 'preset:Umbrella' },
    { name: 'Watch', icon: Watch, id: 'preset:Watch' },
    { name: 'Game', icon: Gamepad2, id: 'preset:Game' },
];

export default function AddItemScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { addItem } = useStore();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [name, setName] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [locationPhotoUri, setLocationPhotoUri] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCameraCapture = async (uri: string) => {
        setIsProcessing(true);
        setShowCamera(false);
        try {
            // Processing logic remains if needed (e.g. resize), or just save directly
            // For location photo, we might want full aspect ratio, but resize to reasonable dimension
            const manipulated = await manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.7, format: SaveFormat.JPEG }
            );

            // Save to persistent storage
            const filename = `loc_${Crypto.randomUUID()}.jpg`;
            const savedUri = await saveImage(manipulated.uri, filename);

            setLocationPhotoUri(savedUri);
        } catch (error) {
            console.error("Camera proccessing error", error);
            setIsProcessing(false);
            alert("Failed to process photo");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (!locationPhotoUri) {
            alert(i18n.t('takePhoto')); // Reusing text or need new key? 'Photo is mandatory'
            return;
        }

        const finalName = name || (selectedPreset ? PRESETS.find(p => p.id === selectedPreset)?.name : i18n.t('unnamedItem')) || i18n.t('unnamedItem');
        // If custom URI is set, use it. Else if preset is selected, use it. Fallback to generic Default preset.
        const finalIconUri = selectedPreset || 'preset:Default';

        addItem({
            id: Crypto.randomUUID(),
            name: finalName,
            type: 'preset',
            iconUri: finalIconUri,
            locationImageUri: locationPhotoUri, // The mandatory photo
            updatedAt: Date.now(),
        });

        router.back();
    };

    if (showCamera) {
        return <AppCameraView onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1">
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                        <View className="flex-row items-center mb-6">
                            <TouchableOpacity onPress={() => router.back()} className="mr-4">
                                <ChevronLeft size={28} color="black" />
                            </TouchableOpacity>
                            <Text className="text-3xl font-bold">{i18n.t('addItem')}</Text>
                        </View>

                        {/* Mandarin Photo Section */}
                        <View className="mb-8">
                            <Text className="text-lg font-semibold mb-4 text-red-500">{i18n.t('takePhoto')} *</Text>
                            <TouchableOpacity
                                onPress={() => setShowCamera(true)}
                                className={`w-full aspect-[4/3] rounded-3xl border-2 border-dashed overflow-hidden items-center justify-center ${locationPhotoUri ? 'border-green-500 bg-black' : 'border-gray-300 bg-gray-50'}`}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={locationPhotoUri ? "white" : "black"} />
                                ) : locationPhotoUri ? (
                                    <View className="w-full h-full relative">
                                        <Image source={{ uri: locationPhotoUri }} className="w-full h-full" resizeMode="cover" />
                                        <View className="absolute bottom-4 right-4 bg-black/60 px-4 py-2 rounded-full">
                                            <Text className="text-white font-bold">{i18n.t('changePhoto')}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="items-center">
                                        <Camera size={64} color="#9CA3AF" className="mb-4" />
                                        <Text className="text-gray-400 text-xl font-bold">{i18n.t('takePhoto')}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Name & Icon Selection */}
                        <View className="mb-4 space-y-6">
                            {/* Name */}
                            <View>
                                <Text className="text-lg font-semibold mb-2">{i18n.t('itemName')}</Text>
                                <TextInput
                                    className="w-full bg-gray-100 p-4 rounded-xl text-lg"
                                    placeholder={i18n.t('itemNamePlaceholder')}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <Text className="text-center text-gray-400 font-medium my-2">- {i18n.t('usePreset')} -</Text>

                            {/* Icon Grid */}
                            <View className="flex-row flex-wrap justify-between">
                                {PRESETS.map((preset) => {
                                    const IconComponent = preset.icon;
                                    const isSelected = selectedPreset === preset.id;

                                    return (
                                        <TouchableOpacity
                                            key={preset.name}
                                            onPress={() => setSelectedPreset(preset.id)}
                                            className={`w-[30%] aspect-square items-center justify-center mb-4 rounded-2xl border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                                        >
                                            <IconComponent size={32} color={isSelected ? '#2563EB' : '#1F2937'} strokeWidth={1.5} className="mb-2" />
                                            <Text className="text-xs text-center font-medium text-gray-600">{preset.name}</Text>
                                            {isSelected && (
                                                <View className="absolute top-2 right-2">
                                                    <Check size={16} color="#2563EB" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Button */}
                    <View className="p-6 bg-white border-t border-gray-100">
                        <TouchableOpacity
                            onPress={handleSave}
                            className={`w-full p-4 rounded-xl items-center shadow-lg ${locationPhotoUri ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-300 shadow-none'}`}
                            disabled={!locationPhotoUri}
                        >
                            <Text className="text-white text-xl font-bold">{i18n.t('saveItem')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
