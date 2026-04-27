import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getAppSettings, saveAppSettings } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const CompanyInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    google_map_link: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings();
        if (data) {
          setSettings({
            google_map_link: data.google_map_link || '',
          });
        }
      } catch (error) {
        console.error('Error fetching app settings:', error);
        Alert.error('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAppSettings(settings);
      Alert.success('Company information updated successfully');
    } catch (error) {
      console.error('Error saving app settings:', error);
      Alert.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        Company Information & Map
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Google Map Embed URL"
              name="google_map_link"
              value={settings.google_map_link}
              onChange={handleChange}
              placeholder="Paste the iframe src URL here (e.g., https://www.google.com/maps/embed?...)"
              helperText="Leave empty to hide the Google Map from the website."
              variant="outlined"
            />
          </Grid>
          
          {settings.google_map_link && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Map Preview:
              </Typography>
              <Box sx={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <iframe
                  src={settings.google_map_link}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  title="Map Preview"
                ></iframe>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyInfo;
