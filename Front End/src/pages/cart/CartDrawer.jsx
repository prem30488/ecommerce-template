import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { PremiumCart } from './PremiumCart';
import { FaShoppingCart } from "react-icons/fa";
import { ShopContext } from '../../context/shop-context';
import { useContext, useEffect } from 'react';

export default function CartDrawer() {
  const { cartItems, martItems, lartItems, getTotalCartCount } = useContext(ShopContext);

  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const totalCount = getTotalCartCount();

  return (
    <React.Fragment>
      <span
        className="cart-header-trigger"
        onClick={toggleDrawer('right', true)}
        title="View Cart"
        style={{ fontSize: "24px", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginRight: "10px" }}
      >
        <FaShoppingCart style={{ color: '#0ea5e9' }} />
        <span className='badge badge-warning' id='lblCartCount' style={{ marginLeft: 6 }}>
          {totalCount}
        </span>
      </span>
      <div>
        <Drawer
          anchor={'right'}
          open={state['right']}
          onClose={toggleDrawer('right', false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: '550px' },
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.1)',
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden'
            },
          }}
        >
        <PremiumCart onClose={toggleDrawer('right', false)} />
        </Drawer>
      </div>
    </React.Fragment>
  );
}
