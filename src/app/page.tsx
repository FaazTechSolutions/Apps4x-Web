'use client';

import React, { useState, useEffect } from 'react';
import { PersonaId, LeaveRequest, LeaveBalance, LeaveStatus, LeaveType } from '@/types';
import {
  PERSONAS,
  TEAM_MEMBERS,
  loadLeaveRequests,
  saveLeaveRequests,
  loadLeaveBalance,
  saveLeaveBalance,
} from '@/helpers/mockData';
import PersonaSwitcher from '@/components/PersonaSwitcher';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import ManagerDashboard from '@/components/ManagerDashboard';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<PersonaId>('employee');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Prevent hydration mismatches by ensuring client-only rendering of localstorage data
  useEffect(() => {
    setRequests(loadLeaveRequests());
    setBalance(loadLeaveBalance());
    setIsMounted(true);
  }, []);

  // Toast notification helper
  const addToast = (message: string, type: 'success' | 'danger' | 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Submit leave request from Sarah (Employee)
  const handleSubmitRequest = (
    newRequestData: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'submittedAt'>
  ) => {
    if (!balance) return;

    const newRequest: LeaveRequest = {
      ...newRequestData,
      id: `req_${Date.now()}`,
      employeeId: 'emp_sarah',
      employeeName: 'Sarah Jenkins',
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);

    // Update pending balance in local state and persistence
    const updatedBalance: LeaveBalance = {
      ...balance,
      [newRequest.leaveType]: {
        ...balance[newRequest.leaveType],
        pending: balance[newRequest.leaveType].pending + newRequest.duration,
      },
    };

    setBalance(updatedBalance);
    saveLeaveBalance(updatedBalance);

    addToast('🚀 Leave request submitted successfully! Pending approval from David Miller.', 'success');
  };

  // Review (Approve/Reject) leave request from David (Manager)
  const handleReviewRequest = (requestId: string, status: LeaveStatus, notes?: string) => {
    if (!balance) return;

    // Find the target request
    const targetIndex = requests.findIndex((r) => r.id === requestId);
    if (targetIndex === -1) return;

    const targetRequest = requests[targetIndex];

    // Create copy of requests and update the target
    const updatedRequests = [...requests];
    updatedRequests[targetIndex] = {
      ...targetRequest,
      status,
      approverNotes: notes,
    };

    setRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);

    // Re-calculate Sarah's balance if she was the requester
    if (targetRequest.employeeId === 'emp_sarah') {
      const type: LeaveType = targetRequest.leaveType;
      const duration = targetRequest.duration;

      let newPending = balance[type].pending - duration;
      // Safeguard against negative balances
      if (newPending < 0) newPending = 0;

      let newUsed = balance[type].used;
      if (status === 'approved') {
        newUsed += duration;
      }

      const updatedBalance: LeaveBalance = {
        ...balance,
        [type]: {
          ...balance[type],
          pending: newPending,
          used: newUsed,
        },
      };

      setBalance(updatedBalance);
      saveLeaveBalance(updatedBalance);
    }

    if (status === 'approved') {
      addToast(`✅ Leave request for ${targetRequest.employeeName} has been APPROVED.`, 'success');
    } else {
      addToast(`❌ Leave request for ${targetRequest.employeeName} has been REJECTED.`, 'danger');
    }
  };

  // Get details of acting persona
  const activePersona = PERSONAS.find((p) => p.id === currentPersonaId) || PERSONAS[0];

  // Render loading structure while mounting to prevent HTML differences on first render
  if (!isMounted || !balance) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          fontFamily: 'var(--font-heading)',
        }}
      >
        <div className="logo-icon" style={{ marginBottom: '1.5rem', animation: 'pulse-glow 2s infinite' }}>N</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Loading NexFlow portal...</div>
      </div>
    );
  }

  return (
    <main className="app-container animate-fade-in">
      {/* Toast Notifications container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '✨'}
              {toast.type === 'danger' && '⚠️'}
              {toast.type === 'info' && '💡'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Global App Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">N</div>
          <div>
            <h1 className="logo-text">NexFlow</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, margin: 0, lineHeight: 1 }}>
              Self-Service Portal
            </p>
          </div>
        </div>

        {/* Premium Navigation Hub */}
        <nav className="header-nav">
          <a href="/" className="nav-item active">
            <span>🌴</span> Leave Portal
          </a>
           <a href="/inbox" className="nav-item" target='_blank'>
            <span>📥</span> Inbox
          </a>
          <a href="/crm" className="nav-item" target='_blank'>
            <span>📈</span> CRM
          </a>
          <a href="/helpdesk" className="nav-item" target='_blank'>
            <span>🎧</span> Helpdesk
          </a>
          <a href="/governance" className="nav-item" target='_blank'>
            <span>🛡️</span> Governance
          </a>
          <a href="/delegation" className="nav-item" target='_blank'>
            <span>🤝</span> Delegation
          </a>
          <a href="/prototype" className="nav-item" target='_blank'>
            <span>🧪</span> Prototype
          </a>
        </nav>

        {/* Dynamic User Profile Indicator */}
        <div className="user-profile">
          <div className="user-info" style={{ textAlign: 'right' }}>
            <span className="user-name">{activePersona.name}</span>
            <span className="user-role">{activePersona.role}</span>
          </div>
          <div
            className="user-avatar"
            style={{
              background: `linear-gradient(135deg, ${activePersona.avatarColors.start}, ${activePersona.avatarColors.end})`,
            }}
          >
            {activePersona.avatar}
          </div>
        </div>
      </header>

      {/* Dynamic Role-Based Dashboards */}
      {currentPersonaId === 'employee' ? (
        <EmployeeDashboard
          balance={balance}
          requests={requests}
          onSubmitRequest={handleSubmitRequest}
        />
      ) : (
        <ManagerDashboard
          requests={requests}
          teamMembers={TEAM_MEMBERS}
          onReviewRequest={handleReviewRequest}
        />
      )}

      {/* Floating Demo persona switcher */}
      <PersonaSwitcher
        currentPersonaId={currentPersonaId}
        onPersonaChange={setCurrentPersonaId}
      />

    </main>
  );
}