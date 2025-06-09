import React from 'react';
import { WindowsCanvas } from './WindowsCanvas';

interface WindowsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const WindowsOverlay: React.FC<WindowsOverlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          padding: '12px 24px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2d3748';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4a5568';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ← Back to Room
      </button>
      
      {/* Windows Canvas */}
      <WindowsCanvas />
    </div>
  );
};