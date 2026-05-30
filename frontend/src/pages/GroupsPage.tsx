import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import useGroups from '../hooks/useGroups';
import useInvitations from '../hooks/useInvitations';

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

export function GroupsPage() {
  const navigate = useNavigate();
  const { groups, loading, create } = useGroups();
  const { invitations, accept, reject } = useInvitations();

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [locationInputs, setLocationInputs] = useState<string[]>(['']);
  const [creating, setCreating] = useState(false);

  const handleAddLocation = () => setLocationInputs((prev) => [...prev, '']);
  const handleRemoveLocation = (i: number) =>
    setLocationInputs((prev) => prev.filter((_, idx) => idx !== i));
  const handleLocationChange = (i: number, val: string) =>
    setLocationInputs((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setCreating(true);
    const locations = locationInputs
      .map((name, order) => ({ name: name.trim(), order }))
      .filter((l) => l.name);
    const group = await create({ name: groupName.trim(), description: groupDesc.trim() || undefined, locations });
    setCreating(false);
    if (group) {
      setShowCreate(false);
      setGroupName('');
      setGroupDesc('');
      setLocationInputs(['']);
      navigate(`/groups/${group.id}`);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1c2e17', letterSpacing: '0.04em', margin: 0 }}>
          グループ
        </h1>
        <button type="button" onClick={() => setShowCreate((v) => !v)} style={{ fontSize: '12px', color: '#fff', background: '#4e8b3f', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={13} />
          新しいグループ
        </button>
      </div>

      {/* グループ作成フォーム */}
      {showCreate && (
        <div style={{ ...sectionCard, borderColor: '#9ab88e' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: '#1c2e17', marginBottom: '16px' }}>
            グループを作成
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>グループ名 *</label>
              <input style={inputStyle} type="text" required value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="例：京都・大阪の旅" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '5px' }}>説明</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="旅行の概要など..."
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#4a6840', marginBottom: '8px' }}>旅行場所</label>
              {locationInputs.map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="text"
                    value={val}
                    onChange={(e) => handleLocationChange(i, e.target.value)}
                    placeholder={`例：${i === 0 ? '広島' : '東京'}`}
                  />
                  {locationInputs.length > 1 && (
                    <button type="button" onClick={() => handleRemoveLocation(i)} style={{ background: 'none', border: '1.5px solid #e8a080', borderRadius: '8px', color: '#c85a2c', padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddLocation} style={{ fontSize: '12px', color: '#4a6840', background: 'none', border: '1.5px dashed #9ab88e', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={13} /> 場所を追加
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'white', color: '#4a6840', border: '1.5px solid #c8d8be', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                キャンセル
              </button>
              <button type="submit" disabled={creating} style={{ flex: 1, background: creating ? '#9ab88e' : '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                {creating ? '作成中...' : '作成する'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 招待一覧 */}
      {invitations.length > 0 && (
        <div style={sectionCard}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '12px' }}>
            招待 ({invitations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invitations.map((inv) => (
              <div key={inv.id} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '12px 14px', border: '1px solid #c8d8be', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c2e17', fontFamily: 'var(--font-body)' }}>{inv.group_name}</div>
                  <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>{inv.inviter_username} さんから</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => reject(inv.id)} style={{ background: 'white', color: '#c85a2c', border: '1.5px solid #c85a2c', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>拒否</button>
                  <button onClick={() => accept(inv.id)} style={{ background: '#4e8b3f', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>参加する</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* グループ一覧 */}
      <div style={sectionCard}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '12px' }}>
          参加中のグループ
        </div>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
        ) : groups.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#7a9470', textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-body)' }}>
            まだグループがありません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                style={{ background: '#f4f7f0', border: '1px solid #c8d8be', borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,46,23,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17', marginBottom: '3px' }}>{g.name}</div>
                {g.description && <div style={{ fontSize: '12px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>{g.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
