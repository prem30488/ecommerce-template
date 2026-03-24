import React, { Component } from 'react';
import LeadershipManager from './LeadershipManager';

class LeadershipManagementPage extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
    render() {
        return (
            <div className="container" style={{maxWidth:'100%'}}>
               <LeadershipManager />
            </div>
        );
    }
}

export default LeadershipManagementPage;
