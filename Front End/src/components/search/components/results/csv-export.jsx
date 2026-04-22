import React from "react";
import cx from "classnames";

export default function (props) {
	const { bootstrapCss, onClick } = props;
	return (
		<button 
			onClick={onClick} 
			className="as-cyber-btn"
			style={{ '--content': `'${props.label || "Export CSV"}'` }}
		>
			<div className="left"></div>
			{props.label || "Export CSV"}
			<div className="right"></div>
		</button>
	);
}
