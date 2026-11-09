// src/screens/ScannerScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Alert,
  ActivityIndicator, Linking, StyleSheet, ScrollView,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { useScannerSync } from '../hooks/useScannerSync';
import { useAuthStore } from '../store/authStore';
import { verifyCredential } from '../services/verificationService';
import { HolderCard } from '../components/HolderCard';
import { extractCodes } from '../utils/code';
import { colors } from '../theme/colors';
import { useIsFocused } from '@react-navigation/native';
import { useScannerSync, setScannerActive } from '../hooks/useScannerSync';

const SCAN_COOLDOWN_MS = 4000;   // same code won't re-fire for 4s
const RESULT_LINGER_MS = 8000;   // result clears 8s after last scan — or on Dismiss

export function ScannerScreen() {
  useScannerSync();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const camera = useRef(null);
  const event = useAuthStore((s) => s.event);

  const [permission, setPermission] = useState('pending');
  const [busy, setBusy] = useState(false);
  const [processingMs, setProcessingMs] = useState(0);
  const [manual, setManual] = useState('');
  const [smsText, setSmsText] = useState('');
  const [smsOpen, setSmsOpen] = useState(false);
  const [result, setResult] = useState(null);

  // cooldown tracker per-code
  const lastCodeAt = useRef({});       // { [code]: ms epoch }
  const inFlight = useRef(false);
  const busyTimerRef = useRef(null);
  const resultTimerRef = useRef(null);

  useEffect(() => {
    Camera.requestCameraPermission().then((value) =>
      setPermission(value === 'granted' ? 'granted' : 'denied'),
    );
  }, []);

  // Live "processing time" clock
  useEffect(() => {
    if (!busy) {
      if (busyTimerRef.current) clearInterval(busyTimerRef.current);
      return;
    }
    const startedAt = Date.now();
    setProcessingMs(0);
    busyTimerRef.current = setInterval(() => {
      setProcessingMs(Date.now() - startedAt);
    }, 50);
    return () => {
      if (busyTimerRef.current) clearInterval(busyTimerRef.current);
    };
  }, [busy]);

  // Auto-clear the result card after RESULT_LINGER_MS (unless user dismisses sooner)
  useEffect(() => {
    if (!result) return;
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => setResult(null), RESULT_LINGER_MS);
    return () => {
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, [result]);

  const process = async (raw, method) => {
    if (!event) {
      Alert.alert('No match', 'Activate this device for a match first.');
      return;
    }
    const key = String(raw || '').trim();
    if (!key) return;

    // Cooldown — ignore repeat scans of the same code within 4s
    const now = Date.now();
    const last = lastCodeAt.current[key] || 0;
    if (now - last < SCAN_COOLDOWN_MS) return;
    lastCodeAt.current[key] = now;

    // Already processing another scan
    if (inFlight.current) return;
    
    // Set the lock IMMEDIATELY to stop Vision Camera from firing again
    inFlight.current = true;
    setBusy(true);
    setScannerActive(true);

    try {
      const v = await verifyCredential(key, method);
      setResult(v);
    } catch (e) {
      Alert.alert('Verification error', e.message || 'Unable to verify.');
    } finally {
      setBusy(false);
      inFlight.current = false;
      setScannerActive(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128', 'code-39', 'ean-13', 'ean-8', 'pdf-417'],
    onCodeScanned: (codes) => {
      // Instantly bail out if we are already processing a scan
      if (inFlight.current) return;
      
      const value = codes?.[0]?.value;
      if (value) process(value, 'qr');
    },
  });

  const captureText = async () => {
    if (!camera.current || busy || inFlight.current) return;
    setBusy(true);
    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      const recognized = await TextRecognition.recognize(photo.path);
      const candidates = extractCodes(recognized.text || '');
      if (!candidates.length) {
        Alert.alert('No code found', 'Move closer or improve the lighting.');
      } else if (candidates.length === 1) {
        await process(candidates[0], 'ocr');
      } else {
        Alert.alert(
          'Choose a code',
          candidates.slice(0, 5).join('\n'),
          candidates.slice(0, 5).map((c) => ({
            text: c, onPress: () => process(c, 'ocr'),
          })),
        );
      }
    } catch (e) {
      Alert.alert('Text recognition failed', e.message || 'Could not read.');
    } finally {
      setBusy(false);
    }
  };

  const submitSms = async () => {
    const candidates = extractCodes(smsText);
    if (!candidates.length) {
      Alert.alert('No code found', 'Paste the full SMS so we can find the ticket number.');
      return;
    }
    setSmsOpen(false);
    setSmsText('');
    await process(candidates[0], 'sms');
  };

  if (permission === 'pending') {
    return (
      <Center>
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-slate-600">Requesting camera access…</Text>
      </Center>
    );
  }
  if (permission === 'denied') {
    return (
      <Center>
        <Text className="text-xl font-extrabold text-slate-900 text-center">
          Camera permission required
        </Text>
        <Text className="text-slate-600 text-center mt-2">
          Allow camera access in your device settings to scan tickets and cards.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          className="mt-5 rounded-xl bg-brand-500 px-5 py-3"
        >
          <Text className="font-bold text-white">Open settings</Text>
        </TouchableOpacity>
      </Center>
    );
  }
  if (!device) {
    return (
      <Center>
        <Text className="text-slate-700">Camera not available on this device.</Text>
      </Center>
    );
  }

  const m = result?.match;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-3">
          <Text className="text-2xl font-extrabold text-slate-900">Verify entry</Text>
          <Text className="text-slate-500 mt-1">
            Scan a QR code, read printed text, or paste an SMS.
          </Text>
        </View>

        <View className="mx-4 h-[280px] overflow-hidden rounded-2xl bg-black relative">
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isFocused}
            photo={true}
            codeScanner={codeScanner}
          />
          <View pointerEvents="none" style={styles.scanFrame} />
          <View className="absolute bottom-3 self-center rounded-full bg-black/70 px-3 py-2">
            <Text className="text-white text-xs font-bold">ALIGN QR CODE WITHIN FRAME</Text>
          </View>

          {/* Live "Processing… Xms" overlay while busy */}
          {busy && (
            <View style={styles.processingBadge}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.processingText}>
                Processing… {processingMs} ms
              </Text>
            </View>
          )}
        </View>

        <View className="px-4 pt-3 gap-2">
          <TouchableOpacity
            onPress={captureText}
            disabled={busy}
            className="items-center rounded-xl bg-brand-900 p-4"
          >
            <Text className="font-bold text-white">
              {busy ? 'Processing…' : 'Read printed text'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSmsOpen((v) => !v)}
            className="items-center rounded-xl border border-slate-300 p-4 bg-white"
          >
            <Text className="font-bold text-slate-700">
              {smsOpen ? 'Close SMS input' : 'Paste SMS'}
            </Text>
          </TouchableOpacity>
        </View>

        {smsOpen && (
          <View className="mx-4 mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <Text className="text-xs font-bold text-slate-500 mb-2">
              PASTE THE FULL SMS — WE'LL FIND THE TICKET NUMBER
            </Text>
            <TextInput
              value={smsText}
              onChangeText={setSmsText}
              multiline
              placeholder={'Dear customer, your ticket FAZ-TICKET:...\nPaste the whole message here.'}
              className="min-h-[90px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800"
            />
            <TouchableOpacity
              onPress={submitSms}
              className="mt-2 items-center rounded-lg bg-brand-500 p-3"
            >
              <Text className="font-bold text-white">Verify from SMS</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row gap-2 p-4">
          <TextInput
            value={manual}
            onChangeText={setManual}
            placeholder="Ticket number or accreditation token"
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
          />
          <TouchableOpacity
            onPress={() => { process(manual, 'manual'); setManual(''); }}
            className="justify-center rounded-xl bg-brand-500 px-5"
          >
            <Text className="font-bold text-white">Check</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View className="gap-3 px-4 pb-5">
            {/* Match header */}
            {m && (
              <View style={styles.matchHeader}>
                <Text style={styles.matchTeams}>
                  {m.home} <Text style={styles.matchVs}>vs</Text> {m.away}
                </Text>
                {(m.venue || m.competition) && (
                  <Text style={styles.matchMeta}>
                    {[m.venue, m.competition].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
            )}

            {/* Verdict bar with timing */}
            <View style={styles.verdictRow}>
              <Text style={result.ok ? styles.verdictOk : styles.verdictBad}>
                {result.ok ? '✓ CHECK-IN RECORDED' : `✗ ${result.reason}`}
              </Text>
              <Text style={styles.elapsed}>
                {result.elapsedMs != null ? `${result.elapsedMs} ms` : ''}
              </Text>
            </View>

            {result.holder ? (
              <HolderCard holder={result.holder} kind={result.kind} />
            ) : null}

            <TouchableOpacity
              onPress={() => setResult(null)}
              className="self-end p-2"
            >
              <Text className="font-bold text-brand-600">Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Center({ children }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas p-6">{children}</View>
  );
}

const styles = StyleSheet.create({
  scanFrame: {
    position: 'absolute',
    width: 230,
    height: 180,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 18,
    alignSelf: 'center',
    top: 42,
  },
  processingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  processingText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  matchHeader: {
    backgroundColor: colors.navy,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  matchTeams: { color: '#fff', fontWeight: '900', fontSize: 16 },
  matchVs: { color: '#A9C1FF', fontWeight: '700', fontSize: 13 },
  matchMeta: { color: '#D4DDF1', fontSize: 11, marginTop: 4 },
  verdictRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verdictOk: { color: '#15803d', fontWeight: '800', flex: 1 },
  verdictBad: { color: '#b91c1c', fontWeight: '800', flex: 1 },
  elapsed: { color: colors.muted, fontSize: 11, fontFamily: 'monospace' },
});