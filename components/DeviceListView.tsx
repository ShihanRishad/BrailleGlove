import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { darkStyles, styles } from '../constants/theme';

interface DeviceListViewProps {
  scannedDevices: Device[];
  isScanning: boolean;
  isDark: boolean;
  startScan: () => void;
  connectToDevice: (device: Device) => void;
}

function DeviceItem({
  item,
  isDark,
  connectToDevice,
}: {
  item: Device;
  isDark: boolean;
  connectToDevice: (device: Device) => void;
}) {
  return (
    <Animated.View entering={FadeInDown} layout={Layout.springify()}>
      <TouchableOpacity
        style={[styles.deviceCard, isDark && darkStyles.deviceCard]}
        onPress={() => connectToDevice(item)}
      >
        <View style={styles.deviceInfo}>
          <Ionicons name="bluetooth" size={24} color={isDark ? '#66B2FF' : '#007BFF'} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.deviceName, isDark && darkStyles.deviceName]}>
              {item.name || 'Unknown Device'}
            </Text>
            <Text style={[styles.deviceId, isDark && darkStyles.deviceId]}>{item.id}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDark ? '#555' : '#ccc'} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DeviceListView({
  scannedDevices,
  isScanning,
  isDark,
  startScan,
  connectToDevice,
}: DeviceListViewProps) {
  return (
    <View style={styles.content}>
      <View style={styles.scanSection}>
        <TouchableOpacity
          style={[
            styles.scanButton,
            isScanning && styles.scanButtonDisabled,
            isDark && darkStyles.scanButton,
          ]}
          onPress={startScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color={isDark ? '#121212' : 'white'} />
          ) : (
            <>
              <Ionicons
                name="search"
                size={20}
                color={isDark ? '#121212' : 'white'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonText, isDark && darkStyles.scanButtonText]}>
                Scan for Glove
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={scannedDevices}
        renderItem={({ item }) => (
          <DeviceItem item={item} isDark={isDark} connectToDevice={connectToDevice} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() =>
          !isScanning ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bluetooth-outline"
                size={64}
                color={isDark ? '#555555' : '#E0E0E0'}
              />
              <Text style={[styles.emptyText, isDark && darkStyles.emptyText]}>
                Tap scan to find your device
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
