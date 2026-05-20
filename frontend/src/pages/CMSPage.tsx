import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { createFestival, updateFestival } from '../api/festivals';
import { uploadFestivalGalleryPhoto } from '../api/festivalGallery';
import { lookupPostalCode, geocodeAddress } from '../api/geocoding';
import { DateTimePicker } from '../components/DateTimePicker';
import type { FestivalCreate } from '../types/festival';

const MAX_PHOTOS = 10;

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #c8d8be',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1c2e17',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#4a6840',
  marginBottom: '5px',
};

const sectionStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #c8d8be',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: '0 1px 4px rgba(28,46,23,0.06)',
};

function MapPinUpdater({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (pos && (!prevPos.current || prevPos.current[0] !== pos[0] || prevPos.current[1] !== pos[1])) {
      map.setView(pos, Math.max(map.getZoom(), 13));
      prevPos.current = pos;
    }
  }, [pos, map]);
  return null;
}

function defaultDatetime() {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
  return now.toISOString().slice(0, 16);
}

export function CMSPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FestivalCreate>({
    name: '',
    start_datetime: defaultDatetime(),
    end_datetime: defaultDatetime(),
  });
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [postalLoading, setPostalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - photoFiles.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const handlePhotoRemove = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    setThumbnailIndex((prev) => {
      if (idx < prev) return prev - 1;
      if (idx === prev) return 0;
      return prev;
    });
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push('イベント名を入力してください。');
    if (!form.start_datetime) errs.push('開始日時を設定してください。');
    if (!form.end_datetime) errs.push('終了日時を設定してください。');
    if (form.start_datetime && form.end_datetime && form.start_datetime >= form.end_datetime) {
      errs.push('終了日時は開始日時より後に設定してください。');
    }
    return errs;
  };

  const handlePostalLookup = async () => {
    const clean = postalCode.replace(/-/g, '');
    if (clean.length !== 7) return;
    setPostalLoading(true);
    try {
      const result = await lookupPostalCode(clean);
      if (!result) { setPostalLoading(false); return; }
      setForm((prev) => ({ ...prev, venue: result.address }));
      const geo = await geocodeAddress(result.address);
      if (geo) {
        setPinPos([geo.lat, geo.lng]);
        setForm((prev) => ({ ...prev, location_lat: geo.lat, location_lng: geo.lng }));
      }
    } finally {
      setPostalLoading(false);
    }
  };

  const handleVenueChange = async (venue: string) => {
    setForm((prev) => ({ ...prev, venue }));
    if (venue.length > 4) {
      const geo = await geocodeAddress(venue);
      if (geo) {
        setPinPos([geo.lat, geo.lng]);
        setForm((prev) => ({ ...prev, location_lat: geo.lat, location_lng: geo.lng }));
      }
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    try {
      setSubmitStatus('祭り情報を投稿中...');
      const festival = await createFestival(form);

      if (photoFiles.length > 0) {
        setSubmitStatus(`写真をアップロード中... (0/${photoFiles.length})`);
        const uploaded = [];
        for (let i = 0; i < photoFiles.length; i++) {
          const photo = await uploadFestivalGalleryPhoto(photoFiles[i], festival.id, i);
          uploaded.push(photo);
          setSubmitStatus(`写真をアップロード中... (${i + 1}/${photoFiles.length})`);
        }
        const thumbnailUrl = uploaded[thumbnailIndex]?.filename ?? uploaded[0]?.filename;
        if (thumbnailUrl) {
          await updateFestival(festival.id, { ...form, thumbnail_url: thumbnailUrl });
        }
      }

      navigate(`/festivals/${festival.id}`);
    } catch {
      setErrors(['投稿に失敗しました。ログインしているか確認してください。']);
    } finally {
      setSubmitting(false);
      setSubmitStatus('');
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', marginBottom: '24px', letterSpacing: '0.04em' }}>
        祭り情報を投稿
      </h1>

      {errors.length > 0 && (
        <div style={{ background: '#fff3ef', border: '1px solid #e8a080', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#a84420', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
            入力内容を確認してください
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {errors.map((err, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#c85a2c', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* イベント名 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>イベント名 *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="例：浅草三社祭"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {/* 開催日時 */}
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '16px' }}>
            開催日時
          </div>
          <div style={{ marginBottom: '20px' }}>
            <DateTimePicker
              label="開始日時 *"
              value={form.start_datetime ?? ''}
              onChange={(v) => setForm((prev) => ({ ...prev, start_datetime: v }))}
            />
          </div>
          <DateTimePicker
            label="終了日時 *"
            value={form.end_datetime ?? ''}
            onChange={(v) => setForm((prev) => ({ ...prev, end_datetime: v }))}
          />
        </div>

        {/* 開催場所 */}
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '14px' }}>
            開催場所
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>郵便番号（自動補完）</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="123-4567"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePostalLookup(); } }}
                maxLength={8}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={handlePostalLookup}
                disabled={postalLoading}
                style={{ padding: '9px 14px', background: postalLoading ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: postalLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
              >
                {postalLoading ? '検索中...' : '住所を検索'}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>住所・会場名</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="東京都台東区浅草2丁目3-1"
              value={form.venue ?? ''}
              onChange={(e) => handleVenueChange(e.target.value)}
            />
          </div>
          {/* Map preview */}
          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #c8d8be', height: '220px' }}>
            <MapContainer
              center={pinPos ?? [36.2048, 138.2529]}
              zoom={pinPos ? 14 : 5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPinUpdater pos={pinPos} />
              {pinPos && <Marker position={pinPos} />}
            </MapContainer>
          </div>
          {pinPos && (
            <p style={{ fontSize: '11px', color: '#7a9470', marginTop: '6px', fontFamily: 'var(--font-body)' }}>
              緯度: {pinPos[0].toFixed(5)} / 経度: {pinPos[1].toFixed(5)}
            </p>
          )}
        </div>

        {/* 説明文 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>説明文</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
            placeholder="祭りの説明や見どころを入力..."
            value={form.description ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* トピック写真 */}
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '14px' }}>
            トピック写真
            <span style={{ fontSize: '11px', fontWeight: 400, color: '#7a9470', marginLeft: '8px' }}>最大{MAX_PHOTOS}枚・最初に選択した写真がサムネイルになります</span>
          </div>

          {/* プレビューグリッド */}
          {photoPreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {photoPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${i === thumbnailIndex ? '#c85a2c' : '#c8d8be'}`, aspectRatio: '1' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {/* サムネイルバッジ */}
                  {i === thumbnailIndex && (
                    <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#c85a2c', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-body)' }}>
                      サムネイル
                    </div>
                  )}
                  {/* サムネイル選択ボタン */}
                  {i !== thumbnailIndex && (
                    <button
                      type="button"
                      onClick={() => setThumbnailIndex(i)}
                      style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '9px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      サムネイルに設定
                    </button>
                  )}
                  {/* 削除ボタン */}
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(i)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '13px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 追加ボタン */}
          {photoFiles.length < MAX_PHOTOS && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '1.5px dashed #9ab88e', color: '#4a6840', cursor: 'pointer', fontFamily: 'var(--font-body)', background: '#f8fbf5' }}>
              ＋ 写真を追加（{photoFiles.length}/{MAX_PHOTOS}）
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            background: submitting ? '#9ab88e' : '#c85a2c',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '13px', fontSize: '15px', fontWeight: 600,
            fontFamily: 'var(--font-display)', cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', letterSpacing: '0.04em',
          }}
        >
          {submitting ? (submitStatus || '投稿中...') : '投稿する'}
        </button>
      </form>
    </div>
  );
}
