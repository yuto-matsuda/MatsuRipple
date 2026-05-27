import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupDetail from '../hooks/useGroupDetail';
import usePhotos from '../hooks/usePhotos';
import { fetchMe } from '../api/auth';
import { fetchFestivals } from '../api/festivals';
import { groupParticipate } from '../api/groups';
import type { UserResponse } from '../types/user';
import type { Festival } from '../types/festival';

const sectionCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #c8d8be',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '16px',
  boxShadow: '0 1px 6px rgba(28,46,23,0.08)',
};

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

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);
  const { group, loading, error, update, leave, invite, addFestival, removeFestival, reload } = useGroupDetail(groupId);
  const { photos, uploading: photoUploading, upload: uploadPhoto, updateVisibility } = usePhotos(undefined, groupId);

  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  // 編集フォーム
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // 招待
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 退出
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // 祭りタグ
  const [allFestivals, setAllFestivals] = useState<Festival[]>([]);
  const [festivalSearch, setFestivalSearch] = useState('');
  const [showFestivalSearch, setShowFestivalSearch] = useState(false);
  const [festivalMessage, setFestivalMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // グループ参加申込
  const [participatingFestivalId, setParticipatingFestivalId] = useState<number | null>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [participating, setParticipating] = useState(false);
  const [participateResult, setParticipateResult] = useState<{ festivalId: number; count: number } | null>(null);

  // 写真アップロード
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoIsPublic, setPhotoIsPublic] = useState(true);
  const [photoFestivalId, setPhotoFestivalId] = useState<number | ''>('');

  const loadCurrentUser = () => {
    fetchMe().then(setCurrentUser).catch(() => setCurrentUser(null));
  };

  const loadAllFestivals = () => {
    fetchFestivals().then(setAllFestivals).catch(() => setAllFestivals([]));
  };

  useEffect(() => {
    loadCurrentUser();
    loadAllFestivals();
  }, []);

  useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditDesc(group.description ?? '');
    }
  }, [group]);

  const isCreator = currentUser !== null && group !== null && group.creator_id === currentUser.id;

  // 祭りタグ：既に追加済みでないものだけ候補に
  const taggedFestivalIds = new Set(group?.festivals.map((f) => f.festival_id) ?? []);
  const filteredFestivals = allFestivals.filter(
    (f) => !taggedFestivalIds.has(f.id) && f.name.includes(festivalSearch),
  );

  // ── ハンドラー ────────────────────────────────────────

  const handleEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    const ok = await update({ name: editName.trim(), description: editDesc.trim() || undefined });
    setSaving(false);
    if (ok) setShowEdit(false);
  };

  const handleInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviting(true);
    setInviteMessage(null);
    const result = await invite(inviteUsername.trim());
    setInviting(false);
    if (result.ok) {
      setInviteMessage({ ok: true, text: `${inviteUsername.trim()} さんに招待を送りました` });
      setInviteUsername('');
      reload();
    } else {
      setInviteMessage({ ok: false, text: result.message ?? '招待に失敗しました' });
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    const ok = await leave();
    setLeaving(false);
    if (ok) navigate('/groups');
  };

  const handleAddFestival = async (festivalId: number, festivalName: string) => {
    setFestivalMessage(null);
    const result = await addFestival(festivalId);
    if (result.ok) {
      setFestivalMessage({ ok: true, text: `「${festivalName}」を追加しました` });
      setFestivalSearch('');
      setShowFestivalSearch(false);
    } else {
      setFestivalMessage({ ok: false, text: result.message ?? '追加に失敗しました' });
    }
  };

  const handleRemoveFestival = async (festivalId: number) => {
    await removeFestival(festivalId);
    if (participatingFestivalId === festivalId) setParticipatingFestivalId(null);
  };

  const handleGroupParticipate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!participatingFestivalId) return;
    setParticipating(true);
    try {
      const result = await groupParticipate(groupId, participatingFestivalId, groupMessage || undefined);
      setParticipateResult({ festivalId: participatingFestivalId, count: result.registered });
      setParticipatingFestivalId(null);
      setGroupMessage('');
    } catch {
      // エラーは何もしない（UIで確認可能）
    } finally {
      setParticipating(false);
    }
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingPhotoFile(file);
      setShowPhotoUpload(true);
    }
  };

  const handlePhotoUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!pendingPhotoFile) return;
    const festivalId = photoFestivalId !== '' ? photoFestivalId : undefined;
    await uploadPhoto(pendingPhotoFile, photoIsPublic, undefined, festivalId);
    setPendingPhotoFile(null);
    setPhotoIsPublic(true);
    setPhotoFestivalId('');
    setShowPhotoUpload(false);
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const handlePhotoCancelUpload = () => {
    setPendingPhotoFile(null);
    setPhotoIsPublic(true);
    setPhotoFestivalId('');
    setShowPhotoUpload(false);
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  // ── ローディング / エラー ──────────────────────────────

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
        <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
        <div style={{ fontSize: '13px', color: '#c85a2c', fontFamily: 'var(--font-body)' }}>{error ?? 'グループが見つかりません'}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a9470', fontSize: '18px', padding: '0 4px', lineHeight: 1 }} aria-label="戻る">←</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.04em', margin: 0, flex: 1 }}>{group.name}</h1>
        {isCreator && (
          <button onClick={() => setShowEdit((v) => !v)} style={{ background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>編集</button>
        )}
      </div>

      {/* ── 編集フォーム ── */}
      {showEdit && (
        <div style={{ ...sectionCard, borderColor: '#9ab88e' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '14px' }}>グループを編集</div>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>グループ名 *</label>
              <input style={inputStyle} type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>説明</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '64px' }} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="旅行の概要など..." />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowEdit(false)} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
              <button type="submit" disabled={saving} style={{ flex: 1, background: saving ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>{saving ? '保存中...' : '保存する'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── 説明 ── */}
      {group.description && (
        <div style={sectionCard}>
          <div style={{ fontSize: '14px', color: '#4a6840', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{group.description}</div>
        </div>
      )}

      {/* ── 関連祭り ── */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17' }}>関連祭り</div>
          {isCreator && (
            <button onClick={() => { setShowFestivalSearch((v) => !v); setFestivalMessage(null); }} style={{ fontSize: '12px', color: '#4a6840', background: 'none', border: '1.5px dashed #9ab88e', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ＋ 祭りを追加
            </button>
          )}
        </div>

        {group.festivals.length === 0 && !showFestivalSearch && (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>まだ祭りが追加されていません</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: group.festivals.length > 0 ? '10px' : '0' }}>
          {group.festivals.map((ft) => (
            <div key={ft.id}>
              {/* 祭りチップ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff8f0', border: '1px solid #e8c0a0', borderRadius: '20px', padding: '5px 12px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17' }}>
                  🏮 {ft.festival_name}
                  {isCreator && (
                    <button onClick={() => handleRemoveFestival(ft.festival_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c85a2c', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
                  )}
                </div>
                {/* グループ参加ボタン（作成者のみ） */}
                {isCreator && participatingFestivalId !== ft.festival_id && (
                  <button
                    onClick={() => { setParticipatingFestivalId(ft.festival_id); setGroupMessage(''); setParticipateResult(null); }}
                    style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', background: '#fff8f0', border: '1.5px solid #e8c0a0', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  >
                    グループで参加申込
                  </button>
                )}
                {/* 申込完了バッジ */}
                {participateResult?.festivalId === ft.festival_id && (
                  <span style={{ fontSize: '11px', color: '#4e8b3f', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    ✓ {participateResult.count}名の申込が完了しました
                  </span>
                )}
              </div>

              {/* 参加申込フォーム */}
              {isCreator && participatingFestivalId === ft.festival_id && (
                <form onSubmit={handleGroupParticipate} style={{ marginTop: '10px', background: '#fff8f0', border: '1px solid #e8c0a0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
                    🏮 {ft.festival_name} にグループ全員で参加申込
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#7a9470', fontWeight: 400 }}>({group.members.length}名)</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>グループメッセージ（任意）</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                      value={groupMessage}
                      onChange={(e) => setGroupMessage(e.target.value)}
                      placeholder="例：みんなで楽しみましょう！"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setParticipatingFestivalId(null)}
                      style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={participating}
                      style={{ flex: 1, background: participating ? '#e8a080' : '#c85a2c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: participating ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      {participating ? '申込中...' : `${group.members.length}名で申込する`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>

        {showFestivalSearch && isCreator && (
          <div>
            <input
              style={{ ...inputStyle, marginBottom: '8px' }}
              type="text"
              placeholder="祭り名で検索..."
              value={festivalSearch}
              onChange={(e) => setFestivalSearch(e.target.value)}
              autoFocus
            />
            {filteredFestivals.length > 0 ? (
              <div style={{ border: '1px solid #c8d8be', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px', overflowY: 'auto' }}>
                {filteredFestivals.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleAddFestival(f.id, f.name)}
                    style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderBottom: '1px solid #e4eddf', padding: '10px 14px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f7f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    🏮 {f.name}
                    {f.region && <span style={{ fontSize: '11px', color: '#7a9470', marginLeft: '8px' }}>{f.region}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#7a9470', fontFamily: 'var(--font-body)', padding: '6px 0' }}>
                {festivalSearch ? '該当する祭りがありません' : '祭り名を入力してください'}
              </div>
            )}
          </div>
        )}
        {festivalMessage && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: festivalMessage.ok ? '#4e8b3f' : '#c85a2c', fontFamily: 'var(--font-body)' }}>{festivalMessage.text}</div>
        )}
      </div>

      {/* ── グループ写真 ── */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17' }}>グループ写真 ({photos.length})</div>
          <label
            style={{ fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '8px', background: photoUploading ? '#9ab88e' : '#4e8b3f', color: 'white', cursor: photoUploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
          >
            {photoUploading ? 'アップロード中...' : '＋ 写真を追加'}
            <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} disabled={photoUploading} onChange={handlePhotoFileSelect} />
          </label>
        </div>

        {/* アップロードオプションパネル */}
        {showPhotoUpload && pendingPhotoFile && (
          <form onSubmit={handlePhotoUpload} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #c8d8be' }}>
            <div style={{ fontSize: '13px', color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '12px', fontWeight: 500 }}>
              📎 {pendingPhotoFile.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>公開設定</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="photoVisibility" checked={photoIsPublic} onChange={() => setPhotoIsPublic(true)} /> 公開
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17', cursor: 'pointer' }}>
                  <input type="radio" name="photoVisibility" checked={!photoIsPublic} onChange={() => setPhotoIsPublic(false)} /> 非公開
                </label>
              </div>
            </div>
            {group.festivals.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>関連祭りに表示（任意）</label>
                <select style={inputStyle} value={photoFestivalId} onChange={(e) => setPhotoFestivalId(e.target.value !== '' ? Number(e.target.value) : '')}>
                  <option value=''>祭りに表示しない</option>
                  {group.festivals.map((ft) => (
                    <option key={ft.festival_id} value={ft.festival_id}>{ft.festival_name}</option>
                  ))}
                </select>
                {photoFestivalId !== '' && photoIsPublic && (
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
                    公開設定のため、祭り詳細ページの写真欄にも表示されます
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handlePhotoCancelUpload} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
              <button type="submit" style={{ flex: 1, background: '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>アップロード</button>
            </div>
          </form>
        )}

        {/* 写真グリッド（公開/非公開トグル付き） */}
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>写真はまだありません</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative', aspectRatio: '1' }}>
                <a href={photo.filename} target="_blank" rel="noopener noreferrer">
                  <img src={photo.filename} alt={photo.original_name ?? '写真'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #c8d8be', display: 'block' }} />
                </a>
                {/* 公開/非公開バッジ（自分の写真のみトグル可） */}
                {photo.user_id === currentUser?.id && (
                  <button
                    onClick={() => updateVisibility(photo.id, !photo.is_public)}
                    title={photo.is_public ? '非公開にする' : '公開にする'}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: photo.is_public ? 'rgba(78,139,63,0.85)' : 'rgba(100,100,100,0.75)', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', backdropFilter: 'blur(2px)' }}
                  >
                    {photo.is_public ? '公開' : '非公開'}
                  </button>
                )}
                {/* 自分のでない写真の公開状態表示 */}
                {photo.user_id !== currentUser?.id && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', background: photo.is_public ? 'rgba(78,139,63,0.75)' : 'rgba(100,100,100,0.65)', color: 'white', borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                    {photo.is_public ? '公開' : '非公開'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 旅行場所 ── */}
      {group.locations.length > 0 && (
        <div style={sectionCard}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '12px' }}>旅行場所</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {group.locations.slice().sort((a, b) => a.order - b.order).map((loc, i) => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f4f7f0', border: '1px solid #c8d8be', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17' }}>
                <span style={{ fontSize: '11px', color: '#7a9470', fontWeight: 600 }}>{i + 1}</span>{loc.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── メンバー ── */}
      <div style={sectionCard}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '12px' }}>メンバー ({group.members.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {group.members.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f4f7f0', borderRadius: '8px', border: '1px solid #e4eddf' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#9ab88e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#1c2e17', flexShrink: 0 }}>
                {m.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c2e17', fontFamily: 'var(--font-body)' }}>
                  {m.username}
                  {m.user_id === group.creator_id && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', background: '#4e8b3f', color: 'white', borderRadius: '4px', padding: '1px 6px', verticalAlign: 'middle' }}>作成者</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>{new Date(m.joined_at).toLocaleDateString('ja-JP')} 参加</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 招待フォーム（作成者のみ） ── */}
      {isCreator && (
        <div style={sectionCard}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '12px' }}>メンバーを招待</div>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...inputStyle, flex: 1 }} type="text" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="ユーザー名を入力" disabled={inviting} />
            <button type="submit" disabled={inviting || !inviteUsername.trim()} style={{ background: inviting ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: inviting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
              {inviting ? '送信中...' : '招待する'}
            </button>
          </form>
          {inviteMessage && (
            <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'var(--font-body)', color: inviteMessage.ok ? '#4e8b3f' : '#c85a2c' }}>{inviteMessage.text}</div>
          )}
        </div>
      )}

      {/* ── 退出（一般メンバーのみ） ── */}
      {!isCreator && currentUser !== null && (
        <div style={sectionCard}>
          {!showLeaveConfirm ? (
            <button onClick={() => setShowLeaveConfirm(true)} style={{ background: 'white', color: '#c85a2c', border: '1.5px solid #c85a2c', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              グループを退出
            </button>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>本当にこのグループを退出しますか？</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowLeaveConfirm(false)} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>キャンセル</button>
                <button onClick={handleLeave} disabled={leaving} style={{ flex: 1, background: leaving ? '#e8a080' : '#c85a2c', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: leaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                  {leaving ? '退出中...' : '退出する'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
