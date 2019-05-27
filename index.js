//##################################################
//#                                                #
//# RobotTrader                                    #
//#                                                #
//##################################################

const title = 'RobotTrader';
var nbstocks=0;
var nbgains=0;
var nblosses=0;

var myStyle =
`
#Schlumpf {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}
#Schlumpf div {
    margin: auto;
    width: 50%;
    text-align: center;
    border: 3px solid green;
    padding: 10px;
}
#tablehead {
    margin: auto;
    width: 50%;
    text-align: center;
}
#Schlumpf table {
    margin: auto;
//    width: auto;
    padding: 10px;
} 
#Schlumpf td, #Schlumpf th {
    border: 1px solid #ddd;
    padding: 8px;
}

#Schlumpf tr:nth-child(even){background-color: #f2f2f2;}

#Schlumpf tr:hover {background-color: #ddd;}

#Schlumpf th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #4CAF50;
    color: white;
}

#content a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
}
#content a:hover 
{
background-color: black;
color: white;
}
.nav 
{
align: center;
margin: 10px 10px;
padding-top: 8px;
padding-bottom: 10px;
padding-left: 8px;
background: none;
}

.nav li 
{
list-style-type: none;
display: inline;
padding: 10px 30px;
background-color: #e67e22;
margin-left: -11px;
font-size: 120%;
}

.nav li:first-child
{
margin-left: 0;
border-top-left-radius: 10px !important;
border-bottom-left-radius: 10px !important;
}

.nav li:last-child
{
margin-right: 0px;
border-top-right-radius: 10px !important;
border-bottom-right-radius: 10px !important;
}

.nav a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
color: white;
border-bottom: 0;
padding: 10px 10px;
}

.nav a:hover 
{
text-decoration: none;
background: #9b59b6;
padding: 10px 10px;
}

ul.nav li a.current 
{
text-decoration: none;
background: #e74c3c;
padding: 10px 10px;
}

#footer
{
padding-top: 12px;
padding-bottom: 12px;
text-align: center;
background-color: black;
color: white;
font-style: italic;
font-weight: bold;
}
`;

//##################################################
//#                                                #
//# DoFooter                                       #
//#                                                #
//##################################################

function DoFooter()
{
var comment = nbgains > nblosses ? "rocks!" : "sucks!";
return `
<div id="footer">${nbstocks} stocks counted, ${nbgains} gains, ${nblosses} losses, Wooa this robot really ${comment}</div>    
`;
}

//##################################################
//#                                                #
//# RenderPage                                     #
//#                                                #
//##################################################

function RenderPage(content)
{
const footer = DoFooter();
var html =
`
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<style>
${myStyle}
</style>
</head>
<body>
${content}
${footer}
</body>
</html>
`;
return html;
}

//##################################################
//#                                                #
//# RenderTable                                    #
//#                                                #
//##################################################

function RenderTable (stockarray)
{
	table = `<div id="tablehead"><img src="/public/robot.png" width="150 px"/><h2>Robot Trader</h2></div>`;
	table += `<div id="content"><table id="Schlumpf">`;

	table += '<table id="Schlumpf">\n';
	table += '<tr><th><a href="/api/results/symbol/asc">Symbol</a></th>';
	table += '<th>Name</th>';
	table += '<th><a href="/api/results/profitloss/desc">Profit %</a></th>';
	table += '<th><a href="/api/results/trades/asc">Trades</a></th>';
	table += '<th>Start</th>';
	table += '<th>End</th></tr>\n';
	nbgains = nblosses = 0;
	
	stockarray.forEach((stock) => 
		{
		table += `<tr>`;
		table += `<td><a href="/?stock=${stock.symbol}">${stock.symbol}</a></td>`;
		table += `<td>${stock.name}</td>`;
		table += `<td>${stock.profitloss}</td>`;
		table += `<td>${stock.trades}</td>`;
		table += `<td>${stock.startdate}</td>`;
		table += `<td>${stock.enddate}</td></tr>\n`;  

		stock.profitloss > 0.0 ? nbgains++ : nblosses++;
		});
	nbstocks = stockarray.length;
	table += `</table></div>`;
return table;
}

var express = require("express");
const path = require('path');
var sqlite = require("sqlite");
var ejs = require("ejs");
//var cors = require("cors");

/*import { express } from "express";
import { sqlite } from "sqlite";
import { ejs } from "ejs";
import { cors } from "cors";
*/
const app = express();
//app.use(cors());
process.env.PWD = process.cwd();

const dbPromise = sqlite.open('./database.sqlite', { Promise });

/*
CREATE TABLE "Stocks" (
	"symbol"	TEXT NOT NULL,
	"name"	TEXT,
	"profitloss"	REAL,
	"trades"	INTERGER,
	"startdate"	TEXT,
	"enddate"	TEXT,
	"method"	TEXT,
	PRIMARY KEY("symbol")
);*/

//app.engine('html', require('ejs').renderFile);
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use("/public", express.static(__dirname + '/public'));
//app.use("/public", express.static(process.env.PWD + '/public'));
console.log ('__dirname = '+ __dirname);

app.get('/api/name/:symbol', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const [name] = await Promise.all([
      db.get('SELECT name FROM Stocks WHERE Symbol = ?', req.params.symbol),
    ]);
	console.log(name);
    res.json(name);
  } catch (err) {
    next(err);
  }
});

app.get('/api/result/:stock/:profitloss/:trades/:startdate/:enddate', async (req, res, next) => 
	{
	try 
		{
		console.log('result stock '+ req.params.stock + ' profit/loss '+ req.params.profitloss + ' startdate '+ req.params.startdate + ' enddate '+ req.params.enddate);
	
		const db = await dbPromise;

		await db.all(`update Stocks set profitloss = ${req.params.profitloss}, trades = ${req.params.trades}, startdate = '${req.params.startdate}' , enddate = '${req.params.enddate}' where symbol = '${req.params.stock}'`);
		const [stocks] = await Promise.all([ db.all('SELECT * FROM Stocks') ]);
	
		res.send(RenderPage(RenderTable(stocks)));
		} 
  catch (err) 
	{
    next(err);
	}
});

app.get('/api/results/:column/:order', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const [stocks] = await Promise.all([
      db.all(`SELECT * FROM Stocks order by ${req.params.column} ${req.params.order}`)
    ]);
	
	res.send(RenderPage(RenderTable(stocks)));
	
  } catch (err) {
    next(err);
  }
});
/*
process.env.PWD = process.cwd()
at the very beginning of your web.js
let you access files easily.
You can do
app.use('/heatcanvas',express.static(process.env.PWD+'/heatcanvas'));
instead of using
__dirname*/

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/public/index.html'));
//  res.sendFile(path.join(process.env.PWD + '/client/public/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`RobotTrader server listening on ${port}`);
