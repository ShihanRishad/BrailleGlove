import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import base64 from 'react-native-base64';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';

const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const LETTER_SEND_DELAY_MS = 1500;

let bleManager: BleManager | null = null;
try {
  if (Platform.OS !== 'web') {
    bleManager = new BleManager();
  }
} catch (e) {
  console.warn(
    'BleManager initialization failed. If you are using Expo Go, BLE is not supported.'
  );
}

export function useBLE() {
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const disconnectSubscription = useRef<Subscription | null>(null);
  // Track whether we intentionally disconnected (to avoid "Link Lost" on user-initiated disconnect)
  const intentionalDisconnect = useRef(false);

  useEffect(() => {
    requestBluetoothPermissions();
    return () => {
      if (bleManager) {
        bleManager.stopDeviceScan();
      }
      disconnectSubscription.current?.remove();
    };
  }, []);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } else {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
    }
  };

  const startScan = () => {
    if (!bleManager) {
      setConnectionStatus('BLE not supported (Requires Dev Client)');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScannedDevices([]);
    setIsScanning(true);
    setConnectionStatus('Searching for Glove...');

    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.log('Scan Error:', error);
        setConnectionStatus('Scan Error - Check Bluetooth');
        setIsScanning(false);
        return;
      }

      if (scannedDevice && scannedDevice.name) {
        setScannedDevices((prev) => {
          if (prev.find((d) => d.id === scannedDevice.id)) return prev;
          return [...prev, scannedDevice];
        });
      }
    });

    // Stop scan after 10 seconds automatically
    setTimeout(() => {
      if (bleManager) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        setScannedDevices((current) => {
          if (current.length === 0) setConnectionStatus('No devices found');
          return current;
        });
      }
    }, 10000);
  };

  const connectToDevice = async (selectedDevice: Device) => {
    if (!bleManager) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    bleManager.stopDeviceScan();
    setIsScanning(false);
    setConnectionStatus(`Connecting to ${selectedDevice.name}...`);

    try {
      const connectedDevice = await selectedDevice.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setDevice(connectedDevice);
      setConnectionStatus('Connected!');

      // Monitor for real disconnection events
      disconnectSubscription.current?.remove();
      disconnectSubscription.current = bleManager.onDeviceDisconnected(
        connectedDevice.id,
        (_error, _disconnectedDevice) => {
          if (!intentionalDisconnect.current) {
            setConnectionStatus('Link Lost');
            setDevice(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
      );
    } catch (e) {
      console.log('Connection Failed:', e);
      setConnectionStatus('Connection Failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const disconnectDevice = async () => {
    if (device) {
      intentionalDisconnect.current = true;
      disconnectSubscription.current?.remove();
      disconnectSubscription.current = null;
      await device.cancelConnection();
      setDevice(null);
      setConnectionStatus('Disconnected');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      intentionalDisconnect.current = false;
    }
  };

  const waitBetweenLetters = () =>
    new Promise((resolve) => setTimeout(resolve, LETTER_SEND_DELAY_MS));

  const writeLetterToGlove = async (char: string) => {
    if (!device) return false;

    const base64Data = base64.encode(char);

    try {
      // Use writeWithoutResponse because HM-10's FFE1 characteristic does not
      // support write-with-response, even though data is delivered successfully.
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Data
      );
      return true;
    } catch (err) {
      console.log('Write error:', err);

      // Check if the device is still reachable before giving up
      try {
        const stillConnected = await device.isConnected();
        if (!stillConnected) {
          console.log('Device is no longer connected, stopping send.');
          return false;
        }
        // Device is still connected, likely a transient error, continue
        console.log('Device still connected, continuing to next character.');
        return true;
      } catch {
        // isConnected() itself failed, device is gone
        console.log('Cannot reach device, stopping send.');
        return false;
      }
    }
  };

  const _sendToGlove = async (text: string) => {
    if (!device) return;

    const textToVibrate = text.toLowerCase().replace(/[^a-z]/g, '');
    if (textToVibrate.length === 0) return;

    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    for (let i = 0; i < textToVibrate.length; i++) {
      const didWrite = await writeLetterToGlove(textToVibrate[i]);
      if (!didWrite) {
        break;
      }

      // Wait between characters so the Arduino has time to process each letter
      if (i < textToVibrate.length - 1) {
        await waitBetweenLetters();
      }
    }

    setIsSending(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sendTextToGlove = async () => {
    await _sendToGlove(inputText);
    setInputText('');
  };

  const sendDirectText = async (text: string) => {
    await _sendToGlove(text);
  };

  return {
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
  };
}
