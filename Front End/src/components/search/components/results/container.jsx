import PropTypes from 'prop-types';
import React from "react";

class ResultContainer extends React.Component {
  render() {
    return (
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {this.props.children}
      </div>
    );
  }
}

ResultContainer.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultContainer;
