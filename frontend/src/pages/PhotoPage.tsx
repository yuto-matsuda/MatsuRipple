import { useRef, useState } from 'react';
import usePhotos from '../hooks/usePhotos';
import useGroups from '../hooks/useGroups';
import { PhotoGallery } from '../components/PhotoGallery';

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

export function PhotoPage() {
  const { photos, loading, uploading, error, upload } = usePhotos();
  const { groups } = useGroups();
  const isAuthenticated = !!localStorage.getItem('token');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const groupId = selectedGroupId !== '' ? selectedGroupId : undefined;
    await upload(selectedFile, isPublic, groupId);
    setShowUpload(false);
    setSelectedFile(null);
    setIsPublic(true);
    setSelectedGroupId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setShowUpload(false);
    setSelectedFile(null);
    setIsPublic(true);
    setSelectedGroupId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.04em', margin: 0 }}>
          写真ギャラリー
        </h1>
        {isAuthenticated && !showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            style={{ fontSize: '13px', fontWeight: 600, padding: '8px 18px', borderRadius: '8px', background: '#4e8b3f', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            写真をアップロード
          </button>
        )}
      </div>

      {/* アップロードフォーム */}
      {showUpload && (
        <div style={{ background: 'white', border: '1px solid #9ab88e', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(28,46,23,0.08)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '16px' }}>
            写真をアップロード
          </div>
          <form onSubmit={handleUpload}>
            {/* ファイル選択 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '6px' }}>ファイル *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: '#f4f7f0', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', color: '#4a6840', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  ファイルを選択
                </button>
                <span style={{ fontSize: '13px', color: selectedFile ? '#1c2e17' : '#7a9470', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile ? selectedFile.name : '選択されていません'}
                </span>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
              </div>
            </div>

            {/* 公開設定 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '8px' }}>公開設定</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17' }}>
                  <input type="radio" name="visibility" checked={isPublic} onChange={() => setIsPublic(true)} />
                  公開
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#1c2e17' }}>
                  <input type="radio" name="visibility" checked={!isPublic} onChange={() => setIsPublic(false)} />
                  非公開
                </label>
              </div>
            </div>

            {/* グループ共有 */}
            {groups.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '6px' }}>グループに共有（任意）</label>
                <select
                  style={{ ...inputStyle }}
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value !== '' ? Number(e.target.value) : '')}
                >
                  <option value=''>共有しない</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {selectedGroupId !== '' && (
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
                    グループメンバーのみがこの写真を閲覧できます
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                style={{ flex: 1, background: !selectedFile || uploading ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}
              >
                {uploading ? 'アップロード中...' : 'アップロードする'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>}
      {error && <div style={{ fontSize: '13px', color: '#c85a2c', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>{error}</div>}

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #c8d8be', boxShadow: '0 1px 6px rgba(28,46,23,0.08)' }}>
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
