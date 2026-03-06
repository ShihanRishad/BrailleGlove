import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
  sendDirectText: (text: string) => void;
}

type Mode = 'text' | 'grid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CommunicationPanel({
  inputText,
  setInputText,
  isSending,
  isDark,
  sendTextToGlove,
  disconnectDevice,
  sendDirectText,
}: CommunicationPanelProps) {
  const [mode, setMode] = useState<Mode>('text');

  return (
    <Animated.View entering={FadeIn} style={styles.controlPanel}>
      <View style={[styles.card, isDark && darkStyles.card, { flex: 1, marginBottom: 24 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>Communication</Text>
          <TouchableOpacity onPress={disconnectDevice}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeToggleButton, mode === 'text' && styles.modeToggleButtonActive, isDark && mode === 'text' && darkStyles.modeToggleButtonActive]}
            onPress={() => setMode('text')}
          >
            <Text style={[styles.modeToggleText, mode === 'text' && styles.modeToggleTextActive, isDark && darkStyles.modeToggleText]}>Text Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleButton, mode === 'grid' && styles.modeToggleButtonActive, isDark && mode === 'grid' && darkStyles.modeToggleButtonActive]}
            onPress={() => setMode('grid')}
          >
            <Text style={[styles.modeToggleText, mode === 'grid' && styles.modeToggleTextActive, isDark && darkStyles.modeToggleText]}>Grid Mode</Text>
          </TouchableOpacity>
        </View>

        {mode === 'text' ? (
          <View style={{ flex: 1 }}>
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
        ) : (
          <View style={{ flex: 1, paddingTop: 8 }}>
            <View style={styles.gridContainer}>
              {alphabet.map((letter) => (
                <TouchableOpacity
                  key={letter}
                  style={[styles.gridItem, isDark && darkStyles.gridItem, isSending && { opacity: 0.5 }]}
                  onPress={() => sendDirectText(letter)}
                  disabled={isSending}
                >
                  <Text style={[styles.gridItemText, isDark && darkStyles.gridItemText]}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.hint, isDark && darkStyles.hint, { marginTop: 'auto' }]}>
              Tap a letter to instantly send Braille pattern.
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
