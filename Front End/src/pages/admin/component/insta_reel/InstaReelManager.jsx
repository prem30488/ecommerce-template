import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, Switch, FormControlLabel, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { MdEdit, MdDelete, MdAdd, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { getInstaReels, createInstaReel, updateInstaReel, deleteInstaReel, updateInstaReelOrder } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const InstaReelManager = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ url: '', caption: '', tag: '', active: true });

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await getInstaReels();
      setReels(res || []);
    } catch (error) {
      console.error('Failed to load reels:', error);
      Alert.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ url: item.url, caption: item.caption, tag: item.tag, active: item.active });
    } else {
      setEditItem(null);
      setFormData({ url: '', caption: '', tag: '', active: true });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  const handleFormSubmit = async () => {
    if (!formData.url || !formData.caption) {
      Alert.error('URL and Caption are required');
      return;
    }
    try {
      setLoading(true);
      if (editItem) {
        await updateInstaReel(editItem.id, formData);
        Alert.success('Reel updated successfully');
      } else {
        await createInstaReel(formData);
        Alert.success('Reel added successfully');
      }
      handleCloseDialog();
      fetchReels();
    } catch (error) {
      console.error('Error saving reel:', error);
      Alert.error('Failed to save reel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    try {
      setLoading(true);
      await deleteInstaReel(id);
      Alert.success('Reel deleted successfully');
      fetchReels();
    } catch (error) {
      Alert.error('Failed to delete reel');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === reels.length - 1) return;

    const newReels = [...reels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap orderIndex
    const tempOrder = newReels[index].orderIndex;
    newReels[index].orderIndex = newReels[targetIndex].orderIndex;
    newReels[targetIndex].orderIndex = tempOrder;

    // Swap elements in array
    const tempElement = newReels[index];
    newReels[index] = newReels[targetIndex];
    newReels[targetIndex] = tempElement;

    setReels(newReels);

    try {
      await updateInstaReelOrder(newReels.map(r => ({ id: r.id, orderIndex: r.orderIndex })));
    } catch (error) {
      Alert.error('Failed to update order');
      fetchReels(); // Revert on failure
    }
  };

  const toggleActive = async (item, checked) => {
    try {
      await updateInstaReel(item.id, { ...item, active: checked });
      Alert.success('Status updated');
      fetchReels();
    } catch (error) {
      Alert.error('Failed to update status');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Insta Reel Manager
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<MdAdd />} 
          onClick={() => handleOpenDialog()}
          disabled={loading}
          sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
        >
          Add New Reel
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Preview/URL</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Caption</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reels.map((reel, index) => (
                <TableRow key={reel.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px' }}>
                      <IconButton size="small" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                        <MdArrowUpward fontSize="inherit" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleMove(index, 'down')} disabled={index === reels.length - 1}>
                        <MdArrowDownward fontSize="inherit" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <a href={reel.url} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none' }}>
                      {reel.url.length > 30 ? reel.url.substring(0, 30) + '...' : reel.url}
                    </a>
                  </TableCell>
                  <TableCell>{reel.tag}</TableCell>
                  <TableCell>{reel.caption.length > 50 ? reel.caption.substring(0, 50) + '...' : reel.caption}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reel.active}
                          onChange={(e) => toggleActive(reel, e.target.checked)}
                          size="small"
                        />
                      }
                      label={reel.active ? 'Active' : 'Hidden'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(reel)}>
                      <MdEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(reel.id)}>
                      <MdDelete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reels.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No Instagram Reels found. Click 'Add New Reel' to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Insta Reel' : 'Add Insta Reel'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Instagram Post/Reel URL"
              fullWidth
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. https://www.instagram.com/p/abcde123/"
              required
            />
            <TextField
              label="Tag (Small label)"
              fullWidth
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              placeholder="e.g. Pre-Workout"
            />
            <TextField
              label="Caption"
              fullWidth
              multiline
              rows={3}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Write an engaging caption..."
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Active (Display on website)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" sx={{ bgcolor: '#4f46e5' }} disabled={loading}>
            {editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstaReelManager;
