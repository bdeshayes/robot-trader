import { csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";

var stockSymbol;
var stockName;
export {stockSymbol, stockName};

//##################################################
//#                                                #
//# parseData                                      #
//#                                                #
//##################################################

function parseData(parse) {
	return function(d) 
	{
	d.date = parse(d.Date);
	d.open = +d.Open; // coerce strings to numbers
	d.high = +d.High;
	d.low = +d.Low;
	d.close = +d.Close; // Date,Open,High,Low,Close,Adj Close,Volume
	d.volume = +d.Volume; // convert header row to lowercase column names	
	
	delete d.Date;
	delete d.Open; 
	delete d.High;
	delete d.Low;
	delete d.Close; 
	delete d.Volume; // remove duplicate uppercase column names	from *.csv file
	return d;
	};
}

const parseDate = timeParse("%Y-%m-%d");

//##################################################
//#                                                #
//# getUrlVars                                     #
//#                                                #
//##################################################

function getUrlVars() {
    var vars = {};
    /*var parts = */window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

//##################################################
//#                                                #
//# getUrlParam                                    #
//#                                                #
//##################################################

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}

//##################################################
//#                                                #
//# getData                                        #
//#                                                #
//##################################################

export const getData = async () => {
stockSymbol = getUrlParam('stock','random');
console.log('stockSymbol='+stockSymbol);
const mystock = await fetch('/api/name/'+stockSymbol)
const json = await mystock.json();

console.log(json);
stockSymbol = json.symbol;
stockName = json.name;
document.title = stockSymbol;

console.log('fetching '+stockSymbol);
const mydata = await fetch('/stocks/'+stockSymbol+'.csv') 
const text = await mydata.text();

var retval = csvParse(text, parseData(parseDate));
console.log('retval');
console.log(retval);
return retval;
}
