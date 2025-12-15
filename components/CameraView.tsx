import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../utils/i18n';

interface CameraViewProps {
    onCapture: (uri: string) => void;
    onClose: () => void;
    aspectRatio?: '1:1' | '16:9'; // For UI overlay if needed, CameraView handles aspect ratio differently often
}

export default function AppCameraView({ onCapture, onClose }: CameraViewProps) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View className="flex-1 justify-center items-center bg-gray-900 p-4">
                <Text className="text-white text-center mb-4 text-lg">
                    {i18n.t('permissionText')}
                </Text>
                <Button onPress={requestPermission} title={i18n.t('grantPermission')} />
                <TouchableOpacity onPress={onClose} className="mt-8">
                    <Text className="text-gray-400">{i18n.t('cancel')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !isCapturing) {
            setIsCapturing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: false,
                    exif: false,
                    skipProcessing: true, // Faster capture
                });
                if (photo?.uri) {
                    onCapture(photo.uri);
                }
            } catch (e) {
                console.error("Failed to take picture", e);
            } finally {
                setIsCapturing(false);
            }
        }
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
                animateShutter={false}
            />
            {/* Overlay Controls */}
            <View className="absolute inset-0 flex-1 justify-between p-6 pb-12">
                <View className="flex-row justify-end mt-8">
                    <TouchableOpacity onPress={onClose} className="bg-black/40 p-2 rounded-full">
                        <X color="white" size={24} />
                    </TouchableOpacity>
                </View>
                <View className="flex-row justify-center items-center">
                    <TouchableOpacity
                        className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 items-center justify-center"
                        onPress={takePicture}
                        disabled={isCapturing}
                    >
                        <View className="w-16 h-16 bg-white rounded-full border-2 border-black" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
});
