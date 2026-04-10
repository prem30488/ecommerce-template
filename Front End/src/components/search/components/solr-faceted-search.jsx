import PropTypes from 'prop-types';
import React from "react";
import componentPack from "./component-pack";

const getFacetValues = (type, results, field, lowerBound, upperBound) =>
	type === "period-range-facet" ? (results.facets[lowerBound] || []).concat(results.facets[upperBound] || []) :
		type === "list-facet" || type === "range-facet" ? results.facets[field] || [] : null;


class SolrFacetedSearch extends React.Component {

	render() {
		const { customComponents, bootstrapCss, query, results, truncateFacetListsAt } = this.props;
		const { onSearchFieldChange, onSortFieldChange, onPageChange, onCsvExport } = this.props;
		const { searchFields, sortFields, start, rows } = query;

		const SearchFieldContainerComponent = customComponents.searchFields.container;
		const ResultContainerComponent = customComponents.results.container;
		const ResultComponent = customComponents.results.result;
		const ResultCount = customComponents.results.resultCount;
		const ResultHeaderComponent = customComponents.results.header;
		const ResultListComponent = customComponents.results.list;
		const ResultPendingComponent = customComponents.results.pending;
		const PaginateComponent = customComponents.results.paginate;
		const PreloadComponent = customComponents.results.preloadIndicator;
		const CsvExportComponent = customComponents.results.csvExport;
		const CurrentQueryComponent = customComponents.searchFields.currentQuery;
		const SortComponent = customComponents.sortFields.menu;

		const resultPending = results.pending
			? <ResultPendingComponent bootstrapCss={bootstrapCss} />
			: null;

		const pagination = query.pageStrategy === "paginate"
			? <PaginateComponent {...this.props} bootstrapCss={bootstrapCss} onChange={onPageChange} />
			: null;

		const preloadListItem = query.pageStrategy === "cursor" && results.docs.length < results.numFound
			? <PreloadComponent {...this.props} />
			: null;

		return (
			<div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', width: '100%' }}>
				{/* ── Sidebar ── */}
				<SearchFieldContainerComponent bootstrapCss={bootstrapCss} onNewSearch={this.props.onNewSearch}>
					{searchFields.map((searchField, i) => {
						const { type, field, lowerBound, upperBound } = searchField;
						const SearchComponent = customComponents.searchFields[type];
						const facets = getFacetValues(type, results, field, lowerBound, upperBound);

						return (
							<SearchComponent
								key={i}
								{...this.props}
								{...searchField}
								bootstrapCss={bootstrapCss}
								facets={facets}
								truncateFacetListsAt={truncateFacetListsAt}
								onChange={onSearchFieldChange}
							/>
						);
					})}
				</SearchFieldContainerComponent>

				{/* ── Results ── */}
				<ResultContainerComponent bootstrapCss={bootstrapCss}>
					{/* Header bar */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						flexWrap: 'wrap',
						background: 'rgba(255,255,255,0.04)',
						border: '1px solid rgba(255,255,255,0.08)',
						borderRadius: 12,
						padding: '12px 18px'
					}}>
						<ResultCount bootstrapCss={bootstrapCss} numFound={results.numFound} />
						{resultPending}
						<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
							<SortComponent bootstrapCss={bootstrapCss} onChange={onSortFieldChange} sortFields={sortFields} />
							{this.props.showCsvExport
								? <CsvExportComponent bootstrapCss={bootstrapCss} onClick={onCsvExport} />
								: null}
						</div>
					</div>

					{/* Active query tags */}
					<CurrentQueryComponent {...this.props} onChange={onSearchFieldChange} />

					{/* Top pagination */}
					{pagination}

					{/* Cards grid */}
					<ResultListComponent bootstrapCss={bootstrapCss}>
						{results.docs.map((doc, i) => (
							<ResultComponent
								bootstrapCss={bootstrapCss}
								doc={doc}
								fields={searchFields}
								key={doc.id || i}
								onSelect={this.props.onSelectDoc}
								resultIndex={i}
								rows={rows}
								start={start}
							/>
						))}
						{preloadListItem}
					</ResultListComponent>

					{/* Bottom pagination */}
					{pagination}
				</ResultContainerComponent>
			</div>
		);
	}
}

SolrFacetedSearch.defaultProps = {
	bootstrapCss: true,
	customComponents: componentPack,
	pageStrategy: "cursor",
	rows: 10,
	searchFields: [
		{ type: "text", field: "*" }
	],
	sortFields: [],
	truncateFacetListsAt: -1,
	showCsvExport: false
};

SolrFacetedSearch.propTypes = {
	bootstrapCss: PropTypes.bool,
	customComponents: PropTypes.object,
	onCsvExport: PropTypes.func,
	onNewSearch: PropTypes.func,
	onPageChange: PropTypes.func,
	onSearchFieldChange: PropTypes.func.isRequired,
	onSelectDoc: PropTypes.func,
	onSortFieldChange: PropTypes.func.isRequired,
	query: PropTypes.object,
	results: PropTypes.object,
	showCsvExport: PropTypes.bool,
	truncateFacetListsAt: PropTypes.number
};

export default SolrFacetedSearch;
