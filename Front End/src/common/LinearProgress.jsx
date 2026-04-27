import React from 'react';
import { LinearProgress as MuiLinearProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * A LinearProgress component that uses theme variables --color-primary and --color-secondary.
 * It is positioned fixed at the top of the page.
 */
const StyledLinearProgress = styled(MuiLinearProgress)(() => ({
  height: 4,
  backgroundColor: 'var(--color-secondary-light, rgba(0, 0, 0, 0.1))',
  '& .MuiLinearProgress-bar': {
    backgroundColor: 'var(--color-primary)',
  },
}));

const LinearProgress = ({ loading = true }) => {
  if (!loading) return null;

  return (
    <Box 
      sx={{ 
        width: '100%', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 10000,
        pointerEvents: 'none' // Ensure it doesn't block clicks
      }}
    >
      <StyledLinearProgress />
    </Box>
  );
};

export default LinearProgress;
