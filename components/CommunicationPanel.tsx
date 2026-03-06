import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { darkStyles, styles } from '../constants/theme';

interface CommunicationPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  isDark: boolean;
  sendTextToGlove: () => void;
  disconnectDevice: () => void;
}

export default function CommunicationPanel({
  inputText,
  setInputText,
  isSending,
  isDark,
  sendTextToGlove,
  disconnectDevice,
}: CommunicationPanelProps) {
  return (
    <Animated.View entering={FadeIn} style={styles.controlPanel}>
      <View style={[styles.card, isDark && darkStyles.card]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>Communication</Text>
          <TouchableOpacity onPress={disconnectDevice}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, isDark && darkStyles.input]}
          placeholder="Enter text to convert..."
          value={inputText}
          onChangeText={setInputText}
          maxLength={20}
          placeholderTextColor={isDark ? '#888888' : '#BDBDBD'}
          editable={!isSending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText || isSending
              ? isDark
                ? darkStyles.disabledButton
                : styles.disabledButton
              : null,
          ]}
          onPress={sendTextToGlove}
          disabled={!inputText || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Send to Glove</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.hint, isDark && darkStyles.hint]}>
          The glove will vibrate each letter in Braille pattern.
        </Text>
      </View>
    </Animated.View>
  );
}
