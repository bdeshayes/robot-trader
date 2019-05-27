//##################################################
//#                                                #
//# RobotTrader                                    #
//#                                                #
//##################################################

const title = 'RobotTrader';
var nbstocks=0;
var nbgains=0;
var nblosses=0;


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

<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
<link rel="stylesheet" type="text/css" href="/server.css" />

<!-- now we can put cryptic html comments in the server page -->
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
	table = `<div id="tablehead"><img src="/robot.png" width="150 px"/><h2>Robot Trader</h2></div>`;
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

const app = express();

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

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

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

app.use('/stocks', express.static(__dirname + '/stocks'));

let myENV = process.argv[2];

// Serve static files for the React frontend app
if (myENV === "DEV")
	app.use(express.static(path.join(__dirname, 'client/public')));

if (myENV === "PROD")
	app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.

// Anything that doesn't match the above, send back index.html
if (myENV === "DEV")
	app.get('*', (req, res) => {res.sendFile(path.join(__dirname + '/client/public/index.html'))});

if (myENV === "PROD")
	app.get('*', (req, res) => {res.sendFile(path.join(__dirname + '/client/build/index.html'))});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`RobotTrader server listening on ${port}`);
