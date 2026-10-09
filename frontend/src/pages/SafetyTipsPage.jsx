import React, { useState } from 'react';
import Card from '../components/Card';
import { BookOpen, Flame, Car, Shield, Waves, Smartphone, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';

const SAFETY_CATEGORIES = [
  { value: 'ALL', label: 'All Safety Topics' },
  { value: 'ROAD', label: '🚗 Road Safety' },
  { value: 'FIRE', label: '🔥 Fire Safety' },
  { value: 'PERSONAL', label: '🌙 Personal Safety' },
  { value: 'DISASTER', label: '🌊 Natural Disasters' },
  { value: 'CYBER', label: '💻 Cyber Safety' },
  { value: 'PREPAREDNESS', label: '🚨 Emergency Preparedness' },
];

const SAFETY_GUIDES = [
  {
    id: 'road-1',
    category: 'ROAD',
    categoryLabel: 'Road Safety',
    title: 'Post-Accident Scene Management',
    icon: '🚗',
    steps: [
      'Turn on hazard lights immediately to warn approaching traffic.',
      'Place reflective warning triangles 50 meters behind the collision point if safe.',
      'Call emergency ambulance services (108 / 112) for medical aid.',
      'Do not move severely injured victims unless there is an imminent fire hazard.',
    ],
  },
  {
    id: 'fire-1',
    category: 'FIRE',
    categoryLabel: 'Fire Safety',
    title: 'Indoor Structural Fire Response',
    icon: '🔥',
    steps: [
      'Evacuate using emergency stairwells immediately. Never use elevators.',
      'If smoke is dense, stay low to the floor where cleaner air is present.',
      'Feel door handles with the back of your hand before opening to check for heat.',
      'Call fire emergency dispatch (101 / 112) as soon as you reach safety.',
    ],
  },
  {
    id: 'personal-1',
    category: 'PERSONAL',
    categoryLabel: 'Personal Safety',
    title: 'Night Commute & Public Vigilance',
    icon: '🌙',
    steps: [
      'Share live route progress with family members when taking late-night transport.',
      'Stick to well-lit main thoroughfares and avoid unlit pedestrian alleyways.',
      'Keep your mobile phone fully charged with SafeCity SOS shortcut ready.',
      'Trust your instincts—move towards open public places if followed.',
    ],
  },
  {
    id: 'disaster-1',
    category: 'DISASTER',
    categoryLabel: 'Natural Disasters',
    title: 'Urban Monsoon Flood Precautions',
    icon: '🌊',
    steps: [
      'Do not attempt to cross flooded roads or open stormwater drains.',
      'Avoid standing near electric poles or exposed outdoor wiring during heavy rain.',
      'Disconnect major household appliances if water starts entering your ground floor.',
      'Keep emergency flashlight, bottled water, and essential medicines accessible.',
    ],
  },
  {
    id: 'cyber-1',
    category: 'CYBER',
    categoryLabel: 'Cyber Safety',
    title: 'Digital Fraud & Identity Protection',
    icon: '💻',
    steps: [
      'Never reveal OTPs, PINs, or banking passwords to caller posing as officials.',
      'Enable two-factor authentication (2FA) on primary email and banking accounts.',
      'Verify official domain names before entering personal identification details.',
      'Report financial cyber fraud immediately to National Cyber Helpline (1930).',
    ],
  },
  {
    id: 'preparedness-1',
    category: 'PREPAREDNESS',
    categoryLabel: 'Emergency Preparedness',
    title: 'Household Emergency Kit Checklist',
    icon: '🚨',
    steps: [
      'Maintain speed dial for 112 (Emergency), 100 (Police), 101 (Fire), 108 (Ambulance).',
      'Store a 3-day supply of non-perishable food, water, and first-aid supplies.',
      'Keep certified copies of vital identity documents in a waterproof pouch.',
      'Familiarize all household members with building emergency exit routes.',
    ],
  },
];

const SafetyTipsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = SAFETY_GUIDES.filter((guide) => {
    if (selectedCategory !== 'ALL' && guide.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = guide.title.toLowerCase();
      const cat = guide.categoryLabel.toLowerCase();
      if (!title.includes(q) && !cat.includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '950px', margin: '0 auto' }}>
      {/* HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-blue)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-blue">SAFETY TIPS & GUIDELINES</span>
          <span style={{ fontSize: '0.8rem', color: '#1E3A8A', fontWeight: 600 }}>Public Safety Library</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#1E3A8A', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={32} style={{ color: '#2563EB' }} /> Essential Public Safety Guides
        </h1>
        <p style={{ color: '#1E293B', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '720px', margin: 0 }}>
          Practical, actionable guidelines for road collisions, fire hazards, personal commute safety, floods, and emergency preparedness.
        </p>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search safety guides (e.g. fire, road accident, flood, cyber)..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.9rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAFETY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: selectedCategory === cat.value ? '2px solid #2563EB' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat.value ? '#DBEAFE' : '#FFFFFF',
                color: selectedCategory === cat.value ? '#1E3A8A' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* GUIDES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredGuides.map((guide) => (
          <Card key={guide.id} hoverEffect={true} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{guide.icon}</span>
                <span className="badge badge-blue">{guide.categoryLabel}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>
                {guide.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {guide.steps.map((step, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <CheckCircle2 size={15} style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SafetyTipsPage;
