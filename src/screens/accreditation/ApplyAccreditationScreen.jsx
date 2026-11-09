// src/screens/accreditation/ApplyAccreditationScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { accreditationApi, SERVER_BASE_URL } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

const resolveImg = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function ApplyAccreditationScreen({ route, navigation }) {
  const editId = route.params?.editId;
  const user = useAuthStore((s) => s.user);
  const [types, setTypes] = useState({ categories: [], service_provider_types: [] });
  const [countries, setCountries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [form, setForm] = useState({
    match_id: '', category: '', service_provider_type: '',
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    nationality_country_id: '', phone: user?.phone || '', email: user?.email || '',
    id_number: '', organization: '', position_title: '', passport_photo_url: '',
  });

  useEffect(() => {
    Promise.all([
      accreditationApi.get('/accreditation/types').then((r) => r.data),
      accreditationApi.get('/countries').then((r) => r.data),
      accreditationApi.get('/accreditation/matches').then((r) => r.data),
    ]).then(([t, c, m]) => {
      setTypes(t || {});
      setCountries(c || []);
      setMatches(m || []);
    }).catch((e) => Alert.alert('Load failed', e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editId) return;
    accreditationApi.get(`/accreditation/my/${editId}`)
      .then((r) => {
        const a = r.data;
        setForm({
          match_id: a.match_id, category: a.category, service_provider_type: a.service_provider_type || '',
          full_name: a.full_name, nationality_country_id: a.nationality_country_id || '',
          phone: a.phone || '', email: a.email || '', id_number: a.id_number || '',
          organization: a.organization || '', position_title: a.position_title || '',
          passport_photo_url: a.passport_photo_url || '',
        });
      });
  }, [editId]);

  const isServiceProvider = form.category === 'service_provider';

  const pickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85 });
    const file = result.assets?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', { uri: file.uri, name: file.fileName || 'photo.jpg', type: file.type || 'image/jpeg' });
      const res = await accreditationApi.post('/accreditation/upload-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, passport_photo_url: res.data.url }));
    } catch (e) { Alert.alert('Upload failed', e.message); }
    finally { setPhotoUploading(false); }
  };

  const submit = async () => {
    if (!form.match_id) return Alert.alert('Choose a match');
    if (!form.category) return Alert.alert('Choose a category');
    if (isServiceProvider && !form.service_provider_type) return Alert.alert('Choose provider type');
    if (!form.passport_photo_url) return Alert.alert('Upload a passport photo');

    setSubmitting(true);
    try {
      if (editId) await accreditationApi.put(`/accreditation/my/${editId}`, form);
      else await accreditationApi.post('/accreditation/apply', form);
      Alert.alert('Submitted', editId ? 'Application updated.' : 'Application submitted for review.');
      navigation.goBack();
    } catch (e) { Alert.alert('Submission failed', e.response?.data?.error || e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Center><ActivityIndicator color={colors.primary} /></Center>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 8 }}>Match</Text>
        <PickerBox
          value={form.match_id}
          items={matches.map((m) => ({ value: m.id, label: `${m.home_team} vs ${m.away_team}` }))}
          onChange={(v) => setForm({ ...form, match_id: v })}
          placeholder="Choose a match"
        />
        <Text style={{ fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Category</Text>
        <PickerBox
          value={form.category}
          items={(types.categories || []).map((c) => ({ value: c.value, label: c.label }))}
          onChange={(v) => setForm({ ...form, category: v, service_provider_type: '' })}
          placeholder="Choose a category"
        />
        {isServiceProvider && (
          <>
            <Text style={{ fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Service Provider Type</Text>
            <PickerBox
              value={form.service_provider_type}
              items={(types.service_provider_types || []).map((t) => ({ value: t.value, label: t.label }))}
              onChange={(v) => setForm({ ...form, service_provider_type: v })}
              placeholder="Choose type"
            />
          </>
        )}
      </Card>

      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 8 }}>Your Details</Text>
        <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} keyboard="email-address" />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} keyboard="phone-pad" />
        <Field label="ID / NRC" value={form.id_number} onChange={(v) => setForm({ ...form, id_number: v })} />
        <Field label="Organization" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
        <Field label="Position / Title" value={form.position_title} onChange={(v) => setForm({ ...form, position_title: v })} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 10 }}>Passport Photo</Text>
        {form.passport_photo_url ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image source={{ uri: resolveImg(form.passport_photo_url) }} style={{ width: 88, height: 88, borderRadius: 10 }} />
            <View>
              <TouchableOpacity onPress={pickPhoto}><Text style={{ color: colors.primary, fontWeight: '800' }}>Change</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setForm({ ...form, passport_photo_url: '' })}><Text style={{ color: colors.danger, fontWeight: '800', marginTop: 4 }}>Remove</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={pickPhoto} disabled={photoUploading}
            style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 10, padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>{photoUploading ? 'Uploading…' : 'Tap to upload passport photo'}</Text>
          </TouchableOpacity>
        )}
      </Card>

      <TouchableOpacity onPress={submit} disabled={submitting}
        style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>{editId ? 'Update' : 'Submit Application'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Card({ children }) { return <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>{children}</View>; }
function Field({ label, value, onChange, keyboard = 'default' }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted, marginBottom: 4 }}>{label.toUpperCase()}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={keyboard}
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.ink }} />
    </View>
  );
}
function PickerBox({ value, items, onChange, placeholder }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
      {items.map((i) => {
        const active = i.value === value;
        return (
          <TouchableOpacity key={i.value} onPress={() => onChange(i.value)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 6,
              backgroundColor: active ? colors.primary : '#F1F5F9',
            }}>
            <Text style={{ color: active ? '#fff' : colors.ink, fontWeight: '700', fontSize: 12 }}>{i.label}</Text>
          </TouchableOpacity>
        );
      })}
      {!items.length && <Text style={{ color: colors.muted }}>{placeholder}</Text>}
    </ScrollView>
  );
}
function Center({ children }) { return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>; }