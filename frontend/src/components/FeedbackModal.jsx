import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { submitFeedbackApi } from '../services/communityService';
import { Star, MessageSquare, CheckCircle2, X, Send } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('General Experience');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitFeedbackApi({ rating, category, comment });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1E3A8A', fontSize: '1.1rem' }}>
            <MessageSquare size={20} style={{ color: '#2563EB' }} />
            <span>Citizen Service Feedback</span>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              How was your experience with SafeCity emergency response services? Your feedback helps improve civic safety operations.
            </p>

            {/* STAR RATING PICKER */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Service Rating *
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                  >
                    <Star
                      size={28}
                      style={{
                        color: star <= rating ? '#EAB308' : '#CBD5E1',
                        fill: star <= rating ? '#EAB308' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="General Experience">General Platform Experience</option>
                <option value="Responder Speed">First Responder Response Speed</option>
                <option value="Safety Map Features">Safety Map & Navigation</option>
                <option value="AI Safety Assistant">AI Assistant Guidance</option>
                <option value="Emergency Reporting">Emergency Reporting Process</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts, suggestions, or feedback..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>

            {error && <div style={{ color: '#DC2626', fontSize: '0.825rem', fontWeight: 700 }}>{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
              <Button variant="outline" type="button" size="md" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" size="md" icon={Send} disabled={loading} style={{ backgroundColor: '#2563EB' }}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '9999px', backgroundColor: 'var(--pastel-mint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={32} style={{ color: '#15803D' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
              Thank You for Your Feedback!
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Your rating and response have been logged to continuously improve SafeCity operations.
            </p>
            <Button variant="primary" size="md" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
