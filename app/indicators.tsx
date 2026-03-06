import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

const BRAILLE_ALPHABET = [
  { letter: 'A', dots: [0] },
  { letter: 'B', dots: [0, 1] },
  { letter: 'C', dots: [0, 3] },
  { letter: 'D', dots: [0, 3, 4] },
  { letter: 'E', dots: [0, 4] },
  { letter: 'F', dots: [0, 1, 3] },
  { letter: 'G', dots: [0, 1, 3, 4] },
  { letter: 'H', dots: [0, 1, 4] },
  { letter: 'I', dots: [1, 3] },
  { letter: 'J', dots: [1, 3, 4] },
  { letter: 'K', dots: [0, 2] },
  { letter: 'L', dots: [0, 1, 2] },
  { letter: 'M', dots: [0, 2, 3] },
  { letter: 'N', dots: [0, 2, 3, 4] },
  { letter: 'O', dots: [0, 2, 4] },
  { letter: 'P', dots: [0, 1, 2, 3] },
  { letter: 'Q', dots: [0, 1, 2, 3, 4] },
  { letter: 'R', dots: [0, 1, 2, 4] },
  { letter: 'S', dots: [1, 2, 3] },
  { letter: 'T', dots: [1, 2, 3, 4] },
  { letter: 'U', dots: [0, 2, 5] },
  { letter: 'V', dots: [0, 1, 2, 5] },
  { letter: 'W', dots: [1, 3, 4, 5] },
  { letter: 'X', dots: [0, 2, 3, 5] },
  { letter: 'Y', dots: [0, 2, 3, 4, 5] },
  { letter: 'Z', dots: [0, 2, 4, 5] },
];

const BrailleChar = ({ letter, dots, isDark }: { letter: string; dots: number[], isDark: boolean }) => {
  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.gridContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const isFilled = dots.includes(index);
          return (
            <View
              key={index}
              style={[
                styles.dot,
                { borderColor: isDark ? '#FFFFFF' : '#000000' },
                isFilled && { backgroundColor: isDark ? '#FFFFFF' : '#000000' },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.letter, isDark && styles.letterDark]}>{letter}</Text>
    </View>
  );
};

export default function IndicatorsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Braille Indicators</Text>
      </View>
      
      <FlatList
        data={BRAILLE_ALPHABET}
        keyExtractor={(item) => item.letter}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BrailleChar letter={item.letter} dots={item.dots} isDark={isDark} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '46%',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  gridContainer: {
    width: 60,
    height: 90,
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignContent: 'space-between',
    marginBottom: 20,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginVertical: 4,
  },
  letter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  letterDark: {
    color: '#FFFFFF',
  },
});
