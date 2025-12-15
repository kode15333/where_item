import { Link, useRouter } from 'expo-router';
import { Briefcase, Gamepad2, Glasses, Headphones, Key, Package, Plus, Search, Tv, Umbrella, Wallet, Watch } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Image, StatusBar as RNStatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Item, useStore } from '../store/useStore';
import i18n from '../utils/i18n';

const getPresetIcon = (uri: string) => {
    // Check for new preset ID format
    if (uri === 'preset:Keys' || uri.includes('car-keys.png')) return Key;
    if (uri === 'preset:Wallet' || uri.includes('wallet.png')) return Wallet;
    if (uri === 'preset:Glasses' || uri.includes('glasses.png')) return Glasses;
    if (uri === 'preset:Remote' || uri.includes('tv-remote.png')) return Tv;
    if (uri === 'preset:Bag' || uri.includes('backpack.png')) return Briefcase;
    if (uri === 'preset:Headphones') return Headphones;
    if (uri === 'preset:Umbrella') return Umbrella;
    if (uri === 'preset:Watch') return Watch;
    if (uri === 'preset:Game') return Gamepad2;
    if (uri === 'preset:Default') return Package;
    return null;
};

export default function Index() {
    const { items, initializeDefaults } = useStore();
    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (items.length === 0) {
            initializeDefaults();
        }
    }, [items.length]);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }: { item: Item }) => {
        const isRecent = Date.now() - item.updatedAt < 24 * 60 * 60 * 1000;

        // Icon rendering logic
        let IconElement = null;
        const PresetIcon = getPresetIcon(item.iconUri);

        if (PresetIcon) {
            IconElement = <PresetIcon size={40} color="#1F2937" />;
        } else if (item.iconUri) {
            // It's a file URI (custom photo) or legacy URL that didn't match known presets
            IconElement = <Image source={{ uri: item.iconUri }} className="w-20 h-20" resizeMode="contain" />;
        }

        return (
            <Link href={`/item/${item.id}`} asChild>
                <TouchableOpacity
                    className={`flex-1 m-2 rounded-3xl shadow-sm border overflow-hidden aspect-[4/5] ${isRecent ? 'bg-white border-blue-100' : 'bg-gray-100 border-gray-200'}`}
                >
                    <View className="flex-1 items-center justify-center p-4">
                        {IconElement ? (
                            IconElement
                        ) : (
                            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
                                <Text className="text-3xl">❓</Text>
                            </View>
                        )}
                    </View>

                    <View className={`p-4 ${isRecent ? 'bg-white' : 'bg-gray-100'}`}>
                        <Text className="font-bold text-gray-900 text-lg mb-1" numberOfLines={1}>{item.name}</Text>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className={`w-2 h-2 rounded-full mr-2 ${item.locationImageUri ? 'bg-green-500' : 'bg-orange-400'}`} />
                                <Text className="text-xs text-gray-500">
                                    {item.locationImageUri ? i18n.t('hasLocation') : i18n.t('noLocation')}
                                </Text>
                            </View>
                            {isRecent && <View className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <RNStatusBar barStyle="dark-content" />
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListHeaderComponent={
                    <View className="mt-6 mb-6 px-4">
                        {/* <Text className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{i18n.t('myStuff')}</Text> */}

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200 mb-4 shadow-sm">
                            <Search size={20} color="#9CA3AF" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-900"
                                placeholder={i18n.t('searchPlaceholder')}
                                placeholderTextColor="#9CA3AF"
                                value={searchText}
                                onChangeText={setSearchText}
                                clearButtonMode="while-editing"
                            />
                        </View>

                        <Text className="text-gray-500 text-lg">
                            {searchText ? i18n.t('foundItems', { count: filteredItems.length }) : i18n.t('totalItems', { count: items.length })}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Text className="text-gray-400 text-lg">
                            {searchText ? i18n.t('noMatches') : i18n.t('noItems')}
                        </Text>
                        {!searchText && <Text className="text-gray-400">{i18n.t('tapToAdd')}</Text>}
                    </View>
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => router.push('/add-item')}
                className="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-400"
            >
                <Plus color="white" size={32} />
            </TouchableOpacity>
        </View>
    );
}
