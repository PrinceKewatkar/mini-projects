import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import api from '../services/api';
import './Setup.css';

const Setup = () => {
  const { section = 'institutions' } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [dropdownData, setDropdownData] = useState({});

  const endpoints = {
    institutions: 'institutions',
    campuses: 'campuses',
    departments: 'departments',
    programs: 'programs',
    'academic-years': 'academic-years',
    quotas: 'quotas',
    'program-quotas': 'program-quotas'
  };

  const endpoint = endpoints[section] || section;

  useEffect(() => {
    fetchData();
  }, [section]);

  useEffect(() => {
    if (modalOpen) {
      fetchDropdownData();
    }
  }, [modalOpen, section]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/${endpoint}/`;
      if (section === 'campuses') {
        url = '/campuses/';
      } else if (section === 'departments') {
        url = '/departments/';
      } else if (section === 'programs') {
        url = '/programs/';
      } else if (section === 'program-quotas') {
        url = '/program-quotas/';
      }

      const response = await api.get(url);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    const dropdowns = {};
    try {
      if (section === 'campuses') {
        const res = await api.get('/institutions/');
        dropdowns.institutions = res.data;
      } else if (section === 'departments') {
        const res = await api.get('/campuses/');
        dropdowns.campuses = res.data;
      } else if (section === 'programs') {
        const res = await api.get('/departments/');
        dropdowns.departments = res.data;
      } else if (section === 'program-quotas') {
        const [programsRes, quotasRes] = await Promise.all([
          api.get('/programs/'),
          api.get('/quotas/')
        ]);
        dropdowns.programs = programsRes.data;
        dropdowns.quotas = quotasRes.data;
      }
      setDropdownData(dropdowns);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const getInitialForm = () => {
    switch (section) {
      case 'institutions':
        return { name: '', code: '' };
      case 'campuses':
        return { institution: '', name: '', code: '' };
      case 'departments':
        return { campus: '', name: '', code: '' };
      case 'programs':
        return { department: '', name: '', code: '', course_type: 'UG', entry_type: 'Regular', total_intake: 0 };
      case 'academic-years':
        return { year: '', is_active: true };
      case 'quotas':
        return { name: '', code: '' };
      case 'program-quotas':
        return { program: '', quota: '', seats_allocated: 0 };
      default:
        return {};
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : getInitialForm());
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.patch(`/${endpoint}/${editingItem.id}/`, formData);
      } else {
        await api.post(`/${endpoint}/`, formData);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert(error.response?.data?.detail || 'Error saving data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/${endpoint}/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Error deleting data');
    }
  };

  const renderForm = () => {
    switch (section) {
      case 'institutions':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'campuses':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <select
                className="form-select"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                required
              >
                <option value="">Select Institution</option>
                {dropdownData.institutions?.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'departments':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Campus</label>
              <select
                className="form-select"
                value={formData.campus || ''}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                required
              >
                <option value="">Select Campus</option>
                {dropdownData.campuses?.map((camp) => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'programs':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {dropdownData.departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Type</label>
              <select
                className="form-select"
                value={formData.course_type || 'UG'}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
              >
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Entry Type</label>
              <select
                className="form-select"
                value={formData.entry_type || 'Regular'}
                onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })}
              >
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Intake</label>
              <input
                type="number"
                className="form-input"
                value={formData.total_intake || 0}
                onChange={(e) => setFormData({ ...formData, total_intake: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </>
        );
      case 'academic-years':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="text"
                className="form-input"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g., 2024-2025"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                {' '}Active
              </label>
            </div>
          </>
        );
      case 'quotas':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'program-quotas':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Program</label>
              <select
                className="form-select"
                value={formData.program || ''}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              >
                <option value="">Select Program</option>
                {dropdownData.programs?.map((prog) => (
                  <option key={prog.id} value={prog.id}>{prog.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quota</label>
              <select
                className="form-select"
                value={formData.quota || ''}
                onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                required
              >
                <option value="">Select Quota</option>
                {dropdownData.quotas?.map((quota) => (
                  <option key={quota.id} value={quota.id}>{quota.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Seats Allocated</label>
              <input
                type="number"
                className="form-input"
                value={formData.seats_allocated || 0}
                onChange={(e) => setFormData({ ...formData, seats_allocated: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getColumns = () => {
    switch (section) {
      case 'institutions':
        return [
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
        ];
      case 'campuses':
        return [
          { key: 'institution_name', label: 'Institution' },
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
        ];
      case 'departments':
        return [
          { key: 'institution_name', label: 'Institution' },
          { key: 'campus_name', label: 'Campus' },
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
        ];
      case 'programs':
        return [
          { key: 'institution_name', label: 'Institution' },
          { key: 'campus_name', label: 'Campus' },
          { key: 'department_name', label: 'Department' },
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
          { key: 'course_type_display', label: 'Course Type' },
          { key: 'entry_type_display', label: 'Entry Type' },
          { key: 'total_intake', label: 'Intake' },
        ];
      case 'academic-years':
        return [
          { key: 'year', label: 'Year' },
          { key: 'is_active', label: 'Active', render: (val) => val ? 'Yes' : 'No' },
        ];
      case 'quotas':
        return [
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
        ];
      case 'program-quotas':
        return [
          { key: 'program_name', label: 'Program' },
          { key: 'quota_name', label: 'Quota' },
          { key: 'seats_allocated', label: 'Seats' },
        ];
      default:
        return [];
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'institutions': return 'Institutions';
      case 'campuses': return 'Campuses';
      case 'departments': return 'Departments';
      case 'programs': return 'Programs';
      case 'academic-years': return 'Academic Years';
      case 'quotas': return 'Quotas';
      case 'program-quotas': return 'Program Quota Allocation';
      default: return 'Setup';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1 className="page-title">Master Setup</h1>

        <div className="setup-nav">
          <NavLink to="/setup/institutions" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Institutions</NavLink>
          <NavLink to="/setup/campuses" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Campuses</NavLink>
          <NavLink to="/setup/departments" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Departments</NavLink>
          <NavLink to="/setup/programs" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Programs</NavLink>
          <NavLink to="/setup/academic-years" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Academic Years</NavLink>
          <NavLink to="/setup/quotas" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Quotas</NavLink>
          <NavLink to="/setup/program-quotas" className={({ isActive }) => isActive ? 'setup-tab active' : 'setup-tab'}>Program Quotas</NavLink>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{getSectionTitle()}</h2>
            <button className="btn btn-primary" onClick={() => openModal()}>
              + Add New
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {getColumns().map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={getColumns().length + 1} className="empty-state">No data available</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id}>
                        {getColumns().map((col) => (
                          <td key={col.key}>
                            {col.render ? col.render(item[col.key], item) : item[col.key]}
                          </td>
                        ))}
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => openModal(item)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)} style={{ marginLeft: '8px' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingItem ? `Edit ${getSectionTitle()}` : `Add ${getSectionTitle()}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {renderForm()}
        </form>
      </Modal>
    </div>
  );
};

export default Setup;