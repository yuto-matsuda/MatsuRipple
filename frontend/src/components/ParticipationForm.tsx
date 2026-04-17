import { useState } from 'react';
import type { ParticipantCreate } from '../types/participant';

interface ParticipationFormProps {
  festivalId: number;
  onSubmit: (data: ParticipantCreate) => Promise<void>;
  submitting: boolean;
  success: boolean;
  error: string | null;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ festival_id: festivalId, name, email, message: message || undefined });
    if (success) {
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
        参加登録が完了しました！
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">お名前 *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 disabled:opacity-50 transition-colors font-medium"
      >
        {submitting ? '送信中...' : '参加登録する'}
      </button>
    </form>
  );
}
