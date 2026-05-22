'use client';

import React, { useState, useEffect } from 'react';
import { LeaveBalance, LeaveRequest, LeaveType } from '@/types';
import { calculateWorkingDays } from '@/helpers/duration';

interface EmployeeDashboardProps {
  balance: LeaveBalance;
  requests: LeaveRequest[];
  onSubmitRequest: (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'submittedAt'>) => void;
}

export default function EmployeeDashboard({
  balance,
  requests,
  onSubmitRequest,
}: EmployeeDashboardProps) {
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(0);
  const [reason, setReason] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('+1 (555) 342-9988');
  const [attachment, setAttachment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate dynamic duration excluding weekends
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateWorkingDays(startDate, endDate);
      setDuration(days);
      if (days === 0 && new Date(startDate) > new Date(endDate)) {
        setErrorMsg('End Date must be after or equal to Start Date.');
      } else if (days === 0) {
        setErrorMsg('Selected dates fall entirely on weekends.');
      } else {
        setErrorMsg('');
      }
    } else {
      setDuration(0);
      setErrorMsg('');
    }
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      setErrorMsg('Please select a valid date range.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your leave request.');
      return;
    }

    // Verify leave balance (remaining = allowed - used - pending)
    const category = balance[leaveType];
    const remaining = category.allowed - category.used - category.pending;
    if (duration > remaining) {
      setErrorMsg(
        `Insufficient balance. You requested ${duration} days, but you only have ${remaining} days available.`
      );
      return;
    }

    onSubmitRequest({
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
      emergencyContact,
      attachmentName: attachment ? attachment.replace('C:\\fakepath\\', '') : undefined,
    });

    // Reset Form
    setStartDate('');
    setEndDate('');
    setReason('');
    setAttachment('');
    setErrorMsg('');
  };

  // Helper to determine remaining balance dynamically
  const getRemaining = (type: LeaveType) => {
    const cat = balance[type];
    return Math.max(0, cat.allowed - cat.used - cat.pending);
  };

  // Filter requests to show only Sarah's requests
  const myRequests = [...requests]
    .filter((r) => r.employeeId === 'emp_sarah')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="employee-dashboard animate-fade-in">
      {/* Leave Balance Stats Cards */}
      <div className="grid-cols-3">
        {/* Annual Leave Card */}
        <div className="glass-card balance-card annual">
          <div className="balance-header">
            <div className="balance-type">Annual Leave</div>
            <div className="balance-icon">🌴</div>
          </div>
          <div className="balance-value-container">
            <div className="balance-qty">{getRemaining('annual')}</div>
            <div className="balance-unit">days available</div>
          </div>
          <div className="balance-details">
            <span>Allowed: <strong>{balance.annual.allowed}</strong></span>
            <span>Used: <strong>{balance.annual.used}</strong></span>
            <span>Pending: <strong>{balance.annual.pending}</strong></span>
          </div>
        </div>

        {/* Sick Leave Card */}
        <div className="glass-card balance-card sick">
          <div className="balance-header">
            <div className="balance-type">Sick Leave</div>
            <div className="balance-icon">🩹</div>
          </div>
          <div className="balance-value-container">
            <div className="balance-qty">{getRemaining('sick')}</div>
            <div className="balance-unit">days available</div>
          </div>
          <div className="balance-details">
            <span>Allowed: <strong>{balance.sick.allowed}</strong></span>
            <span>Used: <strong>{balance.sick.used}</strong></span>
            <span>Pending: <strong>{balance.sick.pending}</strong></span>
          </div>
        </div>

        {/* Casual Leave Card */}
        <div className="glass-card balance-card casual">
          <div className="balance-header">
            <div className="balance-type">Casual Leave</div>
            <div className="balance-icon">☕</div>
          </div>
          <div className="balance-value-container">
            <div className="balance-qty">{getRemaining('casual')}</div>
            <div className="balance-unit">days available</div>
          </div>
          <div className="balance-details">
            <span>Allowed: <strong>{balance.casual.allowed}</strong></span>
            <span>Used: <strong>{balance.casual.used}</strong></span>
            <span>Pending: <strong>{balance.casual.pending}</strong></span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Left Side: Submission History */}
        <div className="glass-card">
          <h3 className="card-title">
            <span>⏳</span> Leave Request Log
          </h3>
          <div className="table-container">
            {myRequests.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>No leave requests found.</p>
            ) : (
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <span>
                            {req.leaveType === 'annual' && '🌴'}
                            {req.leaveType === 'sick' && '🩹'}
                            {req.leaveType === 'casual' && '☕'}
                          </span>
                          <span style={{ textTransform: 'capitalize' }}>{req.leaveType}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {req.startDate} to {req.endDate}
                        </div>
                        {req.reason && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {req.reason}
                          </div>
                        )}
                        {req.approverNotes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', marginTop: '0.2rem', fontWeight: 500 }}>
                            <strong>Manager Note:</strong> {req.approverNotes}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{req.duration}</strong> {req.duration === 1 ? 'working day' : 'working days'}
                      </td>
                      <td style={{ color: 'var(--text-dark)', fontSize: '0.8rem' }}>
                        {req.submittedAt}
                      </td>
                      <td>
                        <span className={`status-badge ${req.status}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Request Form */}
        <div className="glass-card">
          <h3 className="card-title">
            <span>📝</span> Request Leave
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="annual">Annual Leave 🌴</option>
                <option value="sick">Sick Leave 🩹</option>
                <option value="casual">Casual Leave ☕</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {duration > 0 && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-light)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Duration: <span style={{ color: 'var(--secondary)' }}>{duration}</span> {duration === 1 ? 'working day' : 'working days'}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)', fontWeight: 'normal', marginTop: '0.2rem' }}>
                  (Excluding Saturdays and Sundays)
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ color: 'var(--danger-text)', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)', fontWeight: 500 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason for Absence</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Explain the purpose of your leave request..."
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Info</label>
              <input
                type="text"
                className="form-control"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attachments (Optional)</label>
              <input
                type="file"
                className="form-control"
                style={{ padding: '0.6rem 1rem' }}
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={duration <= 0 || !!errorMsg}
              style={{ marginTop: '0.5rem' }}
            >
              <span>🚀</span> Submit Leave Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
