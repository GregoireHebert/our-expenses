// screens.jsx — ours. four screens
// Splash, Start, People, Expense

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const PALETTES = {
  coral: {
    bg: 'oklch(0.965 0.025 75)',
    surface: 'oklch(0.99 0.012 80)',
    ink: 'oklch(0.22 0.02 60)',
    inkSoft: 'oklch(0.45 0.03 60)',
    accent: 'oklch(0.7 0.18 35)',
    accentInk: 'oklch(0.22 0.05 35)',
    line: 'oklch(0.88 0.02 70)',
  },
  plum: {
    bg: 'oklch(0.96 0.025 320)',
    surface: 'oklch(0.99 0.012 320)',
    ink: 'oklch(0.22 0.03 320)',
    inkSoft: 'oklch(0.46 0.04 320)',
    accent: 'oklch(0.65 0.2 330)',
    accentInk: 'oklch(0.22 0.06 320)',
    line: 'oklch(0.88 0.025 320)',
  },
  sage: {
    bg: 'oklch(0.96 0.022 145)',
    surface: 'oklch(0.99 0.011 145)',
    ink: 'oklch(0.22 0.03 145)',
    inkSoft: 'oklch(0.46 0.035 145)',
    accent: 'oklch(0.66 0.16 155)',
    accentInk: 'oklch(0.22 0.06 145)',
    line: 'oklch(0.88 0.022 145)',
  },
};

// 6-color person palette — all share L≈0.86 / C≈0.08, hue varies
const PERSON_HUES = [35, 75, 145, 200, 280, 340];
const personColor = (i) => {
  const h = PERSON_HUES[i % PERSON_HUES.length];
  return {
    fill: `oklch(0.88 0.09 ${h})`,
    deep: `oklch(0.55 0.16 ${h})`,
    ink:  `oklch(0.28 0.08 ${h})`,
    soft: `oklch(0.95 0.04 ${h})`,
  };
};

// ─────────────────────────────────────────────────────────────
// Tiny shared bits
// ─────────────────────────────────────────────────────────────
function Avatar({ person, size = 44, idx = 0 }) {
  const c = personColor(idx);
  const initial = (person.name || '?').trim().charAt(0).toUpperCase();
  const r = (idx % 5 === 0) ? '50%' : `${size * 0.32}px`;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: c.fill, color: c.ink,
      display: 'grid', placeItems: 'center',
      fontFamily: "'Bricolage Grotesque', serif",
      fontWeight: 700, fontSize: size * 0.46,
      flex: 'none',
      boxShadow: `inset 0 -3px 0 0 ${c.deep}33`,
    }}>{initial}</div>
  );
}

function Chip({ children, color, style = {}, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', cursor: onClick ? 'pointer' : 'default',
      background: color.fill, color: color.ink,
      fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 14,
      padding: '8px 14px', borderRadius: 999,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: `inset 0 -2px 0 0 ${color.deep}33`,
      ...style,
    }}>{children}</button>
  );
}

function PrimaryButton({ children, onClick, accent, disabled = false, style = {} }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? 'oklch(0.85 0.01 60)' : accent,
      color: disabled ? 'oklch(0.55 0.01 60)' : '#fff',
      fontFamily: "'Bricolage Grotesque', serif",
      fontWeight: 600, fontSize: 18,
      padding: '18px 24px', borderRadius: 22,
      width: '100%',
      boxShadow: disabled ? 'none' : '0 6px 0 0 oklch(0.5 0.16 35), 0 12px 24px -8px oklch(0.5 0.16 35 / 0.35)',
      transition: 'transform 0.08s, box-shadow 0.08s',
      ...style,
    }}
    onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(3px)', e.currentTarget.style.boxShadow = '0 3px 0 0 oklch(0.5 0.16 35), 0 6px 14px -6px oklch(0.5 0.16 35 / 0.35)')}
    onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '')}
    onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '')}
    >{children}</button>
  );
}

function GhostButton({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      border: '2px solid currentColor',
      background: 'transparent',
      color: 'inherit',
      fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 15,
      padding: '12px 20px', borderRadius: 18,
      cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SPLASH — type-driven, animated chips
// ─────────────────────────────────────────────────────────────
function SplashScreen({ palette, onAuto }) {
  const p = palette;
  useEffect(() => {
    const t = setTimeout(() => onAuto && onAuto(), 2400);
    return () => clearTimeout(t);
  }, [onAuto]);

  // Floating chip data — name, x%, y%, rotation, delay, hue
  const chips = [
    { txt: 'pizza',     x: 8,  y: 14, r: -10, d: 0.0,  h: 35  },
    { txt: 'rent',      x: 62, y: 8,  r: 7,   d: 0.15, h: 200 },
    { txt: 'groceries', x: 5,  y: 70, r: 6,   d: 0.3,  h: 145 },
    { txt: 'beers 🍺',  x: 64, y: 78, r: -8,  d: 0.45, h: 75  },
    { txt: 'uber',      x: 70, y: 42, r: 12,  d: 0.6,  h: 280 },
    { txt: 'wifi',      x: 4,  y: 42, r: -6,  d: 0.75, h: 340 },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: `radial-gradient(circle at 50% 35%, ${p.surface}, ${p.bg})`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      paddingTop: 60, paddingBottom: 60,
    }}>
      <style>{`
        @keyframes ours-float {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(var(--r)); }
          60%  { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(var(--r)); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(var(--r)); }
        }
        @keyframes ours-bob {
          0%,100% { transform: translate(-50%, -50%) rotate(var(--r)) translateY(0); }
          50%     { transform: translate(-50%, -50%) rotate(var(--r)) translateY(-6px); }
        }
        @keyframes ours-word {
          0%   { opacity: 0; transform: translateY(20px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ours-dot {
          0%, 80%, 100% { transform: scale(1); }
          40%           { transform: scale(1.4); }
        }
      `}</style>

      {/* Floating chips */}
      {chips.map((c, i) => {
        const col = {
          fill: `oklch(0.88 0.09 ${c.h})`,
          deep: `oklch(0.55 0.16 ${c.h})`,
          ink:  `oklch(0.28 0.08 ${c.h})`,
        };
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${c.x + 8}%`, top: `${c.y + 8}%`,
            background: col.fill, color: col.ink,
            fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 14,
            padding: '8px 14px', borderRadius: 999,
            boxShadow: `inset 0 -2px 0 0 ${col.deep}33, 0 8px 18px -8px ${col.deep}66`,
            opacity: 0,
            '--r': `${c.r}deg`,
            animation: `ours-float 0.7s ${c.d}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, ours-bob 3s ${c.d + 0.7}s ease-in-out infinite`,
          }}>{c.txt}</div>
        );
      })}

      {/* Wordmark */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center',
        animation: 'ours-word 0.9s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
      }}>
        <div style={{
          fontFamily: "'Bricolage Grotesque', serif",
          fontSize: 92, lineHeight: 0.95, fontWeight: 800,
          color: p.ink, letterSpacing: '-0.04em',
          display: 'inline-flex', alignItems: 'baseline',
        }}>
          ours<span style={{
            display: 'inline-block', width: 16, height: 16,
            borderRadius: '50%', background: p.accent, marginLeft: 4,
            animation: 'ours-dot 1.6s 1.2s ease-in-out infinite',
            transformOrigin: 'center',
            alignSelf: 'flex-end', marginBottom: 12,
          }} />
        </div>
        <div style={{
          marginTop: 20,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: p.inkSoft,
        }}>
          fair splits · for couples & roommates
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. START — welcome / get started
// ─────────────────────────────────────────────────────────────
function StartScreen({ palette, onStart }) {
  const p = palette;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: p.bg,
      display: 'flex', flexDirection: 'column',
      padding: '70px 28px 40px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${p.accent}55, transparent 70%)`,
        filter: 'blur(8px)',
      }} />

      {/* Top wordmark mini */}
      <div style={{
        fontFamily: "'Bricolage Grotesque', serif",
        fontSize: 22, fontWeight: 800,
        color: p.ink, letterSpacing: '-0.03em',
        display: 'inline-flex', alignItems: 'baseline',
        marginBottom: 40,
      }}>
        ours<span style={{
          display: 'inline-block', width: 6, height: 6,
          borderRadius: '50%', background: p.accent, marginLeft: 2,
          alignSelf: 'flex-end', marginBottom: 4,
        }} />
      </div>

      {/* Hero illustration — overlapping pastel circles with names */}
      <div style={{
        position: 'relative', height: 200,
        marginBottom: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {[
          { name: 'Mo',  i: 0, x: -70, y: 0,   sz: 110, r: -8, w: '40%' },
          { name: 'Sky', i: 1, x: 30,  y: -10, sz: 130, r: 6,  w: '60%' },
        ].map((c) => {
          const col = personColor(c.i);
          return (
            <div key={c.name} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) rotate(${c.r}deg)`,
              width: c.sz, height: c.sz,
              borderRadius: '50%',
              background: col.fill, color: col.ink,
              display: 'grid', placeItems: 'center',
              fontFamily: "'Bricolage Grotesque', serif",
              fontWeight: 700, fontSize: 36,
              boxShadow: `inset 0 -6px 0 0 ${col.deep}33, 0 12px 24px -10px ${col.deep}66`,
            }}>
              <div style={{ textAlign: 'center', lineHeight: 1 }}>
                {c.name}
                <div style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11, marginTop: 6, opacity: 0.7,
                  letterSpacing: '0.05em',
                }}>{c.w}</div>
              </div>
            </div>
          );
        })}
        {/* connecting line / split */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: 64, height: 64, transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: p.surface,
          border: `3px dashed ${p.line}`,
          display: 'grid', placeItems: 'center',
          fontFamily: "'Bricolage Grotesque', serif",
          fontSize: 28, fontWeight: 800, color: p.ink,
          zIndex: 2,
        }}>÷</div>
      </div>

      {/* Big copy */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', serif",
          fontSize: 46, lineHeight: 1.0, fontWeight: 800,
          color: p.ink, letterSpacing: '-0.035em',
          margin: '0 0 18px', textWrap: 'balance',
        }}>
          Split bills the <em style={{
            fontStyle: 'italic',
            background: `linear-gradient(120deg, transparent 0 8%, ${p.accent}33 8% 92%, transparent 92%)`,
            padding: '0 4px',
          }}>fair</em> way.
        </h1>
        <p style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 17, lineHeight: 1.45, fontWeight: 400,
          color: p.inkSoft, margin: 0, maxWidth: 320,
        }}>
          Each person pays in proportion to what they earn — no spreadsheets, no awkward maths.
        </p>
      </div>

      {/* CTA */}
      <div>
        <PrimaryButton accent={p.accent} onClick={onStart}>
          Let’s go →
        </PrimaryButton>
        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: p.inkSoft,
        }}>
          takes about 30 seconds
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PEOPLE — add/remove people with incomes
// ─────────────────────────────────────────────────────────────
function PeopleScreen({ palette, people, setPeople, onContinue, onBack }) {
  const p = palette;
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const nameRef = useRef(null);

  const total = people.reduce((s, x) => s + Number(x.income || 0), 0);

  const add = () => {
    if (!name.trim() || !Number(income)) return;
    setPeople([...people, { name: name.trim(), income: Number(income) }]);
    setName(''); setIncome('');
    nameRef.current && nameRef.current.focus();
  };

  const remove = (i) => setPeople(people.filter((_, k) => k !== i));

  const canContinue = people.length >= 2;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: p.bg,
      display: 'flex', flexDirection: 'column',
      padding: '60px 24px 28px',
      overflowY: 'auto',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <button onClick={onBack} style={{
          border: 'none', background: p.surface,
          width: 40, height: 40, borderRadius: 14,
          display: 'grid', placeItems: 'center',
          cursor: 'pointer',
          color: p.ink, fontSize: 18,
          boxShadow: `inset 0 -2px 0 0 ${p.line}`,
        }}>←</button>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: p.inkSoft,
        }}>
          step 1 of 2
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Bricolage Grotesque', serif",
        fontSize: 38, lineHeight: 0.98, fontWeight: 800,
        color: p.ink, letterSpacing: '-0.035em',
        margin: '0 0 6px',
      }}>Who’s in?</h1>
      <p style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 15, lineHeight: 1.4, color: p.inkSoft,
        margin: '0 0 22px',
      }}>
        Add everyone splitting the bills, plus what they earn each month.
      </p>

      {/* People list */}
      {people.length > 0 && (
        <div style={{
          background: p.surface,
          border: `1.5px solid ${p.line}`,
          borderRadius: 22,
          padding: 6,
          marginBottom: 18,
        }}>
          {people.map((person, i) => {
            const col = personColor(i);
            const pct = total > 0 ? ((person.income / total) * 100) : 0;
            return (
              <div key={person.name + i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px',
                borderBottom: i < people.length - 1 ? `1px dashed ${p.line}` : 'none',
              }}>
                <Avatar person={person} idx={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', serif",
                    fontWeight: 700, fontSize: 19, color: p.ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{person.name}</div>
                  <div style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 12, color: p.inkSoft,
                    marginTop: 2,
                  }}>
                    {Number(person.income).toLocaleString()}€/mo
                    <span style={{
                      marginLeft: 8, padding: '2px 7px', borderRadius: 6,
                      background: col.soft, color: col.ink,
                      fontWeight: 600,
                    }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <button onClick={() => remove(i)} style={{
                  border: 'none', background: 'transparent',
                  color: p.inkSoft, cursor: 'pointer',
                  fontSize: 18, padding: 8,
                }} aria-label={`Remove ${person.name}`}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {people.length === 0 && (
        <div style={{
          background: p.surface, border: `1.5px dashed ${p.line}`,
          borderRadius: 22, padding: 24, textAlign: 'center',
          color: p.inkSoft, marginBottom: 18,
          fontFamily: "'Geist', sans-serif", fontSize: 14,
        }}>
          No-one yet. Add your first person below 👇
        </div>
      )}

      {/* Add form */}
      <div style={{
        background: p.surface, border: `1.5px solid ${p.line}`,
        borderRadius: 22, padding: 16, marginBottom: 18,
      }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: p.inkSoft, marginBottom: 10,
        }}>add someone</div>
        <input
          ref={nameRef}
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{
            width: '100%', border: `1.5px solid ${p.line}`,
            background: p.bg, color: p.ink,
            fontFamily: "'Geist', sans-serif", fontSize: 16,
            padding: '14px 16px', borderRadius: 14,
            marginBottom: 10, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = p.accent}
          onBlur={(e) => e.target.style.borderColor = p.line}
        />
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            value={income} onChange={(e) => setIncome(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Monthly income"
            inputMode="decimal"
            style={{
              width: '100%', border: `1.5px solid ${p.line}`,
              background: p.bg, color: p.ink,
              fontFamily: "'Geist', sans-serif", fontSize: 16,
              padding: '14px 36px 14px 16px', borderRadius: 14,
              outline: 'none',
              display: 'block',
            }}
            onFocus={(e) => e.target.style.borderColor = p.accent}
            onBlur={(e) => e.target.style.borderColor = p.line}
          />
          <span style={{
            position: 'absolute', right: 16, top: 0, bottom: 0,
            display: 'flex', alignItems: 'center',
            fontFamily: "'Bricolage Grotesque', serif", fontWeight: 700,
            color: p.inkSoft, fontSize: 18,
            pointerEvents: 'none',
          }}>€</span>
        </div>
        <button onClick={add} disabled={!name.trim() || !Number(income)} style={{
          width: '100%', border: 'none',
          background: name.trim() && Number(income) ? p.ink : 'oklch(0.85 0.01 60)',
          color: name.trim() && Number(income) ? '#fff' : 'oklch(0.55 0.01 60)',
          fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 15,
          padding: '13px', borderRadius: 14,
          cursor: name.trim() && Number(income) ? 'pointer' : 'not-allowed',
        }}>+ Add to the gang</button>
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      <PrimaryButton accent={p.accent} onClick={onContinue} disabled={!canContinue}>
        {canContinue ? `Continue with ${people.length} →` : 'Add at least 2 people'}
      </PrimaryButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. EXPENSE — enter expense + see split (with viz tweak)
// ─────────────────────────────────────────────────────────────
function ExpenseScreen({ palette, people, vizMode, onBack, onEditPeople }) {
  const p = palette;
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const num = parseFloat((amount || '0').replace(',', '.')) || 0;

  const total = people.reduce((s, x) => s + Number(x.income || 0), 0);
  const split = people.map((person, i) => {
    const ratio = total > 0 ? person.income / total : 0;
    return {
      ...person, idx: i,
      ratio,
      pct: ratio * 100,
      owes: num * ratio,
    };
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: p.bg,
      display: 'flex', flexDirection: 'column',
      padding: '60px 24px 28px',
      overflowY: 'auto',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <button onClick={onBack} style={{
          border: 'none', background: p.surface,
          width: 40, height: 40, borderRadius: 14,
          display: 'grid', placeItems: 'center', cursor: 'pointer',
          color: p.ink, fontSize: 18,
          boxShadow: `inset 0 -2px 0 0 ${p.line}`,
        }}>←</button>
        <button onClick={onEditPeople} style={{
          border: 'none', background: p.surface,
          padding: '8px 14px', borderRadius: 14,
          fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 600,
          color: p.ink, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: `inset 0 -2px 0 0 ${p.line}`,
        }}>
          <span style={{ display: 'inline-flex' }}>
            {people.slice(0, 3).map((per, i) => (
              <span key={i} style={{
                width: 18, height: 18, borderRadius: '50%',
                background: personColor(i).fill,
                marginLeft: i === 0 ? 0 : -6,
                border: `2px solid ${p.surface}`,
              }} />
            ))}
          </span>
          {people.length} people
        </button>
      </div>

      {/* Big amount input */}
      <div style={{
        background: p.surface,
        border: `1.5px solid ${p.line}`,
        borderRadius: 28,
        padding: '20px 22px',
        marginBottom: 14,
        boxShadow: `0 1px 0 0 ${p.line}`,
      }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: p.inkSoft, marginBottom: 6,
        }}>this expense</div>
        <input
          value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="What was it?"
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontFamily: "'Geist', sans-serif", fontSize: 16, fontWeight: 500,
            color: p.ink, outline: 'none',
            padding: 0, marginBottom: 6,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
            placeholder="0"
            inputMode="decimal"
            style={{
              flex: 1, minWidth: 0,
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: "'Bricolage Grotesque', serif",
              fontSize: 64, fontWeight: 800,
              color: p.ink, letterSpacing: '-0.04em',
              padding: 0,
            }}
          />
          <span style={{
            fontFamily: "'Bricolage Grotesque', serif",
            fontSize: 56, fontWeight: 800,
            color: num > 0 ? p.ink : p.inkSoft,
            opacity: num > 0 ? 1 : 0.4,
            letterSpacing: '-0.04em',
          }}>€</span>
        </div>

      </div>

      {/* Split visualization — chooses based on vizMode */}
      <div style={{
        background: p.surface, border: `1.5px solid ${p.line}`,
        borderRadius: 28, padding: '18px 20px 22px',
        marginBottom: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', serif",
            fontWeight: 700, fontSize: 22, color: p.ink,
            letterSpacing: '-0.02em',
          }}>Each pays</div>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: p.inkSoft,
          }}>{vizMode}</div>
        </div>

        {vizMode === 'cards' && <SplitCards split={split} palette={p} num={num} />}
        {vizMode === 'bar'   && <SplitBar split={split} palette={p} num={num} />}
        {vizMode === 'donut' && <SplitDonut split={split} palette={p} num={num} />}
        {vizMode === 'receipt' && <SplitReceipt split={split} palette={p} num={num} label={label} />}
      </div>

      <div style={{ flex: 1, minHeight: 8 }} />
    </div>
  );
}

// ─── Split visualizations ──────────────────────────────────
function SplitCards({ split, palette, num }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {split.map((s) => {
        const col = personColor(s.idx);
        return (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: col.soft, padding: '12px 14px', borderRadius: 18,
            boxShadow: `inset 0 -2px 0 0 ${col.fill}`,
          }}>
            <Avatar person={s} idx={s.idx} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Bricolage Grotesque', serif",
                fontWeight: 700, fontSize: 17, color: col.ink,
              }}>{s.name}</div>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11, color: col.ink, opacity: 0.7,
              }}>{s.pct.toFixed(1)}% share</div>
            </div>
            <div style={{
              fontFamily: "'Bricolage Grotesque', serif",
              fontWeight: 800, fontSize: 22, color: col.ink,
              letterSpacing: '-0.02em',
            }}>{s.owes.toFixed(2)}€</div>
          </div>
        );
      })}
    </div>
  );
}

function SplitBar({ split, palette, num }) {
  return (
    <div>
      <div style={{
        display: 'flex', height: 56, borderRadius: 14, overflow: 'hidden',
        marginBottom: 14, gap: 2,
        background: palette.line,
      }}>
        {split.map((s) => {
          const col = personColor(s.idx);
          return (
            <div key={s.name} style={{
              flex: s.ratio,
              background: col.fill,
              display: 'grid', placeItems: 'center',
              color: col.ink,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 12, fontWeight: 600,
              minWidth: 0,
            }}>{s.pct.toFixed(0)}%</div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {split.map((s) => {
          const col = personColor(s.idx);
          return (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: 4, background: col.fill, flex: 'none',
              }} />
              <span style={{
                fontFamily: "'Geist', sans-serif", fontWeight: 500,
                fontSize: 14, color: palette.ink, flex: 1,
              }}>{s.name}</span>
              <span style={{
                fontFamily: "'Bricolage Grotesque', serif", fontWeight: 700,
                fontSize: 17, color: palette.ink,
              }}>{s.owes.toFixed(2)}€</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitDonut({ split, palette, num }) {
  const size = 200, stroke = 30, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      <svg width={size} height={size} style={{ flex: 'none' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={palette.line} strokeWidth={stroke} />
        {split.map((s) => {
          const col = personColor(s.idx);
          const dash = c * s.ratio;
          const seg = <circle key={s.name}
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={col.fill} strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />;
          offset += dash;
          return seg;
        })}
        <text x={size/2} y={size/2 - 4} textAnchor="middle"
          fontFamily="'Bricolage Grotesque', serif" fontWeight="800"
          fontSize="28" fill={palette.ink}>
          {num.toFixed(0)}€
        </text>
        <text x={size/2} y={size/2 + 18} textAnchor="middle"
          fontFamily="'Geist Mono', monospace" fontSize="10"
          fill={palette.inkSoft} letterSpacing="0.1em">TOTAL</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 120 }}>
        {split.map((s) => {
          const col = personColor(s.idx);
          return (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 5, background: col.fill, flex: 'none',
              }} />
              <span style={{
                fontFamily: "'Geist', sans-serif", fontWeight: 500,
                fontSize: 13, color: palette.ink, flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{s.name}</span>
              <span style={{
                fontFamily: "'Bricolage Grotesque', serif", fontWeight: 700,
                fontSize: 15, color: palette.ink,
              }}>{s.owes.toFixed(2)}€</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitReceipt({ split, palette, num, label }) {
  return (
    <div style={{
      fontFamily: "'Geist Mono', monospace",
      fontSize: 13, color: palette.ink,
      background: 'oklch(0.99 0.01 80)',
      borderRadius: 14, padding: '16px 18px',
      border: `1px dashed ${palette.line}`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>OURS · RECEIPT</div>
        <div style={{ opacity: 0.6, fontSize: 11, marginTop: 2 }}>
          {label || 'untitled expense'}
        </div>
      </div>
      <div style={{
        borderTop: `1px dashed ${palette.line}`,
        borderBottom: `1px dashed ${palette.line}`,
        padding: '10px 0', margin: '8px 0',
      }}>
        {split.map((s) => (
          <div key={s.name} style={{
            display: 'flex', justifyContent: 'space-between', padding: '4px 0',
          }}>
            <span>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: 2,
                background: personColor(s.idx).fill, marginRight: 8,
                verticalAlign: 'middle',
              }} />
              {s.name} <span style={{ opacity: 0.55 }}>×{s.pct.toFixed(1)}%</span>
            </span>
            <span style={{ fontWeight: 600 }}>{s.owes.toFixed(2)}€</span>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontWeight: 700, fontSize: 14, paddingTop: 4,
      }}>
        <span>TOTAL</span>
        <span>{num.toFixed(2)}€</span>
      </div>
      <div style={{
        textAlign: 'center', marginTop: 10, opacity: 0.5, fontSize: 10,
        letterSpacing: '0.1em',
      }}>★ thanks for splitting fairly ★</div>
    </div>
  );
}

// Export to window for app.jsx
Object.assign(window, {
  PALETTES, personColor,
  Avatar, Chip, PrimaryButton, GhostButton,
  SplashScreen, StartScreen, PeopleScreen, ExpenseScreen,
});
