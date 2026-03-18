import React, { useContext,useId, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchMenu = (props) =>{
    const [searchinput, setSearchinput] = useState(props?.value ?? '');
    const navigate = useNavigate();
    

    
    return (
        <div style={{width:'250px'}}>
        <button style={{float: "right", verticalAlign:"top" ,width:"50px",position: "absolute", paddingTop: "10px", paddingLeft:"10px"}} 
          
          onClick={() => navigate("/Search/"+searchinput)}> <svg  viewBox="0 0 250.313 250.313" width="10">
				<path d="M244.186,214.604l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 c10.7-16.231,16.945-35.66,16.945-56.554C205.822,46.075,159.747,0,102.911,0S0,46.075,0,102.911 c0,56.835,46.074,102.911,102.91,102.911c20.895,0,40.323-6.245,56.554-16.945c0.269,0.301,0.47,0.64,0.759,0.929l54.38,54.38 c8.169,8.168,21.413,8.168,29.583,0C252.354,236.017,252.354,222.773,244.186,214.604z M102.911,170.146 c-37.134,0-67.236-30.102-67.236-67.235c0-37.134,30.103-67.236,67.236-67.236c37.132,0,67.235,30.103,67.235,67.236 C170.146,140.044,140.043,170.146,102.911,170.146z" />
			</svg></button>
        <input placeholder="What's on your mind?" id="search" value={searchinput} onInput={e => setSearchinput(e.target.value)} type="text" className="form-control form-control-solid mb-3 mb-lg-0" autoComplete="on" 
          style={{width:"200px"}}>
          </input>
          
          </div>
    )
}

export default SearchMenu;
