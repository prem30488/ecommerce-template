import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Button,
} from '@mui/material';
import {
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getHomeSections, updateHomeSectionOrder, updateHomeSection } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const HomeManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await getHomeSections();
      setSections(data);
    } catch (error) {
      console.error('Error fetching home sections:', error);
      Alert.error('Failed to load home sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleActive = async (section) => {
    try {
      await updateHomeSection(section.id, { active: !section.active });
      Alert.success(`${section.displayName} ${!section.active ? 'enabled' : 'disabled'}`);
      fetchSections();
    } catch (error) {
      Alert.error('Failed to update status');
    }
  };

  const handleMove = async (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update order values
    const updatedOrderSections = newSections.map((s, idx) => ({
      id: s.id,
      order: idx + 1
    }));

    try {
      setLoading(true);
      await updateHomeSectionOrder(updatedOrderSections);
      setSections(newSections);
      Alert.success('Order updated');
    } catch (error) {
      Alert.error('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (section) => {
    setEditingId(section.id);
    setEditName(section.displayName);
  };

  const saveEdit = async (id) => {
    try {
      await updateHomeSection(id, { displayName: editName });
      Alert.success('Name updated');
      setEditingId(null);
      fetchSections();
    } catch (error) {
      Alert.error('Failed to update name');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>
        Home Page Component Manager
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage the display order and visibility of sections on the main Shop page.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'var(--color-primary-light, #f8fafc)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Component ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Display Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map((section, index) => (
              <TableRow key={section.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.primary' }}>{section.componentName}</TableCell>
                <TableCell>
                  {editingId === section.id ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-primary-border, #cbd5e1)', outline: 'none' }}
                      />
                      <IconButton size="small" color="primary" onClick={() => saveEdit(section.id)}><SaveIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setEditingId(null)}><CancelIcon fontSize="small" /></IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {section.displayName}
                      <IconButton size="small" onClick={() => startEdit(section)}><EditIcon fontSize="12" /></IconButton>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={section.active}
                    onChange={() => handleToggleActive(section)}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="caption" sx={{ ml: 1, color: section.active ? 'success.main' : 'text.disabled' }}>
                    {section.active ? 'Visible' : 'Hidden'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0 || loading}
                      startIcon={<UpIcon />}
                    >
                      Up
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === sections.length - 1 || loading}
                      startIcon={<DownIcon />}
                    >
                      Down
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HomeManager;
