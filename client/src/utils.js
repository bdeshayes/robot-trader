import { csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";

var stockSymbol;
var stockName;

function parseData(parse) {
	return function(d) {
		d.date = parse(d.Date);
		d.open = +d.Open; // coerce strings to numbers
		d.high = +d.High;
		d.low = +d.Low;
		d.close = +d.Close; // Date,Open,High,Low,Close,Adj Close,Volume
		d.volume = +d.Volume; // convert header row to lowercase column names
		return d;
	};
}

const parseDate = timeParse("%Y-%m-%d");

function getUrlVars() {
    var vars = {};
    /*var parts = */window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}

export function getData() 
{
stockSymbol = getUrlParam('stock','AAPL');

fetch('/api/name/'+stockSymbol)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) 
	  {
		stockName = data.name;
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });

document.title = stockSymbol;
		
	const promiseMSFT = fetch('/stocks/'+stockSymbol+'.csv') 
		.then(response => response.text())
		.then(data => csvParse(data, parseData(parseDate)))
	return promiseMSFT;
}

export {stockSymbol, stockName};