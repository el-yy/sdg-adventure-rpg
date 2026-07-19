import { useNavigate } from 'react-router-dom';

const controls = [
  ['Move', 'Arrow keys or W A S D'],
  ['Interact', 'Press E near a person or quest area'],
  ['Quest log', 'Open it from the top bar while in a world'],
  ['Leave a world', 'Use Back to return to the dashboard'],
];

export default function HowToPlayPage() {
  const navigate = useNavigate();

  return (
    <main className="guide-page">
      <header className="guide-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <span className="eyebrow">Field manual 01</span>
          <h1>How to play</h1>
        </div>
      </header>

      <section className="guide-lead">
        <img src="/assets/characters/player.png" alt="Pixel-art SDG Guardian" />
        <div>
          <h2>Your mission</h2>
          <p>Travel through each world, speak with residents, investigate problems, and complete decisions rooted in the United Nations Sustainable Development Goals.</p>
        </div>
      </section>

      <div className="guide-grid">
        <section className="guide-section">
          <span className="guide-number">01</span>
          <h2>Choose a world</h2>
          <p>Start in Forest World. More worlds unlock as your Guardian gains levels and experience.</p>
        </section>
        <section className="guide-section">
          <span className="guide-number">02</span>
          <h2>Find a resident</h2>
          <p>Walk close to an NPC and press <kbd>E</kbd>. Their dialogue points you toward the next task.</p>
        </section>
        <section className="guide-section">
          <span className="guide-number">03</span>
          <h2>Complete the quest</h2>
          <p>Explore marked areas, collect items, and make informed choices. Use the Quest Log when you lose track.</p>
        </section>
        <section className="guide-section">
          <span className="guide-number">04</span>
          <h2>Build your impact</h2>
          <p>Quests award XP, items, and achievements. Your dashboard records progress across every world.</p>
        </section>
      </div>

      <section className="controls-table" aria-labelledby="controls-title">
        <div>
          <span className="eyebrow">Keyboard controls</span>
          <h2 id="controls-title">Keep these close</h2>
        </div>
        <dl>
          {controls.map(([action, input]) => (
            <div key={action}>
              <dt>{action}</dt>
              <dd>{input}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="guide-tip">
        <strong>Good to know</strong>
        <p>There is no penalty for exploring. Read the SDG facts, revisit NPCs, and use the worlds as a place to test ideas.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Choose a world</button>
      </section>
    </main>
  );
}
