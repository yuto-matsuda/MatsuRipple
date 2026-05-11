import { useState, useRef, useEffect, useCallback } from 'react';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ITEM_H = 40;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseDatetime(v: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (m) {
    return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: 12, minute: 0 };
}

function formatDatetime(y: number, mo: number, d: number, h: number, mi: number) {
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
}

function formatDisplay(v: string) {
  const { year, month, day, hour, minute } = parseDatetime(v);
  return `${year}年${month}月${day}日 ${pad(hour)}:${pad(minute)}`;
}

interface DrumColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function DrumColumn({ items, selectedIndex, onSelect }: DrumColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);

  useEffect(() => {
    if (ref.current && !scrolling.current) {
      ref.current.scrollTop = selectedIndex * ITEM_H;
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    scrolling.current = true;
    const el = ref.current;
    if (!el) return;
    clearTimeout((el as HTMLDivElement & { _t: ReturnType<typeof setTimeout> })._t);
    (el as HTMLDivElement & { _t: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      el.scrollTop = clamped * ITEM_H;
      onSelect(clamped);
      scrolling.current = false;
    }, 120);
  }, [items.length, onSelect]);

  const padItems = Array(PAD).fill('');
  const allItems = [...padItems, ...items, ...padItems];

  return (
    <div style={{ position: 'relative', width: '60px', height: `${ITEM_H * VISIBLE}px` }}>
      {/* center highlight */}
      <div style={{
        position: 'absolute', top: `${PAD * ITEM_H}px`, left: 0, right: 0,
        height: `${ITEM_H}px`, background: 'rgba(78,139,63,0.10)',
        borderTop: '1px solid #9ab88e', borderBottom: '1px solid #9ab88e',
        borderRadius: '6px', pointerEvents: 'none', zIndex: 1,
      }} />
      {/* top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: `${PAD * ITEM_H}px`,
        background: 'linear-gradient(to bottom, white 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: `${PAD * ITEM_H}px`,
        background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div
        ref={ref}
        className="drum-column"
        onScroll={handleScroll}
        style={{ height: `${ITEM_H * VISIBLE}px`, overflowY: 'scroll' }}
      >
        {allItems.map((item, i) => (
          <div
            key={i}
            className="drum-column-item"
            style={{
              height: `${ITEM_H}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontFamily: 'var(--font-body)',
              color: item === '' ? 'transparent' : '#1c2e17',
              fontWeight: i === selectedIndex + PAD ? 600 : 400,
              cursor: 'pointer',
            }}
            onClick={() => {
              if (item !== '') {
                const realIdx = i - PAD;
                if (realIdx >= 0 && realIdx < items.length) {
                  onSelect(realIdx);
                  if (ref.current) ref.current.scrollTop = realIdx * ITEM_H;
                }
              }
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalendarProps {
  year: number;
  month: number;
  day: number;
  onSelectDay: (day: number) => void;
  onChangeMonth: (year: number, month: number) => void;
}

function Calendar({ year, month, day, onSelectDay, onChangeMonth }: CalendarProps) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const today = new Date();

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 1) onChangeMonth(year - 1, 12);
    else onChangeMonth(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 12) onChangeMonth(year + 1, 1);
    else onChangeMonth(year, month + 1);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#4a6840', padding: '0 8px' }}>‹</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: '#1c2e17' }}>
          {year}年{month}月
        </span>
        <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#4a6840', padding: '0 8px' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: i === 0 ? '#c85a2c' : i === 6 ? '#4e8b3f' : '#7a9470', padding: '4px 0' }}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const isToday = d !== null && today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;
          const isSelected = d === day;
          return (
            <div
              key={i}
              onClick={() => d && onSelectDay(d)}
              style={{
                textAlign: 'center', fontSize: '13px', padding: '6px 2px',
                borderRadius: '6px', cursor: d ? 'pointer' : 'default',
                background: isSelected ? '#c85a2c' : isToday ? '#edf3e7' : 'transparent',
                color: d === null ? 'transparent' : isSelected ? 'white' : isToday ? '#4e8b3f' : '#1c2e17',
                fontWeight: isSelected || isToday ? 600 : 400,
                transition: 'background 0.15s',
              }}
            >
              {d ?? ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const parsed = parseDatetime(value);
  const [mode, setMode] = useState<'drum' | 'calendar'>('drum');
  const [calYear, setCalYear] = useState(parsed.year);
  const [calMonth, setCalMonth] = useState(parsed.month);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear + i));
  const months = MONTHS.map((_, i) => String(i + 1) + '月');
  const maxDay = daysInMonth(parsed.year, parsed.month);
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1) + '日');
  const hours = Array.from({ length: 24 }, (_, i) => pad(i));
  const minutes = Array.from({ length: 12 }, (_, i) => pad(i * 5));

  const update = (y: number, mo: number, d: number, h: number, mi: number) => {
    const safeDay = Math.min(d, daysInMonth(y, mo));
    onChange(formatDatetime(y, mo, safeDay, h, mi));
  };

  const minuteIndex = Math.round(parsed.minute / 5);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a6840', display: 'block' }}>{label}</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode('drum')}
            style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', border: '1px solid #c8d8be', background: mode === 'drum' ? '#4e8b3f' : 'white', color: mode === 'drum' ? 'white' : '#4a6840', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            ドラム
          </button>
          <button
            type="button"
            onClick={() => { setCalYear(parsed.year); setCalMonth(parsed.month); setMode('calendar'); }}
            style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', border: '1px solid #c8d8be', background: mode === 'calendar' ? '#4e8b3f' : 'white', color: mode === 'calendar' ? 'white' : '#4a6840', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            カレンダー
          </button>
        </div>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #c8d8be', borderRadius: '10px', padding: '12px', overflow: 'hidden' }}>
        {value && (
          <div style={{ fontSize: '13px', color: '#1c2e17', fontFamily: 'var(--font-body)', marginBottom: '10px', textAlign: 'center', fontWeight: 500 }}>
            {formatDisplay(value)}
          </div>
        )}

        {mode === 'drum' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <DrumColumn
              items={years}
              selectedIndex={Math.max(0, years.indexOf(String(parsed.year)))}
              onSelect={(i) => update(currentYear + i, parsed.month, parsed.day, parsed.hour, parsed.minute)}
            />
            <span style={{ color: '#7a9470', fontSize: '13px' }}>年</span>
            <DrumColumn
              items={months}
              selectedIndex={parsed.month - 1}
              onSelect={(i) => update(parsed.year, i + 1, parsed.day, parsed.hour, parsed.minute)}
            />
            <DrumColumn
              items={days}
              selectedIndex={Math.min(parsed.day - 1, days.length - 1)}
              onSelect={(i) => update(parsed.year, parsed.month, i + 1, parsed.hour, parsed.minute)}
            />
            <span style={{ color: '#7a9470', fontSize: '18px', fontWeight: 300, margin: '0 4px' }}>|</span>
            <DrumColumn
              items={hours}
              selectedIndex={parsed.hour}
              onSelect={(i) => update(parsed.year, parsed.month, parsed.day, i, parsed.minute)}
            />
            <span style={{ color: '#7a9470', fontSize: '13px' }}>:</span>
            <DrumColumn
              items={minutes}
              selectedIndex={Math.max(0, Math.min(minuteIndex, minutes.length - 1))}
              onSelect={(i) => update(parsed.year, parsed.month, parsed.day, parsed.hour, i * 5)}
            />
          </div>
        ) : (
          <div>
            <Calendar
              year={calYear}
              month={calMonth}
              day={parsed.day}
              onSelectDay={(d) => {
                update(calYear, calMonth, d, parsed.hour, parsed.minute);
              }}
              onChangeMonth={(y, m) => { setCalYear(y); setCalMonth(m); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8f0e3' }}>
              <span style={{ fontSize: '12px', color: '#7a9470' }}>時刻：</span>
              <DrumColumn
                items={hours}
                selectedIndex={parsed.hour}
                onSelect={(i) => update(parsed.year, parsed.month, parsed.day, i, parsed.minute)}
              />
              <span style={{ fontSize: '13px', color: '#7a9470' }}>:</span>
              <DrumColumn
                items={minutes}
                selectedIndex={Math.max(0, Math.min(minuteIndex, minutes.length - 1))}
                onSelect={(i) => update(parsed.year, parsed.month, parsed.day, parsed.hour, i * 5)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
