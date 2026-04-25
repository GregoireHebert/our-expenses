// app.jsx — main app: router + tweaks + iOS frame composition

const { useState: useState2, useEffect: useEffect2 } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "splash",
  "vizMode": "receipt",
  "palette": "sage",
  "showFrame": true
}/*EDITMODE-END*/;

const SCREENS = [
  { id: 'splash', label: 'Splash' },
  { id: 'start',  label: 'Start' },
  { id: 'people', label: 'People' },
  { id: 'expense',label: 'Expense' },
];

const SEED_PEOPLE = [
  { name: 'Mo',  income: 3200 },
  { name: 'Sky', income: 4800 },
  { name: 'Jun', income: 2400 },
];

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState2(tweaks.screen || 'splash');
  const [people, setPeople] = useState2(SEED_PEOPLE);

  // Sync screen <-> tweak
  useEffect2(() => {
    if (tweaks.screen && tweaks.screen !== screen) setScreen(tweaks.screen);
    // eslint-disable-next-line
  }, [tweaks.screen]);

  const goto = (s) => { setScreen(s); setTweak('screen', s); };

  const palette = PALETTES[tweaks.palette] || PALETTES.coral;

  // Render the current screen
  let body;
  if (screen === 'splash') {
    body = <SplashScreen palette={palette} onAuto={() => goto('start')} />;
  } else if (screen === 'start') {
    body = <StartScreen palette={palette} onStart={() => goto('people')} />;
  } else if (screen === 'people') {
    body = <PeopleScreen palette={palette} people={people} setPeople={setPeople}
            onBack={() => goto('start')}
            onContinue={() => goto('expense')} />;
  } else if (screen === 'expense') {
    body = <ExpenseScreen palette={palette} people={people} vizMode={tweaks.vizMode}
            onBack={() => goto('people')}
            onEditPeople={() => goto('people')} />;
  }

  const screenIdx = SCREENS.findIndex(s => s.id === screen);
  const screenLabel = SCREENS.find(s => s.id === screen)?.label;

  return (
    <div className="stage" data-screen-label={`${screenIdx + 1} ${screenLabel}`}>
      {tweaks.showFrame ? (
        <IOSDevice width={390} height={844}>
          {body}
        </IOSDevice>
      ) : (
        <div style={{
          width: 390, height: 844,
          borderRadius: 36,
          overflow: 'hidden',
          boxShadow: '0 30px 80px -20px oklch(0.4 0.05 60 / 0.25), 0 0 0 1px oklch(0.85 0.02 60)',
        }}>{body}</div>
      )}

      <div className="stage-label">
        ours. · {screenLabel}
        <b>{screenIdx + 1}/{SCREENS.length}</b>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Navigation">
          <TweakRadio
            label="Screen"
            value={tweaks.screen}
            onChange={(v) => { setTweak('screen', v); setScreen(v); }}
            options={SCREENS.map(s => ({ value: s.id, label: s.label }))}
          />
        </TweakSection>

        <TweakSection label="Split visualization">
          <TweakRadio
            label="Style"
            value={tweaks.vizMode}
            onChange={(v) => setTweak('vizMode', v)}
            options={[
              { value: 'cards',   label: 'Big cards' },
              { value: 'bar',     label: 'Stacked bar' },
              { value: 'donut',   label: 'Donut chart' },
              { value: 'receipt', label: 'Receipt' },
            ]}
          />
        </TweakSection>

        <TweakSection label="Color theme">
          <TweakRadio
            label="Palette"
            value={tweaks.palette}
            onChange={(v) => setTweak('palette', v)}
            options={[
              { value: 'coral', label: 'Coral' },
              { value: 'plum',  label: 'Plum' },
              { value: 'sage',  label: 'Sage' },
            ]}
          />
        </TweakSection>

        <TweakSection label="Frame">
          <TweakToggle
            label="iPhone bezel"
            value={tweaks.showFrame}
            onChange={(v) => setTweak('showFrame', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
