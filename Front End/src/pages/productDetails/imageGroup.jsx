import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

export const ImageGroup = ({id,title,classnm,thums,urls}) => {
  <>
{id}
{title}
{classnm}
{thums}
{urls}         
  
    {/* // <Carousel className={classnm} showArrows={true} showThumbs={thums} autoPlay={true} infiniteLoop={true} stopOnHover={true}> */}
  
            {/* {
            imageURLs && imageURLs.split(",").map((url,index ) => (
              
              // <div style={{width:"100%",height:"100%"}} key={index}>
              //       <img style={{width:"100%",height:"100%"}} src={url}  />
              //       <p style={{color:"white"}}>{title}</p>
              //   </div>
            ))
          } */}
      {/* //    </Carousel> */}
        </>
};



export default ImageGroup;
