//##################################################
//#                                                #
//# RobotTrader                                    #
//#                                                #
//##################################################

const title = 'RobotTrader';
var nbstocks=0;
var nbgains=0;
var nblosses=0;
let myENV = process.env.NODE_ENV; // process.argv[2]; // process.env.NODE_ENV=production

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
//# DoHeader                                       #
//#                                                #
//##################################################

function DoHeader(myTitle)
{
return `
<center>
<h1>
${myTitle}
</h1>
<!--
<ul class="nav">
<li><a href="/api/add">New Stock</a></li>
<li> <a href="/?menu=blog">readme</a></li>
<li> <a href="/blog">blog</a></li>
<li> <a href="/?menu=booking">booking</a></li>
<li> <a href="/?menu=activity">activity</a></li>
<li> <a href="/listing">listing</a></li>
<li> <a href="/dump">dump</a></li>
<li> <a href="/api/login">login</a></li>
</ul> -->
</center>
`;
}

//##################################################
//#                                                #
//# DoFooter                                       #
//#                                                #
//##################################################

function DoFooter()
{
var comment = nbgains > nblosses ? "rocks!" : "sucks!";
var retval = `
<div id="footer">${nbstocks} stocks counted, ${nbgains} gains, ${nblosses} losses, Whooah this robot really ${comment}</div><div style="text-align: center; top_margin: 10">`;
return retval + '</div>';
}

//##################################################
//#                                                #
//# RenderPage                                     #
//#                                                #
//##################################################

function RenderPage(content, dofooter=true)
{
var footer='';

if (dofooter)
		footer = DoFooter();

const header = DoHeader(title);
	
var html =
`
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>

<!-- now we can put cryptic html comments in the server page. -->

<!-- Artificial intelligence is no match for natural stupidity. -->

<style>
${myStyle}
</style>

</head>
<body>
${header}
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

function RenderTable (stockarray, req)
{
var dir = 'asc';
	table = `<div id="tablehead"><a href="/api/login"><img src="/robot.png" width="150 px"/></a></div>`;
	table += '<table id="Schlumpf">\n';

	if (req.params.column === 'symbol')
		(req.params.order === 'asc') ? dir = 'desc' : dir = 'asc';

	table += '<tr><th><a href="/api/results/symbol/'+dir+'">Symbol</a></th>';
	table += '<th>Name</th>';

	if (req.params.column === 'profitloss')
		(req.params.order === 'asc') ? dir = 'desc' : dir = 'asc';
	
	table += '<th><a href="/api/results/profitloss/'+dir+'">Profit %</a></th>';

	if (req.cookies.username !== undefined)
		table += '<th><a href="/api/add">Add</a></th>';

	if (req.params.column === 'trades')
		(req.params.order === 'asc') ? dir = 'desc' : dir = 'asc';

	table += '<th><a href="/api/results/trades/'+dir+'">Trades</a></th>';
	table += '<th>Start</th>';
	table += '<th>End</th></tr>\n';
	nbgains = nblosses = 0;
	
	stockarray.forEach((stock) => 
		{
		table += `<tr>`;
		table += `<td><a href="/?stock=${stock.symbol}">${stock.symbol}</a></td>`;
		table += `<td>${stock.name}</td>`;
		table += `<td>${stock.profitloss}</td>`;

		if (req.cookies.username !== undefined)
			table += `<td><a OnClick="return confirm('Are you sure you want to delete the stock ${stock.symbol} ${stock.name}?');" href="/api/delete/${stock.symbol}">Delete</a></td>`;
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

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('express-session');

const fileUpload = require('express-fileupload');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cookieParser()); 

/*  PASSPORT SETUP  */

const passport = require('passport');

app.use(passport.initialize());

app.get('/api/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

app.use(passport.initialize());

app.get('/api/login', async (req, res, next) => {
   const myform = `
    <form action="/api/login" method="post">
	<div id="tablehead">
        <label>Username:</label>
        <input type="text" name="username" />
        <br/>
         <label>Password:</label>
        <input type="password" name="password" />
        <br />
		<input type="submit" value="Submit" />
      </div>
    </form>
    `;
	console.log('/api/login');
	console.log(JSON.stringify(req.cookies));
	res.clearCookie('username');
	res.clearCookie('password');
	if (req.cookies.username !== undefined)
		res.send(req.cookies.username + ' logged out');
	else
		res.send(RenderPage(myform, false));
});

app.post('/api/login', 
  passport.authenticate('local', { failureRedirect: '/api/error' }),
  function(req, res) {
	res.cookie('username', req.body.username);
	res.cookie('password', req.body.password);
	res.redirect('/api/results/profitloss/desc');
  });

const LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');

passport.use(new LocalStrategy(
  function(username, password, done) 
	{
	var hashedPassword = 'sha1$a1792b4b$1$ac24871942097442e95b456511e2634c213da4a7';
	
	if (passwordHash.verify (password, hashedPassword))
		return done(null, true);
	else
		return done(null, false);
	}
));

app.get('/api/name/:symbol', async (req, res, next) => {
	
	const db = await dbPromise;
	if (req.params.symbol === 'random')
		{
		try 
			{
			const [recordCount] = await Promise.all([
			  db.get('SELECT COUNT(*) AS n FROM Stocks'),
			]);
			console.log(recordCount);
			var m = Math.floor(Math.random() * Math.floor(recordCount.n-1));
						
			const [record] = await Promise.all([
			  db.get(`SELECT symbol, name FROM Stocks LIMIT 1 OFFSET ${m}`),
			]);
			console.log('random');
			console.log(record);
			res.json(record);
			} 
		catch (err) 
			{
			next(err);
			}
		}
	else
		{
		try 
			{
			const [record] = await Promise.all([
			  db.get('SELECT symbol, name FROM Stocks WHERE symbol = ?', req.params.symbol),
			]);
			console.log(req.params.symbol);
			console.log(record);
			res.json(record);
			} 
		catch (err) 
			{
			next(err);
			}
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
	
		res.send(RenderPage(RenderTable(stocks,req)));
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
	
	res.send(RenderPage(RenderTable(stocks,req)));
	
  } catch (err) {
    next(err);
  }
});

app.get('/api/delete/:stock', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try 
		{
		const db = await dbPromise;
		const fs = require('fs');

		await db.all(`delete from Stocks where symbol = '${req.params.stock}'`);
		const [stocks] = await Promise.all([ db.all('SELECT * FROM Stocks') ]);

		fs.unlinkSync(`./stocks/${req.params.stock}.csv`);
		console.log('delete stock '+ req.params.stock);
		
		res.send(RenderPage(RenderTable(stocks,req)));
		} 
	catch (err) 
		{
		next(err);
		}
	}
});

app.get('/api/add', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	const myform = `
    <form "fileupload" action="/api/add" method="post" enctype="multipart/form-data">
    <div  id="tablehead" >
	<h2>Adding a new item to your stocklist</h2>
	<p>Upload a csv file of some 200 daily quotes from <a target="_blank" href="https://finance.yahoo.com">finance.yahoo.com</a></p>
	<table id="Schlumpf">
	<tr><td>Symbol</td><td><input type="text" name="symbol" /></td></tr>
	<tr><td>Name</td><td><input type="text" name="name" /></td></tr>
    <tr><td>*.csv file upload</td><td><input type="file" name="foo" /></td></tr>
    <tr><td colspan=2><input type="submit" name="button" value="add new stock" /></td></tr>
    </table></div></form>
    `;
	
	res.send(RenderPage(myform, false));
	}
});

app.post('/api/add', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try 
		{
		let thefile = req.files.foo;
		let store = __dirname+path.sep+'stocks'+path.sep+req.body.symbol+'.csv';

		console.log(store);
		thefile.mv(store, function(err) 
			{
			if (err)
			  return res.status(500).send(err);
			});
		const db = await dbPromise;
		await db.all(`INSERT INTO Stocks (symbol, name) VALUES ('${req.body.symbol}', '${req.body.name}')`);
		res.redirect(`/?stock=${req.body.symbol}`);
		} 
	catch (err) 
		{
		next(err);
		}
	}
});

app.use('/stocks', express.static(__dirname + '/stocks'));

// Serve static files for the React frontend app

if (myENV === "production")
	app.use(express.static(path.join(__dirname, 'client/build')));
else
	app.use(express.static(path.join(__dirname, 'client/public')));
	
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.

// Anything that doesn't match the above, send back index.html
if (myENV === "production")
	app.get('*', (req, res) => {res.sendFile(path.join(__dirname + '/client/build/index.html'))});
else
	app.get('*', (req, res) => {res.sendFile(path.join(__dirname + '/client/public/index.html'))});
	
const port = process.env.PORT || 5000;
app.listen(port);

console.log(`RobotTrader server listening on ${port}`);
