import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

type Mode = 'text' | 'grid' | 'lookout';
type TrailPoint = { x: number; y: number };

const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API || process.env.GEMINI_API;

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
const maxTrailPoints = 10;
const minTrailPointDistance = 8;

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
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [lookoutQuery, setLookoutQuery] = useState('');
  const [lookoutAnswer, setLookoutAnswer] = useState('');
  const [isSearchingLookout, setIsSearchingLookout] = useState(false);
  const [isListeningLookout, setIsListeningLookout] = useState(false);
  const lastSwipedLetter = useRef<string | null>(null);
  const swipedLetters = useRef<string[]>([]);
  const isSwipeTooLong = useRef(false);
  const isSendingRef = useRef(isSending);

  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  useEffect(() => {
    if (mode !== 'grid') {
      resetGridSwipe();
      setSelectedLetters([]);
    }
  }, [mode]);

  useEffect(() => {
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const spokenText = event.value?.[0]?.trim();

      if (spokenText) {
        setLookoutQuery(spokenText);
      }
    };

    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      setIsListeningLookout(false);
      Alert.alert('Voice typing failed', event.error?.message || 'Could not recognize speech.');
    };

    Voice.onSpeechEnd = () => {
      setIsListeningLookout(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const selectedLetterSet = useMemo(() => new Set(selectedLetters), [selectedLetters]);

  const addTrailPoint = (point: TrailPoint) => {
    setTrailPoints((currentPoints) => {
      const previousPoint = currentPoints[currentPoints.length - 1];

      if (
        previousPoint &&
        Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) < minTrailPointDistance
      ) {
        return currentPoints;
      }

      return [...currentPoints, point].slice(-maxTrailPoints);
    });
  };

  const trackLetterFromTouch = (event: GestureResponderEvent) => {
    if (!gridLayout.width || !gridLayout.height) {
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    addTrailPoint({ x: locationX, y: locationY });

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
    setSelectedLetters([...swipedLetters.current]);
  };

  const resetGridSwipe = (clearSelection = true) => {
    lastSwipedLetter.current = null;
    swipedLetters.current = [];
    isSwipeTooLong.current = false;
    setTrailPoints([]);

    if (clearSelection) {
      setSelectedLetters([]);
    }
  };

  const finishGridSwipe = () => {
    const lettersToSend = swipedLetters.current.join('');
    const lettersToHighlight = [...swipedLetters.current];
    const shouldRejectSwipe = isSwipeTooLong.current;

    resetGridSwipe(false);

    if (shouldRejectSwipe) {
      setSelectedLetters([]);
      Alert.alert('Swipe too long', `Please swipe ${maxGridLetters} letters or fewer.`);
      return;
    }

    if (lettersToSend) {
      setSelectedLetters(lettersToHighlight);
      Promise.resolve(sendDirectText(lettersToSend)).finally(() => {
        setSelectedLetters([]);
      });
    } else {
      setSelectedLetters([]);
    }
  };

  const searchLookout = async () => {
    const query = lookoutQuery.trim();

    if (!query || isSearchingLookout) {
      return;
    }

    if (!geminiApiKey) {
      Alert.alert('Gemini key missing', 'Add EXPO_PUBLIC_GEMINI_API to your .env file.');
      return;
    }

    setIsSearchingLookout(true);
    setLookoutAnswer('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Answer the question as short as possible. If it asks for a number, return only the number and unit if needed. If it asks for a name, return only the name. No sentence, no explanation.\n\nQuestion: ${query}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 24,
            },
          }),
        }
      );

      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text)
        .filter(Boolean)
        .join('')
        .trim();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini request failed.');
      }

      setLookoutAnswer(answer || 'No answer');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not search right now.';
      Alert.alert('Lookout failed', message);
    } finally {
      setIsSearchingLookout(false);
    }
  };

  const toggleLookoutVoiceTyping = async () => {
    if (isSearchingLookout) {
      return;
    }

    try {
      if (isListeningLookout) {
        await Voice.stop();
        setIsListeningLookout(false);
        return;
      }

      const isVoiceAvailable = await Voice.isAvailable();

      if (!isVoiceAvailable) {
        Alert.alert('Voice typing unavailable', 'No speech recognition service is available on this device.');
        return;
      }

      setLookoutAnswer('');
      setIsListeningLookout(true);
      await Voice.start('en-US');
    } catch (error) {
      setIsListeningLookout(false);
      const message = error instanceof Error ? error.message : 'Could not start voice typing.';
      Alert.alert('Voice typing failed', message);
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
          <TouchableOpacity
            style={[styles.modeToggleButton, mode === 'lookout' && styles.modeToggleButtonActive, isDark && mode === 'lookout' && darkStyles.modeToggleButtonActive]}
            onPress={() => setMode('lookout')}
          >
            <Text style={[styles.modeToggleText, isDark && darkStyles.modeToggleText, mode === 'lookout' && styles.modeToggleTextActive, isDark && mode === 'lookout' && darkStyles.modeToggleTextActive]}>Lookout</Text>
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
        ) : mode === 'grid' ? (
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
                      style={[
                        styles.gridCell,
                        isDark && darkStyles.gridCell,
                        letter && selectedLetterSet.has(letter) && styles.gridCellSelected,
                        letter && selectedLetterSet.has(letter) && isDark && darkStyles.gridCellSelected,
                      ]}
                      pointerEvents="none"
                    >
                      {letter ? (
                        <Text
                          style={[
                            styles.gridItemText,
                            isDark && darkStyles.gridItemText,
                            selectedLetterSet.has(letter) && styles.gridItemTextSelected,
                          ]}
                        >
                          {letter}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
              <View pointerEvents="none" style={styles.gridTrailLayer}>
                {trailPoints.slice(1).map((point, index) => {
                  const previousPoint = trailPoints[index];
                  const segmentLength = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
                  const segmentAngle = Math.atan2(point.y - previousPoint.y, point.x - previousPoint.x);
                  const segmentProgress = (index + 1) / Math.max(trailPoints.length - 1, 1);
                  const segmentThickness = 4 + segmentProgress * 5;

                  return (
                    <View
                      key={`${index}-${point.x}-${point.y}`}
                      style={[
                        styles.gridTrailSegment,
                        {
                          left: (point.x + previousPoint.x - segmentLength) / 2,
                          top: (point.y + previousPoint.y - segmentThickness) / 2,
                          width: segmentLength,
                          height: segmentThickness,
                          borderRadius: segmentThickness / 2,
                          opacity: 0.16 + segmentProgress * 0.56,
                          transform: [{ rotateZ: `${segmentAngle}rad` }],
                        },
                      ]}
                    />
                  );
                })}
                {trailPoints.length ? (
                  <View
                    style={[
                      styles.gridTrailDot,
                      {
                        left: trailPoints[trailPoints.length - 1].x - 8,
                        top: trailPoints[trailPoints.length - 1].y - 8,
                      },
                    ]}
                  />
                ) : null}
              </View>
            </View>
            <Text style={[styles.hint, isDark && darkStyles.hint, { marginTop: 14 }]}>
              Tap or swipe across letters to instantly send Braille patterns.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, paddingTop: 8 }}>
            <View style={styles.lookoutSearchRow}>
              <TextInput
                style={[styles.lookoutInput, isDark && darkStyles.input]}
                placeholder="Ask anything..."
                value={lookoutQuery}
                onChangeText={setLookoutQuery}
                placeholderTextColor={isDark ? '#888888' : '#BDBDBD'}
                editable={!isSearchingLookout}
                returnKeyType="search"
                onSubmitEditing={searchLookout}
              />
              <TouchableOpacity
                style={[
                  styles.lookoutIconButton,
                  isDark && darkStyles.lookoutIconButton,
                  isListeningLookout && styles.lookoutMicButtonActive,
                ]}
                onPress={toggleLookoutVoiceTyping}
                disabled={isSearchingLookout}
              >
                <Ionicons
                  name={isListeningLookout ? 'mic-circle' : 'mic'}
                  size={isListeningLookout ? 26 : 22}
                  color={isListeningLookout ? '#FFFFFF' : isDark ? '#FFFFFF' : '#212529'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.lookoutIconButton,
                  styles.lookoutSearchButton,
                  (!lookoutQuery.trim() || isSearchingLookout) && styles.lookoutSearchButtonDisabled,
                ]}
                onPress={searchLookout}
                disabled={!lookoutQuery.trim() || isSearchingLookout}
              >
                {isSearchingLookout ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Ionicons name="search" size={22} color="white" />
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.lookoutAnswerPanel, isDark && darkStyles.lookoutAnswerPanel]}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={3}
                minimumFontScale={0.55}
                style={[styles.lookoutAnswerText, isDark && darkStyles.lookoutAnswerText]}
              >
                {lookoutAnswer || 'Answer'}
              </Text>
            </View>

            <Text style={[styles.hint, isDark && darkStyles.hint, { marginTop: 14 }]}>
              {isListeningLookout ? 'Listening...' : 'Tap the mic and speak your search.'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
