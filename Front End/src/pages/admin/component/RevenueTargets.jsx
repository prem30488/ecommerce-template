import React, { useState, useEffect } from 'react';
import { fetchDashboardGoals, updateDashboardGoals } from '../../../util/APIUtils';
import { getRegionalSettings, formatCurrency } from '../../../util/regionalSettings';
import Alert from 'react-s-alert';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const RevenueTargets = ({ kpiData }) => {
  const settings = getRegionalSettings();
  const [goals, setGoals] = useState({
    revenueTarget: 100, // Default placeholders
    ordersTarget: 10,
    customersTarget: 5
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...goals });

  useEffect(() => {
    fetchDashboardGoals()
      .then(res => {
        if (res) {
          setGoals(res);
          setFormData({
            revenueTarget: res.revenueTarget,
            ordersTarget: res.ordersTarget,
            customersTarget: res.customersTarget
          });
        }
      })
      .catch(err => console.error("Error fetching goals:", err));
  }, []);

  const handleSave = () => {
    updateDashboardGoals(formData)
      .then(res => {
        setGoals(res);
        setIsEditing(false);
        Alert.success('Targets updated successfully');
      })
      .catch(err => Alert.error('Failed to update targets'));
  };

  const calculateProgress = (current, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const revenueProgress = calculateProgress(kpiData.purchaseRevenue, goals.revenueTarget);
  const ordersProgress = calculateProgress(kpiData.ecommercePurchases, goals.ordersTarget);
  const customersProgress = calculateProgress(kpiData.firstTimePurchasers, goals.customersTarget);

  const ProgressBar = ({ label, current, target, progress, color, isCurrency = false }) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
        <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '1rem' }}>{label}</span>
        <span style={{ fontWeight: '600', color: '#64748B', fontSize: '0.9rem' }}>{progress}%</span>
      </div>
      <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: color, 
          borderRadius: '10px',
          transition: 'width 0.8s ease'
        }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
        <span>{isCurrency ? formatCurrency(current) : Number(current || 0).toLocaleString()}</span>
        <span>Target: {isCurrency ? formatCurrency(target) : Number(target || 0).toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <div className="section-card" style={{ padding: '24px', position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '25px' }}>
        <div>
          <h3 className="section-title">Revenue Targets</h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Monthly progress toward goals
          </p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-view-all"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaEdit /> Edit Targets
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaSave size={12}/> Save
            </button>
            <button onClick={() => setIsEditing(false)} style={{ background: '#64748B', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaTimes size={12}/> Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px', color: '#475569' }}>
               Revenue Target ({settings.currency})
            </label>
            <input 
              type="number" 
              value={formData.revenueTarget} 
              onChange={e => setFormData({ ...formData, revenueTarget: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px', color: '#475569' }}>Orders Target</label>
            <input 
              type="number" 
              value={formData.ordersTarget} 
              onChange={e => setFormData({ ...formData, ordersTarget: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px', color: '#475569' }}>New Customers Target</label>
            <input 
              type="number" 
              value={formData.customersTarget} 
              onChange={e => setFormData({ ...formData, customersTarget: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '10px' }}>
          <ProgressBar 
            label="Monthly Revenue" 
            current={kpiData.purchaseRevenue} 
            target={goals.revenueTarget} 
            progress={revenueProgress} 
            color="#C05621"
            isCurrency={true}
          />
          <ProgressBar 
            label="Orders" 
            current={kpiData.ecommercePurchases} 
            target={goals.ordersTarget} 
            progress={ordersProgress} 
            color="#0D9488"
          />
          <ProgressBar 
            label="New Customers" 
            current={kpiData.firstTimePurchasers} 
            target={goals.customersTarget} 
            progress={customersProgress} 
            color="#1A535C"
          />
        </div>
      )}
    </div>
  );
};

export default RevenueTargets;
