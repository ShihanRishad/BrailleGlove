#include <SoftwareSerial.h>

// RX on Pin 2 (Connect to HM-10 TX), TX on Pin 3 (Connect to HM-10 RX)
SoftwareSerial BLE(2, 3); 

// The pins connected to the 6 vibration motors 
// (Added the [6] to define the array size)
int motorPins[6] = {4, 5, 6, 7, 8, 9};

// Braille dictionary for a-z.
// 1 means Vibrate (HIGH), 0 means Off (LOW)
const byte brailleMap[26][6] = {
  {1,0,0,0,0,0}, // a
  {1,1,0,0,0,0}, // b
  {1,0,0,1,0,0}, // c
  {1,0,0,1,1,0}, // d
  {1,0,0,0,1,0}, // e
  {1,1,0,1,0,0}, // f
  {1,1,0,1,1,0}, // g
  {1,1,0,0,1,0}, // h
  {0,1,0,1,0,0}, // i
  {0,1,0,1,1,0}, // j
  {1,0,1,0,0,0}, // k
  {1,1,1,0,0,0}, // l
  {1,0,1,1,0,0}, // m
  {1,0,1,1,1,0}, // n
  {1,0,1,0,1,0}, // o
  {1,1,1,1,0,0}, // p
  {1,1,1,1,1,0}, // q
  {1,1,1,0,1,0}, // r
  {0,1,1,1,0,0}, // s
  {0,1,1,1,1,0}, // t
  {1,0,1,0,0,1}, // u
  {1,1,1,0,0,1}, // v
  {0,1,0,1,1,1}, // w
  {1,0,1,1,0,1}, // x
  {1,0,1,1,1,1}, // y
  {1,0,1,0,1,1}  // z
};

// Braille number prefix (#): dots 3, 4, 5, 6.
const byte numberPrefix[6] = {0,0,1,1,1,1};

// Common punctuation and special-character Braille patterns.
struct BrailleSymbol {
  char character;
  byte dots[6];
};

const BrailleSymbol symbolMap[] = {
  {' ', {0,0,0,0,0,0}}, // space / pause
  {'.', {0,1,0,0,1,1}},
  {',', {0,1,0,0,0,0}},
  {'?', {0,1,1,0,0,1}},
  {'!', {0,1,1,0,1,0}},
  {';', {0,1,1,0,0,0}},
  {':', {0,1,0,0,1,0}},
  {'-', {0,0,1,0,0,1}},
  {'\'', {0,0,1,0,0,0}},
  {'"', {0,1,1,0,0,1}},
  {'/', {0,0,1,1,0,0}},
  {'@', {0,0,0,1,0,0}},
  {'#', {0,0,1,1,1,1}},
  {'+', {0,1,1,0,1,0}},
  {'=', {0,1,1,0,1,1}},
  {'*', {0,0,1,0,1,0}},
  {'(', {0,1,1,0,1,1}},
  {')', {0,1,1,0,1,1}}
};

const int symbolCount = sizeof(symbolMap) / sizeof(symbolMap[0]);

void setup() {
  Serial.begin(9600);
  BLE.begin(9600); // Default HM-10 baud rate
  
  // Prepare to properly target each pin in the loop
  for(int i = 0; i < 6; i++){
    pinMode(motorPins[i], OUTPUT);
    digitalWrite(motorPins[i], LOW);
  }
  Serial.println("Glove is ready. Waiting for Bluetooth...");
}

void turnAllMotorsOff() {
  for (int i = 0; i < 6; i++) {
    digitalWrite(motorPins[i], LOW);
  }
}

void vibratePattern(const byte pattern[6], int pulses = 3) {
  bool hasDots = false;
  for (int i = 0; i < 6; i++) {
    if (pattern[i] == 1) {
      hasDots = true;
      break;
    }
  }

  // Treat a blank pattern as a readable pause for spaces.
  if (!hasDots) {
    turnAllMotorsOff();
    delay(350);
    return;
  }

  for (int pulse = 0; pulse < pulses; pulse++) {
    for (int i = 0; i < 6; i++) {
      if (pattern[i] == 1) {
        digitalWrite(motorPins[i], HIGH);
      }
    }

    delay(150); // Pulse duration (on)
    turnAllMotorsOff();
    delay(100); // Gap between pulses (off)
  }
}

bool findSymbolPattern(char character, byte pattern[6]) {
  for (int i = 0; i < symbolCount; i++) {
    if (symbolMap[i].character == character) {
      for (int dot = 0; dot < 6; dot++) {
        pattern[dot] = symbolMap[i].dots[dot];
      }
      return true;
    }
  }

  return false;
}

void loop() {
  if (BLE.available()) {
    char receivedChar = BLE.read();
    char normalizedChar = tolower(receivedChar); // Convert to lowercase
    
    if (normalizedChar >= 'a' && normalizedChar <= 'z') {
      int letterIndex = normalizedChar - 'a'; // Find index (0 for 'a', 25 for 'z')

      Serial.print("Vibrating for: ");
      Serial.println(receivedChar);
      vibratePattern(brailleMap[letterIndex]);
    } else if (receivedChar >= '0' && receivedChar <= '9') {
      int digitIndex = (receivedChar == '0') ? 9 : receivedChar - '1';

      Serial.print("Vibrating for number: ");
      Serial.println(receivedChar);

      vibratePattern(numberPrefix, 2);
      delay(250);
      vibratePattern(brailleMap[digitIndex]);
    } else {
      byte symbolPattern[6];
      if (findSymbolPattern(receivedChar, symbolPattern)) {
        Serial.print("Vibrating for symbol: ");
        Serial.println(receivedChar);
        vibratePattern(symbolPattern);
      } else {
        Serial.print("Unsupported character: ");
        Serial.println(receivedChar);
      }
    }
  }
}
