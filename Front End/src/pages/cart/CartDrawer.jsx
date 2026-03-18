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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Cart } from './cart';

import { ShopContext } from '../../context/shop-context';
import { useContext,useEffect } from 'react';

export default function CartDrawer() {
    let countCart = 0;
    const { cartItems,martItems,lartItems, getTotalCartCount } = useContext(ShopContext);

    useEffect(() => {
        const getData = async () => {
        try {
          getCountCart();
          } catch (err) {
          }
        };
        getData();
      }, []);  
    
    
    
      const getCountCart = () => {
        countCart=0;
            
        if(cartItems.length>0){
          for(const i in cartItems){
            if (cartItems[i] > 0) {
              countCart=countCart + cartItems[i];
            }
          }
        }
        if(martItems.length>0){
          for(const j in martItems){
            if (martItems[j] > 0) {
              countCart=countCart + martItems[j];
            }
          }
        }
        if(lartItems.length>0){
          for(const k in lartItems){
            if (lartItems[k] > 0) {
              countCart=countCart + lartItems[k];
            }
          }
        }
      return countCart;
      }
    
    const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  return (
    
        
      
        <React.Fragment key={'right'}>
          <i className="fa" onClick={toggleDrawer('right', true)} style={{fontSize:"24px"}}>&#xf07a;</i><span className='badge badge-warning' id='lblCartCount'> {getTotalCartCount()} </span>
          <Drawer
            anchor={'right'}
            open={state['right']}
            onClose={toggleDrawer('right', false)}
            PaperProps={{
                sx: { width: "35%" },
              }}
          >
            <Cart></Cart>
            
          </Drawer>
        </React.Fragment>
      
    
  );
}