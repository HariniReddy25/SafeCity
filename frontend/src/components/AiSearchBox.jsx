import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { postAiParseSearchQueryApi } from '../services/aiService';
import { Sparkles, Search, Loader2, RotateCcw, Check } from 'lucide-react';

/**
 * Natural-Language AI Search Bar for Emergency Reports
 */
const AiSearchBox = ({ onApplyFilters }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [activeParsed, setActiveParsed] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setExplanation('');

    try {
      const parsed = await postAiParseSearchQueryApi(query);
      setActiveParsed(parsed);
      setExplanation(parsed.queryExplanation || 'Converted query to safe application filters.');

      if (onApplyFilters) {
        onApplyFilters({
          category: parsed.parsedCategory || 'ALL',
          priority: parsed.parsedPriority || 'ALL',
          status: parsed.parsedStatus || 'ALL',
          city: parsed.parsedCity || null,
        });
      }
    } catch (err) {
      console.error('AI search parsing failed:', err);
      setExplanation('AI search unavailable. Using standard text filter.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setExplanation('');
    setActiveParsed(null);
    if (onApplyFilters) {
      onApplyFilters({ category: 'ALL', priority: 'ALL', status: 'ALL', city: null });
    }
  };

  return (
    <Card pastelBg="purple" hoverEffect={false} style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#581C87', fontSize: '0.95rem' }}>
            <Sparkles size={18} style={{ color: '#7C3AED' }} />
            <span>AI Natural-Language Incident Search</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700 }}>Safe Backend Filter Parser</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "Show high priority fire incidents" or "Show unresolved emergencies in Hyderabad"'
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #C084FC',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
          <Button variant="primary" type="submit" icon={Search} disabled={loading || !query.trim()} style={{ backgroundColor: '#7C3AED' }}>
            {loading ? 'Parsing...' : 'AI Search'}
          </Button>
          {activeParsed && (
            <Button variant="outline" type="button" icon={RotateCcw} onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {explanation && (
          <div style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Check size={14} style={{ color: '#7C3AED' }} />
            <span>{explanation}</span>
          </div>
        )}
      </form>
    </Card>
  );
};

export default AiSearchBox;
