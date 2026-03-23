import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
 import SolrFacetedSearch from "./components/solr-faceted-search";
 import defaultComponentPack from "./components/component-pack";
 import { SolrClient } from "./api/solr-client";
import {view} from '../../util/APIUtils';

// export default SolrFacetedSearch;

 export {
 	SolrFacetedSearch,
 	defaultComponentPack,
 	SolrClient
 };

 // The search fields and filterable facets you want
const fields = [
    //{label: "All text fields", field: "*", type: "text"},
    {label: "Id", field: "id", type: "text"},
    {label: "Title", field: "title", type: "text"},
    {label: "Categories", field: "categories", type: "list-facet"},
    {label: "Audience", field: "audience", type: "list-facet"},
     {label: "Price", field: "price", type: "range-facet"},
    {label: "Bestseller", field: "bestseller", type: "list-facet"},
    {label: "Featured", field: "featured", type: "list-facet"},
    {label: "Discount", field: "discount", type: "list-facet"},
    {label: "updated_at", field: "updated_at", type: "text"},
  ];
  
  // The sortable fields you want
  const sortFields = [
    {label: "Name", field: "name"},
    {label: "Title", field: "title"},
    {label: "Price", field: "price"},
    {label: "Discount", field: "discount"}
  ];
  
  
class AdvancedSearch extends Component {
    constructor(props){
        super(props);
        this.state = {
            test: false,
        };
        this.editUser = this.editUser.bind(this);
    }
    render() {
        return (        
          <>
          <div style={{paddingTop:"150px"}}></div> 
          <div className="row">
    <div className="col-lg-2">
        <div className="row">
            <div className="col-sm-10">
                <ul style={{marginLeft: "50px"}}>
                    
                </ul>
            </div>
            <div className="col-sm10">
                
            </div>
        </div>
    </div>
    <div className="col-lg-9">
    <div className='shop'style={{position:"relative", maxHeight:"100%", width:"100%", height:"100%"}}>
          <div id="solrDiv" className="solrDiv" style={{position:"relative", maxHeight:"100%", width:"100%", height:"100%"}}> 
          </div></div>
    </div>
</div>
</>
        )
    }
    editUser(id) {
    //     view(id);
    //     window.localStorage.setItem("id", id);
    //     this.props.history.push('/viewProfile');
    //     setTimeout(function(){
		// 	window.location.reload(1);
		//  }, 3000);
    }  
    componentDidMount() { 
        this.timer = setInterval(
            () => this.setState(prevState => ({ test: !prevState.test })),
            2000,
        );
        
        // Create root for manual rendering
        const container = document.getElementById("solrDiv");
        if (container && !this.solrRoot) {
            this.solrRoot = createRoot(container);
        }

        new SolrClient({
              idField:"id",
              url: "http://localhost:8983/solr/hanley/select",
              searchFields: fields,
              sortFields: sortFields,
              pageStrategy: "paginate",
        
              onChange: (state, handlers) => {
                  if (this.solrRoot) {
                      this.solrRoot.render(
                          <React.Fragment>
                            <SolrFacetedSearch 
                              {...state}
                              {...handlers}
                              bootstrapCss={true}
                              onSelectDoc={(doc) => this.editUser(doc.id)}
                            />
                          </React.Fragment>
                      );
                  }
              }
          }).initialize();
        }    
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
        if (this.solrRoot) {
            // In React 18, we should unmount the root if needed, 
            // but for this specific pattern it might be optional
            // this.solrRoot.unmount();
        }
    }
}


  
  export default AdvancedSearch;
