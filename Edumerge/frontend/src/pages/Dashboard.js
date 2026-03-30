import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [seatStatus, setSeatStatus] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, seatsRes, docsRes, feesRes] = await Promise.all([
        api.get('/dashboard/summary/'),
        api.get('/dashboard/seat-status/'),
        api.get('/dashboard/pending-documents/'),
        api.get('/dashboard/pending-fees/')
      ]);
      setSummary(summaryRes.data);
      setSeatStatus(seatsRes.data.programs || []);
      setPendingDocuments(docsRes.data.applicants || []);
      setPendingFees(feesRes.data.admissions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1 className="page-title">Dashboard</h1>

        <div className="stats-grid">
          <StatCard
            title="Total Programs"
            value={summary?.total_programs || 0}
            icon="📚"
            color="blue"
          />
          <StatCard
            title="Total Intake"
            value={summary?.total_intake || 0}
            icon="🎓"
            color="purple"
          />
          <StatCard
            title="Total Applicants"
            value={summary?.total_applicants || 0}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Confirmed Admissions"
            value={summary?.confirmed_admissions || 0}
            icon="✅"
            color="green"
          />
        </div>

        <div className="stats-grid">
          <StatCard
            title="Pending Admissions"
            value={summary?.pending_admissions || 0}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="Pending Documents"
            value={summary?.pending_documents || 0}
            icon="📄"
            color="orange"
          />
          <StatCard
            title="Pending Fees"
            value={summary?.pending_fees || 0}
            icon="💰"
            color="red"
          />
        </div>

        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Seat Status by Program</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Total Intake</th>
                    <th>Admitted</th>
                    <th>Pending</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {seatStatus.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No programs configured</td>
                    </tr>
                  ) : (
                    seatStatus.map((program) => (
                      <tr key={program.program_id}>
                        <td>{program.program_name}</td>
                        <td>{program.total_intake}</td>
                        <td>{program.admitted}</td>
                        <td>{program.pending}</td>
                        <td>
                          <span className={`badge ${program.remaining > 0 ? 'badge-verified' : 'badge-pending'}`}>
                            {program.remaining}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Pending Documents</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="empty-state">No pending documents</td>
                    </tr>
                  ) : (
                    pendingDocuments.slice(0, 5).map((applicant) => (
                      <tr key={applicant.id}>
                        <td>{applicant.name}</td>
                        <td>
                          <span className={`badge badge-${applicant.document_status.toLowerCase()}`}>
                            {applicant.document_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Pending Fees</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Program</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFees.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="empty-state">No pending fees</td>
                    </tr>
                  ) : (
                    pendingFees.slice(0, 5).map((admission) => (
                      <tr key={admission.id}>
                        <td>{admission.applicant_name}</td>
                        <td>{admission.program_name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;