'use client';

import React, { useState } from 'react';
import { PERSONAS } from '@/helpers/mockData';
import { PersonaId } from '@/types';

interface PersonaSwitcherProps {
  currentPersonaId: PersonaId;
  onPersonaChange: (personaId: PersonaId) => void;
}

export default function PersonaSwitcher({
  currentPersonaId,
  onPersonaChange,
}: PersonaSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPersona = PERSONAS.find((p) => p.id === currentPersonaId) || PERSONAS[0];

  const handleSelect = (id: PersonaId) => {
    onPersonaChange(id);
    setIsOpen(false);
  };

  return (
    <div className="persona-switcher-container">
      {isOpen && (
        <div className="persona-panel">
          <div className="persona-panel-title">Demo Personas</div>
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              className={`persona-option ${persona.id === currentPersonaId ? 'active' : ''}`}
              onClick={() => handleSelect(persona.id)}
            >
              <div
                className="persona-option-avatar"
                style={{
                  background: `linear-gradient(135deg, ${persona.avatarColors.start}, ${persona.avatarColors.end})`,
                  color: '#fff',
                }}
              >
                {persona.avatar}
              </div>
              <div className="persona-option-details">
                <div className="persona-option-name">{persona.name}</div>
                <div className="persona-option-role">{persona.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button className="persona-switch-btn" onClick={() => setIsOpen(!isOpen)}>
        <span
          className="persona-role-indicator"
          style={{
            background: currentPersona.avatarColors.start,
            boxShadow: `0 0 10px ${currentPersona.avatarColors.start}`,
          }}
        />
        <span>Acting as: {currentPersona.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
