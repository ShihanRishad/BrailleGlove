import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import CommunicationPanel from '../components/CommunicationPanel';
import DeviceListView from '../components/DeviceListView';
import { darkStyles, styles } from '../constants/theme';
import { useBLE } from '../hooks/useBLE';

export default function HomeScreen() {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme]);

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const router = useRouter();

  const {
    scannedDevices,
    device,
    isScanning,
    connectionStatus,
    inputText,
    setInputText,
    isSending,
    startScan,
    connectToDevice,
    disconnectDevice,
    sendTextToGlove,
    sendDirectText,
  } = useBLE();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && darkStyles.container]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Animated.Text
            entering={FadeInDown.delay(100)}
            style={[styles.title, isDark && darkStyles.title]}
          >
            BrailleGlove
          </Animated.Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/indicators')} style={{ marginRight: 16 }}>
              <Ionicons
                name="grid"
                size={22}
                color={isDark ? '#FFFFFF' : '#1A1A1A'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={26}
                color={isDark ? '#FFD700' : '#1A1A1A'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Animated.View
          entering={FadeIn.delay(300)}
          style={[
            styles.statusBadge,
            {
              backgroundColor: device
                ? isDark
                  ? '#1B5E20'
                  : '#E8F5E9'
                : isDark
                  ? '#333333'
                  : '#F5F5F5',
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: device
                  ? '#4CAF50'
                  : isDark
                    ? '#757575'
                    : '#9E9E9E',
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: device
                  ? isDark
                    ? '#C8E6C9'
                    : '#2E7D32'
                  : isDark
                    ? '#AAAAAA'
                    : '#616161',
              },
            ]}
          >
            {connectionStatus}
          </Text>
        </Animated.View>
      </View>

      {!device ? (
        <DeviceListView
          scannedDevices={scannedDevices}
          isScanning={isScanning}
          isDark={isDark}
          startScan={startScan}
          connectToDevice={connectToDevice}
        />
      ) : (
        <CommunicationPanel
          inputText={inputText}
          setInputText={setInputText}
          isSending={isSending}
          isDark={isDark}
          sendTextToGlove={sendTextToGlove}
          sendDirectText={sendDirectText}
          disconnectDevice={disconnectDevice}
        />
      )}
    </KeyboardAvoidingView>
  );
}
