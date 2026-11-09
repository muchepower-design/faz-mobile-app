// src/components/HolderCard.jsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { API_BASE_URL } from '../api/client';

/**
 * Renders a ticket or accreditation card, whichever `holder` is.
 * `kind` is 'ticket' | 'accreditation'.
 */
export function HolderCard({ holder, kind }) {
  if (!holder) return null;
  return (
    <View className="bg-white p-5 rounded-2xl border border-slate-200">
      {kind === 'accreditation' ? (
        <AccreditationBody holder={holder} />
      ) : (
        <TicketBody holder={holder} />
      )}
    </View>
  );
}

function TicketBody({ holder }) {
  return (
    <>
      <Text className="text-xl font-extrabold text-slate-900">
        Match Ticket
      </Text>
      <Text className="text-brand-600 font-bold mt-1 break-all">
        {holder.short_code || holder.ticket_number}
      </Text>
      <View className="h-px bg-slate-200 my-4" />
      <Info label="Type" value={holder.ticket_type} />
      <Info label="Section" value={holder.section} />
      <Info label="Row" value={holder.row} />
      <Info label="Seat" value={holder.seat} />
      <Info label="Scanned" value={holder.is_used ? 'Yes' : 'No'} />
    </>
  );
}

function AccreditationBody({ holder }) {
  const photoUrl = holder.passport_photo_url
    ? toAbsolute(holder.passport_photo_url)
    : null;

  return (
    <>
      <View className="flex-row gap-3">
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            className="w-16 h-20 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-20 rounded-lg bg-slate-100 items-center justify-center">
            <Text className="text-2xl text-slate-400">👤</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-slate-900">
            {holder.full_name}
          </Text>
          <Text className="text-brand-600 font-bold mt-1">
            {holder.category_label || holder.category}
          </Text>
          {holder.service_provider_type_label ? (
            <Text className="text-slate-600 text-sm mt-1">
              {holder.service_provider_type_label}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="h-px bg-slate-200 my-4" />
      <Info label="Organization" value={holder.organization} />
      <Info label="Nationality" value={holder.nationality_name} />
      <Info label="Token" value={holder.qr_token} mono />
      <Info label="Checked in" value={holder.is_checked_in ? 'Yes' : 'No'} />
    </>
  );
}

function Info({ label, value, mono }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text
        className={`text-slate-900 font-semibold text-right flex-1 ml-3 text-sm ${
          mono ? 'font-mono' : ''
        }`}
        numberOfLines={2}
      >
        {value || '—'}
      </Text>
    </View>
  );
}

function toAbsolute(url) {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/api\/gate$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}