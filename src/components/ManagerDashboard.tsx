'use client';

import React, { useState } from 'react';
import { LeaveRequest, TeamMember, LeaveStatus } from '@/types';
import { doRangesOverlap } from '@/helpers/duration';

interface ManagerDashboardProps {
  requests: LeaveRequest[];
  teamMembers: TeamMember[];
  onReviewRequest: (requestId: string, status: LeaveStatus, notes?: string) => void;
}

export default function ManagerDashboard({
  requests,
  teamMembers,
  onReviewRequest,
}: ManagerDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approverNotes, setApproverNotes] = useState('');

  // 1. Get Pending Requests
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  // 2. Overlap Checker: checks if other APPROVED requests overlap with target request
  const getOverlappingRequests = (target: LeaveRequest): LeaveRequest[] => {
    return requests.filter(
      (r) =>
        r.id !== target.id &&
        r.status === 'approved' &&
        doRangesOverlap(r.startDate, r.endDate, target.startDate, target.endDate)
    );
  };

  // 3. Team member availability check
  const getLiveTeamStatus = (): TeamMember[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    return teamMembers.map((member) => {
      // Find any approved leave that covers today
      const activeLeave = requests.find(
        (r) =>
          r.employeeName === member.name &&
          r.status === 'approved' &&
          todayStr >= r.startDate &&
          todayStr <= r.endDate
      );

      if (activeLeave) {
        return {
          ...member,
          status: 'leave',
          activeAbsence: {
            type: activeLeave.leaveType,
            start: activeLeave.startDate,
            end: activeLeave.endDate,
          },
        };
      }
      return { ...member, status: 'active' };
    });
  };

  const activeTeamStatus = getLiveTeamStatus();

  // 4. Custom Calendar Generation for the current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get first day of the month and total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Calendar cells array
  const calendarCells = [];
  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ dayNumber: null, dateStr: '' });
  }
  // Add day numbers
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr });
  }

  // Check who is absent on a specific date (any approved leave covering dateStr)
  const getAbsencesForDate = (dateStr: string): LeaveRequest[] => {
    if (!dateStr) return [];
    return requests.filter(
      (r) => r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate
    );
  };

  const handleReview = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setApproverNotes('');
  };

  const handleAction = (status: LeaveStatus) => {
    if (selectedRequest) {
      onReviewRequest(selectedRequest.id, status, approverNotes.trim() ? approverNotes : undefined);
      setSelectedRequest(null);
    }
  };

  // Group approved absences for tooltip list
  const allApprovedRequests = requests.filter((r) => r.status === 'approved');

  return (
    <div className="manager-dashboard animate-fade-in">
      <div className="dashboard-layout">
        {/* Left Column: Pending Approvals Queue */}
        <div className="glass-card">
          <h3 className="card-title">
            <span>📥</span> Leave Approvals Inbox ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
              <h4 style={{ marginBottom: '0.5rem' }}>All Caught Up!</h4>
              <p>There are no pending leave requests awaiting your review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingRequests.map((req) => {
                const overlaps = getOverlappingRequests(req);
                return (
                  <div
                    key={req.id}
                    className="glass-card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: overlaps.length > 0 ? '3px solid var(--warning-text)' : '3px solid var(--primary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{req.employeeName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Submitted: {req.submittedAt}
                        </span>
                      </div>
                      <span className="status-badge pending">Pending</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Leave Type:</span>{' '}
                        <strong style={{ textTransform: 'capitalize' }}>{req.leaveType}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Dates:</span>{' '}
                        <strong>{req.startDate} to {req.endDate}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Duration:</span>{' '}
                        <strong>{req.duration} days</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                      &ldquo;{req.reason}&rdquo;
                    </p>

                    {overlaps.length > 0 && (
                      <div className="overlap-warning">
                        <span className="overlap-icon">⚠️</span>
                        <div className="overlap-details">
                          <span className="overlap-title">Team Overlap Warning</span>
                          <span>
                            {overlaps.length} other team absence(s) already approved in this date range.
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => handleReview(req)} style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                        Review Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Calendar and Team List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Team Availability Widget */}
          <div className="glass-card">
            <h3 className="card-title">
              <span>👥</span> Team Attendance Status
            </h3>
            <div className="team-list">
              {activeTeamStatus.map((member) => (
                <div key={member.id} className="team-member-item">
                  <div className="member-info">
                    <div
                      className="user-avatar"
                      style={{
                        width: '32px',
                        height: '32px',
                        fontSize: '0.75rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        boxShadow: 'none'
                      }}
                    >
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.role}</div>
                    </div>
                  </div>
                  <span className={`member-status ${member.status}`}>
                    {member.status === 'active' ? 'Active Today' : 'Away (Leave)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Absence Calendar Preview */}
          <div className="glass-card calendar-card">
            <div className="calendar-header">
              <span className="calendar-month">📅 {monthNames[month]} {year}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Grid</span>
            </div>
            <div className="calendar-grid">
              <span className="calendar-day-label">S</span>
              <span className="calendar-day-label">M</span>
              <span className="calendar-day-label">T</span>
              <span className="calendar-day-label">W</span>
              <span className="calendar-day-label">T</span>
              <span className="calendar-day-label">F</span>
              <span className="calendar-day-label">S</span>

              {calendarCells.map((cell, idx) => {
                if (cell.dayNumber === null) {
                  return <div key={`empty-${idx}`} className="calendar-day empty" />;
                }

                const absences = getAbsencesForDate(cell.dateStr);
                const isAbsence = absences.length > 0;
                const isToday = cell.dayNumber === today.getDate();

                return (
                  <div
                    key={`day-${cell.dayNumber}`}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isAbsence ? 'has-absence' : ''}`}
                    title={
                      isAbsence
                        ? `Absent: ${absences.map((a) => `${a.employeeName} (${a.leaveType})`).join(', ')}`
                        : isToday
                        ? 'Today'
                        : undefined
                    }
                  >
                    {cell.dayNumber}
                  </div>
                );
              })}
            </div>
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color today" />
                <span>Today</span>
              </div>
              <div className="legend-item">
                <span className="legend-color absence" />
                <span>Team Leave Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Review Leave Request</h3>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div className="detail-row">
                <span className="detail-label">Employee</span>
                <span className="detail-value">{selectedRequest.employeeName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">Platform Engineering</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Leave Category</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                  {selectedRequest.leaveType}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dates Requested</span>
                <span className="detail-value">
                  {selectedRequest.startDate} to {selectedRequest.endDate}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Duration</span>
                <span className="detail-value">{selectedRequest.duration} working days</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason</span>
                <span className="detail-value" style={{ fontWeight: 'normal', fontStyle: 'italic' }}>
                  &ldquo;{selectedRequest.reason}&rdquo;
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Emergency Phone</span>
                <span className="detail-value">{selectedRequest.emergencyContact}</span>
              </div>
              {selectedRequest.attachmentName && (
                <div className="detail-row">
                  <span className="detail-label">Attachment</span>
                  <span className="detail-value" style={{ color: 'var(--secondary)' }}>
                    📎 {selectedRequest.attachmentName}
                  </span>
                </div>
              )}
            </div>

            {/* In-Modal Overlap Warning */}
            {getOverlappingRequests(selectedRequest).length > 0 && (
              <div className="overlap-warning" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
                <span className="overlap-icon">⚠️</span>
                <div className="overlap-details">
                  <span className="overlap-title">Potential Coverage Gap</span>
                  {getOverlappingRequests(selectedRequest).map((overlap) => (
                    <span key={overlap.id}>
                      &bull; {overlap.employeeName} is away on approved {overlap.leaveType} from{' '}
                      {overlap.startDate} to {overlap.endDate}.
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Reviewer Comments / Decision Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Optional explanation, e.g. Have a great vacation! or Please reschedule due to major release overlap."
                value={approverNotes}
                onChange={(e) => setApproverNotes(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleAction('rejected')}>
                Reject Request
              </button>
              <button className="btn btn-success" onClick={() => handleAction('approved')}>
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
