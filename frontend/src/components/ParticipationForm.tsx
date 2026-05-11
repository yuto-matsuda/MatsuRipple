import { useState } from 'react';
import type { ParticipantCreate } from '../types/participant';

interface ParticipationFormProps {
  festivalId: number;
  onSubmit: (data: ParticipantCreate) => Promise<void>;
  submitting: boolean;
  success: boolean;
  error: string | null;
}

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

export function ParticipationForm({
  festivalId,
  onSubmit,
  submitting,
  success,
  error,
}: ParticipationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await onSubmit({ festival_id: festivalId, name, email, message: message || undefined });
  };

  if (success) {
    return (
      <div style={{ background: '#edf3e7', border: '1px solid #9ab88e', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#2d5422', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
        ✓ 参加登録が完了しました！当日お会いしましょう。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>お名前 *</label>
        <input style={inputStyle} type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>メールアドレス *</label>
        <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>メッセージ</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && <div style={{ fontSize: '12px', color: '#c85a2c', marginBottom: '12px' }}>{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? '#9ab88e' : '#c85a2c',
          color: 'white', border: 'none', borderRadius: '8px',
          padding: '10px 24px', fontSize: '14px', fontWeight: 600,
          fontFamily: 'var(--font-body)', cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {submitting ? '送信中...' : '参加する'}
      </button>
    </form>
  );
}
