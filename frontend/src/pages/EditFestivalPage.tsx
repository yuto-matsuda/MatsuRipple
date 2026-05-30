import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFestival, updateFestival } from '../api/festivals';
import { fetchFestivalGallery, uploadFestivalGalleryPhoto, deleteFestivalGalleryPhoto } from '../api/festivalGallery';
import { lookupPostalCode, geocodeAddress } from '../api/geocoding';
import { DateTimePicker } from '../components/DateTimePicker';
import type { FestivalCreate } from '../types/festival';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';

const MAX_PHOTOS = 10;

type ThumbnailRef =
  | { kind: 'existing'; photoId: number }
  | { kind: 'new'; newIndex: number };

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

export function EditFestivalPage() {
  const { id } = useParams<{ id: string }>();
  const festivalId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FestivalCreate>({ name: '', start_datetime: '', end_datetime: '' });
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [postalLoading, setPostalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const [existingPhotos, setExistingPhotos] = useState<FestivalGalleryPhoto[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<number>>(new Set());
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<ThumbnailRef>({ kind: 'new', newIndex: 0 });

  useEffect(() => {
    Promise.all([fetchFestival(festivalId), fetchFestivalGallery(festivalId)])
      .then(([festival, gallery]) => {
        setForm({
          name: festival.name,
          description: festival.description ?? undefined,
          region: festival.region ?? undefined,
          location_lat: festival.location_lat ?? undefined,
          location_lng: festival.location_lng ?? undefined,
          start_datetime: festival.start_datetime ?? undefined,
          end_datetime: festival.end_datetime ?? undefined,
          venue: festival.venue ?? undefined,
          thumbnail_url: festival.thumbnail_url ?? undefined,
        });
        if (festival.location_lat && festival.location_lng) {
          setPinPos([festival.location_lat, festival.location_lng]);
        }
        setExistingPhotos(gallery);
        if (gallery.length > 0) {
          const thumbPhoto = gallery.find((p) => p.filename === festival.thumbnail_url) ?? gallery[0];
          setThumbnail({ kind: 'existing', photoId: thumbPhoto.id });
        }
      })
      .finally(() => setLoading(false));
  }, [festivalId]);

  const displayedExisting = existingPhotos.filter((p) => !deletedPhotoIds.has(p.id));
  const totalPhotos = displayedExisting.length + newPhotoFiles.length;
  const remainingSlots = MAX_PHOTOS - totalPhotos;

  const handleExistingPhotoRemove = (photoId: number) => {
    setDeletedPhotoIds((prev) => new Set([...prev, photoId]));
    setThumbnail((prev) => {
      if (prev.kind === 'existing' && prev.photoId === photoId) {
        const remaining = existingPhotos.filter((p) => !deletedPhotoIds.has(p.id) && p.id !== photoId);
        if (remaining.length > 0) return { kind: 'existing', photoId: remaining[0].id };
        if (newPhotoFiles.length > 0) return { kind: 'new', newIndex: 0 };
        return { kind: 'new', newIndex: 0 };
      }
      return prev;
    });
  };

  const handleNewPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (remainingSlots <= 0) return;
    const toAdd = files.slice(0, remainingSlots);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setNewPhotoFiles((prev) => [...prev, ...toAdd]);
    setNewPhotoPreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleNewPhotoRemove = (idx: number) => {
    URL.revokeObjectURL(newPhotoPreviews[idx]);
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    setThumbnail((prev) => {
      if (prev.kind !== 'new') return prev;
      if (idx < prev.newIndex) return { kind: 'new', newIndex: prev.newIndex - 1 };
      if (idx === prev.newIndex) {
        if (displayedExisting.length > 0) return { kind: 'existing', photoId: displayedExisting[0].id };
        if (newPhotoFiles.length > 1) return { kind: 'new', newIndex: 0 };
        return { kind: 'new', newIndex: 0 };
      }
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
      if (deletedPhotoIds.size > 0) {
        setSubmitStatus('写真を削除中...');
        for (const photoId of deletedPhotoIds) {
          await deleteFestivalGalleryPhoto(photoId);
        }
      }

      const uploaded: FestivalGalleryPhoto[] = [];
      if (newPhotoFiles.length > 0) {
        setSubmitStatus(`写真をアップロード中... (0/${newPhotoFiles.length})`);
        for (let i = 0; i < newPhotoFiles.length; i++) {
          const photo = await uploadFestivalGalleryPhoto(newPhotoFiles[i], festivalId, displayedExisting.length + i);
          uploaded.push(photo);
          setSubmitStatus(`写真をアップロード中... (${i + 1}/${newPhotoFiles.length})`);
        }
      }

      let thumbnailUrl: string | undefined;
      if (thumbnail.kind === 'existing') {
        const photo = displayedExisting.find((p) => p.id === thumbnail.photoId);
        thumbnailUrl = photo?.filename ?? displayedExisting[0]?.filename ?? uploaded[0]?.filename;
      } else {
        thumbnailUrl = uploaded[thumbnail.newIndex]?.filename ?? uploaded[0]?.filename ?? displayedExisting[0]?.filename;
      }

      setSubmitStatus('祭り情報を更新中...');
      await updateFestival(festivalId, { ...form, thumbnail_url: thumbnailUrl });
      navigate(`/festivals/${festivalId}`);
    } catch {
      setErrors(['更新に失敗しました。ログインしているか確認してください。']);
    } finally {
      setSubmitting(false);
      setSubmitStatus('');
    }
  };

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
      読み込み中...
    </div>
  );

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', marginBottom: '24px', letterSpacing: '0.04em' }}>
        祭り情報を編集
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
          <div className="flex flex-col gap-2 mb-3 md:flex-row">
            <div className="md:flex-1">
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
            <div className="flex md:items-end">
              <button
                type="button"
                onClick={handlePostalLookup}
                disabled={postalLoading}
                className="w-full md:w-auto"
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
            <span style={{ fontSize: '11px', fontWeight: 400, color: '#7a9470', marginLeft: '8px' }}>最大{MAX_PHOTOS}枚</span>
          </div>

          {(displayedExisting.length > 0 || newPhotoPreviews.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {displayedExisting.map((photo) => {
                const isThumbnail = thumbnail.kind === 'existing' && thumbnail.photoId === photo.id;
                return (
                  <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${isThumbnail ? '#c85a2c' : '#c8d8be'}`, aspectRatio: '1' }}>
                    <img src={photo.filename} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {isThumbnail ? (
                      <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#c85a2c', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-body)' }}>
                        サムネイル
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setThumbnail({ kind: 'existing', photoId: photo.id })}
                        style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '9px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        サムネイルに設定
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleExistingPhotoRemove(photo.id)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              {newPhotoPreviews.map((src, i) => {
                const isThumbnail = thumbnail.kind === 'new' && thumbnail.newIndex === i;
                return (
                  <div key={`new-${i}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${isThumbnail ? '#c85a2c' : '#c8d8be'}`, aspectRatio: '1' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {isThumbnail ? (
                      <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#c85a2c', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-body)' }}>
                        サムネイル
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setThumbnail({ kind: 'new', newIndex: i })}
                        style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '9px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        サムネイルに設定
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleNewPhotoRemove(i)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.45)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {remainingSlots > 0 && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '1.5px dashed #9ab88e', color: '#4a6840', cursor: 'pointer', fontFamily: 'var(--font-body)', background: '#f8fbf5' }}>
              <Plus size={14} /> 写真を追加（{totalPhotos}/{MAX_PHOTOS}）
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleNewPhotoSelect} />
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
          {submitting ? (submitStatus || '更新中...') : '更新する'}
        </button>
      </form>
    </div>
  );
}
