import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, GestureResponderEvent, PanResponder, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { darkStyles, styles } from '../constants/theme';

interface CommunicationPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  isDark: boolean;
  sendTextToGlove: () => void;
  disconnectDevice: () => void;
  sendDirectText: (text: string) => void | Promise<void>;
}

type Mode = 'text' | 'grid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const gridColumns = 4;
const alphabetRows = [
  alphabet.slice(0, 4),
  alphabet.slice(4, 8),
  alphabet.slice(8, 12),
  alphabet.slice(12, 16),
  alphabet.slice(16, 20),
  alphabet.slice(20, 24),
  ['', 'Y', 'Z', ''],
];
const maxGridLetters = 20;

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
  const [gridLayout, setGridLayout] = useState({ width: 0, height: 0 });
  const lastSwipedLetter = useRef<string | null>(null);
  const swipedLetters = useRef<string[]>([]);
  const isSwipeTooLong = useRef(false);
  const isSendingRef = useRef(isSending);

  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  const trackLetterFromTouch = (event: GestureResponderEvent) => {
    if (!gridLayout.width || !gridLayout.height) {
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const column = Math.floor(locationX / (gridLayout.width / gridColumns));
    const row = Math.floor(locationY / (gridLayout.height / alphabetRows.length));
    const letter = alphabetRows[row]?.[column];

    if (!letter || letter === lastSwipedLetter.current) {
      return;
    }

    lastSwipedLetter.current = letter;

    if (swipedLetters.current.length >= maxGridLetters) {
      isSwipeTooLong.current = true;
      return;
    }

    swipedLetters.current.push(letter);
  };

  const resetGridSwipe = () => {
    lastSwipedLetter.current = null;
    swipedLetters.current = [];
    isSwipeTooLong.current = false;
  };

  const finishGridSwipe = () => {
    const lettersToSend = swipedLetters.current.join('');
    const shouldRejectSwipe = isSwipeTooLong.current;

    resetGridSwipe();

    if (shouldRejectSwipe) {
      Alert.alert('Swipe too long', `Please swipe ${maxGridLetters} letters or fewer.`);
      return;
    }

    if (lettersToSend) {
      sendDirectText(lettersToSend);
    }
  };

  const gridPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => mode === 'grid' && !isSendingRef.current,
    onMoveShouldSetPanResponder: () => mode === 'grid' && !isSendingRef.current,
    onPanResponderGrant: (event) => {
      resetGridSwipe();
      trackLetterFromTouch(event);
    },
    onPanResponderMove: trackLetterFromTouch,
    onPanResponderRelease: finishGridSwipe,
    onPanResponderTerminate: () => {
      resetGridSwipe();
    },
  });

  return (
    <Animated.View entering={FadeIn} style={styles.controlPanel}>
      <View style={[styles.card, isDark && darkStyles.card, { flex: 1, marginBottom: 24 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>Communication</Text>
          <TouchableOpacity onPress={disconnectDevice}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.modeToggleContainer, isDark && darkStyles.modeToggleContainer]}>
          <TouchableOpacity
            style={[styles.modeToggleButton, mode === 'text' && styles.modeToggleButtonActive, isDark && mode === 'text' && darkStyles.modeToggleButtonActive]}
            onPress={() => setMode('text')}
          >
            <Text style={[styles.modeToggleText, isDark && darkStyles.modeToggleText, mode === 'text' && styles.modeToggleTextActive, isDark && mode === 'text' && darkStyles.modeToggleTextActive]}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleButton, mode === 'grid' && styles.modeToggleButtonActive, isDark && mode === 'grid' && darkStyles.modeToggleButtonActive]}
            onPress={() => setMode('grid')}
          >
            <Text style={[styles.modeToggleText, isDark && darkStyles.modeToggleText, mode === 'grid' && styles.modeToggleTextActive, isDark && mode === 'grid' && darkStyles.modeToggleTextActive]}>Grid</Text>
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
            <View
              style={[styles.gridTable, isDark && darkStyles.gridTable, isSending && { opacity: 0.5 }]}
              onLayout={(event) => setGridLayout(event.nativeEvent.layout)}
              {...gridPanResponder.panHandlers}
            >
              {alphabetRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.gridRow}>
                  {row.map((letter, columnIndex) => (
                    <View
                      key={`${rowIndex}-${columnIndex}-${letter || 'empty'}`}
                      style={[styles.gridCell, isDark && darkStyles.gridCell]}
                      pointerEvents="none"
                    >
                      {letter ? (
                        <Text style={[styles.gridItemText, isDark && darkStyles.gridItemText]}>{letter}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <Text style={[styles.hint, isDark && darkStyles.hint, { marginTop: 14 }]}>
              Tap or swipe across letters to instantly send Braille patterns.
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
