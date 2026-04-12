import PropTypes from 'prop-types';
import React from "react";

class ResultContainer extends React.Component {
  render() {
    return (
      <div className="solr-results-container">
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
