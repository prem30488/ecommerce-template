import PropTypes from 'prop-types';
import React from "react";

class ResultHeader extends React.Component {
  render() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        {this.props.children}
      </div>
    );
  }
}

ResultHeader.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultHeader;
