import xhr from "xhr";
import solrQuery from "./solr-query";

const MAX_INT = 2147483647;

let server = {};

server.performXhr = function (options, accept, reject = function() { console.warn("Undefined reject callback! "); (console.trace || function() {})(); }) {
	xhr(options, accept, reject);
};

server.submitQuery = (query, callback) => {
	callback({type: "SET_RESULTS_PENDING"});

	const params = solrQuery(query);
	const separator = query.url.includes("?") ? "&" : "?";
	
	server.performXhr({
		url: `${query.url.replace(/\/$/, '')}${separator}${params}`,
		method: "GET"
	}, (err, resp) => {
		if (resp && resp.statusCode >= 200 && resp.statusCode < 300) {
			callback({type: "SET_RESULTS", data: JSON.parse(resp.body)});
		} else {
			console.log("Server error: ", resp ? resp.statusCode : "No response");
		}
	});
};

server.fetchCsv = (query, callback) => {
	const params = solrQuery({...query, rows: MAX_INT}, {
		wt: "csv",
		"csv.mv.separator": "|",
		"csv.separator": ";"
	});
	const separator = query.url.includes("?") ? "&" : "?";

	server.performXhr({
		url: `${query.url.replace(/\/$/, '')}${separator}${params}`,
		method: "GET"
	}, (err, resp) => {
		if (resp && resp.statusCode >= 200 && resp.statusCode < 300) {
			callback(resp.body);
		} else {
			console.log("Server error: ", resp ? resp.statusCode : "No response");
		}
	});
};

export default server;
