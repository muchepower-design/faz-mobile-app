import './global.css';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/database/database';
import { useAuthStore } from './src/store/authStore';
import { restoreSession } from './src/services/authService';
import { StatusBar } from 'react-native';
export default function App() {
    const setBootstrapped = useAuthStore(s => s.setBootstrapped);
    useEffect(() => { (async () => { try {
        await initDatabase();
        await restoreSession();
    }
    finally {
        setBootstrapped(true);
    } })(); }, [setBootstrapped]);
    return <SafeAreaProvider><StatusBar barStyle="dark-content" backgroundColor="#F7F8FC"/><NavigationContainer><RootNavigator /></NavigationContainer></SafeAreaProvider>;
}
