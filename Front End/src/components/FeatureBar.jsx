import React from "react";
import { ChartBar, Leaf, ShieldCheck } from "phosphor-react";
import "./featurebar.css";

const FeatureBar = () => {
    return (
        <div className="feature-bar-container">
            <div className="feature-bar-content">
                <div className="feature-item">
                    <ChartBar size={28} color="#334155" weight="regular" />
                    <span>Powerful Results</span>
                </div>
                <div className="feature-item">
                    <Leaf size={28} color="#334155" weight="regular" />
                    <span>Premium Ingredients</span>
                </div>
                <div className="feature-item">
                    <ShieldCheck size={28} color="#334155" weight="regular" />
                    <span>Trusted Formula</span>
                </div>
            </div>
            <div className="feature-bar-divider"></div>
        </div>
    );
};

export default FeatureBar;
