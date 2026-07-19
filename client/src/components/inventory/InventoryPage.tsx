import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const inventory = profile?.inventory || [];

  const typeColors: Record<string, string> = {
    achievement: 'var(--color-accent)',
    accessory: 'var(--color-secondary)',
    document: '#9C27B0',
    tool: '#607D8B',
    consumable: 'var(--color-success)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>← Back</button>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>🎒 Inventory</h1>
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {inventory.length} items
        </span>
      </header>

      <div className="page-container">
        {inventory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🎒</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Inventory Empty</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Complete quests to earn items and rewards!
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Start Adventuring
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {inventory.map((item, index) => (
              <div key={`${item.itemId}-${index}`} className="card" style={{ padding: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: `${typeColors[item.type] || 'var(--bg-secondary)'}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 24 }}>
                    {item.type === 'achievement' ? '🏆' :
                     item.type === 'accessory' ? '💍' :
                     item.type === 'document' ? '📜' :
                     item.type === 'tool' ? '🔧' : '📦'}
                  </span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </p>
                {item.quantity > 1 && (
                  <span style={{
                    display: 'inline-block', marginTop: 8, padding: '2px 8px',
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)',
                    fontSize: 11, color: 'var(--text-secondary)',
                  }}>
                    x{item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
