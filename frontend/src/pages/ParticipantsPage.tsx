import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { fetchFestival } from '../api/festivals';
import { fetchParticipants } from '../api/participants';
import type { Festival } from '../types/festival';
import type { Participant } from '../types/participant';

const sectionCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #d6e4ce',
  borderRadius: '14px',
  padding: '20px 24px',
  marginBottom: '14px',
  boxShadow: '0 2px 10px rgba(28,46,23,0.07)',
};

export function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const festivalId = Number(id);

  const [festival, setFestival] = useState<Festival | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchFestival(festivalId), fetchParticipants(festivalId)])
      .then(([fest, parts]) => {
        setFestival(fest);
        setParticipants(parts);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [festivalId]);

  // 個人とグループに分類
  const individual = participants.filter((p) => p.group_id === null);
  const groupMap = new Map<number, { name: string; members: Participant[] }>();
  for (const p of participants) {
    if (p.group_id !== null && p.group_name !== null) {
      if (!groupMap.has(p.group_id)) {
        groupMap.set(p.group_id, { name: p.group_name, members: [] });
      }
      groupMap.get(p.group_id)!.members.push(p);
    }
  }
  const groups = Array.from(groupMap.values());

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
        <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px', background: '#f4f7f0', minHeight: '100vh' }}>
        <div style={{ fontSize: '13px', color: '#c85a2c', fontFamily: 'var(--font-body)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px', background: '#f4f7f0', minHeight: '100vh' }}>

      {/* 戻るボタン */}
      <button
        onClick={() => navigate('/me')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a6840', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 500, padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <ChevronLeft size={16} /> マイページに戻る
      </button>

      {/* タイトル */}
      <div style={{ marginBottom: '24px' }}>
        {festival?.region && (
          <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, color: '#c85a2c', background: '#fff0e8', borderRadius: '4px', padding: '1px 7px', marginBottom: '6px' }}>
            {festival.region}
          </div>
        )}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#1c2e17', margin: '0 0 4px', letterSpacing: '0.04em' }}>
          {festival?.name}
        </h1>
        <div style={{ fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>参加者一覧</div>
      </div>

      {/* サマリーバッジ */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', border: '1px solid #d6e4ce', borderRadius: '10px', padding: '10px 18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(28,46,23,0.07)' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1c2e17', fontFamily: 'var(--font-display)' }}>{participants.length}</div>
          <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>合計</div>
        </div>
        <div style={{ background: 'white', border: '1px solid #d6e4ce', borderRadius: '10px', padding: '10px 18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(28,46,23,0.07)' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#4e8b3f', fontFamily: 'var(--font-display)' }}>{individual.length}</div>
          <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>個人</div>
        </div>
        <div style={{ background: 'white', border: '1px solid #d6e4ce', borderRadius: '10px', padding: '10px 18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(28,46,23,0.07)' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#c85a2c', fontFamily: 'var(--font-display)' }}>
            {participants.filter((p) => p.group_id !== null).length}
          </div>
          <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>グループ</div>
        </div>
      </div>

      {participants.length === 0 && (
        <div style={sectionCard}>
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
            まだ参加者がいません
          </div>
        </div>
      )}

      {/* 個人参加 */}
      {individual.length > 0 && (
        <div style={sectionCard}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#1c2e17', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            個人参加
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: '#4e8b3f', borderRadius: '10px', padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
              {individual.length}名
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {individual.map((p) => (
              <div key={p.id} style={{ background: '#f4f7f0', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e4eddf' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#1c2e17' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                    {new Date(p.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                {p.message && (
                  <div style={{ fontSize: '12px', color: '#4a6840', marginTop: '5px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {p.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* グループ参加 */}
      {groups.length > 0 && (
        <div style={sectionCard}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#1c2e17', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            グループ参加
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: '#c85a2c', borderRadius: '10px', padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
              {participants.filter((p) => p.group_id !== null).length}名
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map(({ name, members }) => (
              <div key={name} style={{ background: '#fff8f0', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e8c0a0' }}>
                {/* グループヘッダー */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#1c2e17' }}>
                    {name}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', background: '#fff0e8', border: '1px solid #e8c0a0', borderRadius: '8px', padding: '1px 8px', fontFamily: 'var(--font-body)' }}>
                    {members.length}名
                  </span>
                </div>
                {/* メンバーリスト */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {members.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'white', borderRadius: '8px', border: '1px solid #f0d0b0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c2e17', fontFamily: 'var(--font-body)' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
                        {new Date(m.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
                {/* グループメッセージ（最初の1件を代表として表示） */}
                {members[0]?.message && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#7a6050', fontFamily: 'var(--font-body)', lineHeight: 1.6, paddingLeft: '4px', borderLeft: '2px solid #e8c0a0' }}>
                    {members[0].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
