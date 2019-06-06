var sqlite = require("sqlite");
var fs = require('fs-extra');
const puppeteer = require('puppeteer');
var sprintf = require('sprintf-js').sprintf,
    vsprintf = require('sprintf-js').vsprintf;

const dbPromise = sqlite.open('./database.sqlite', { Promise });

DoAll();
//process.exit(1);

//##################################################
//#                                                #
//# InitDB                                         #
//#                                                #
//##################################################

async function InitDB()
{
const db = await dbPromise;
await db.all(`drop table if exists 'Stocks'`);
await db.all(
`CREATE TABLE "Stocks" 
	(
	"symbol"	TEXT NOT NULL,
	"name"	TEXT,
	"profitloss"	REAL,
	"trades"	INTERGER,
	"startdate"	TEXT,
	"enddate"	TEXT,
	"method"	TEXT,
	PRIMARY KEY("symbol")
	);`);
} 

async function DoAll()
{
fs.emptyDirSync('./stocks')

await InitDB();

var array = fs.readFileSync('stocklist.txt').toString().split("\r\n"); // "\n" only if not MS Windows

for (i in array) 
	{
	if (array[i] !== '')
		{		
		if (!fs.existsSync('./stocks/'+array[i]+'.csv'))
			{
			await DoScraper (array[i]);
			await UpdateResults ('http://localhost:3000/?stock='+array[i]);
			}
		}
	}
console.log("All done!");
}

//##################################################
//#                                                #
//# sleep                                          #
//#                                                #
//##################################################

function sleep( millisecondsToWait )
{
var now = new Date().getTime();
while ( new Date().getTime() < now + millisecondsToWait )
	{
	/* do nothing; this will exit once it reaches the time limit */
	/* if you want you could do something and exit */
	}
}

//##################################################
//#                                                #
//# DoScraper                                      #
//#                                                #
//##################################################

async function DoScraper(stock)
{
var filename = './stocks/'+stock+'.csv';
let url = 'https://finance.yahoo.com/quote/'+stock+'/history?p='+stock;
console.log('DoScraper('+stock+')');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url, {waitUntil: 'networkidle0'});

await page.keyboard.down('Control');
await page.keyboard.press('End'); // gets us 200 points instead od 100
//console.log("waiting 1 sec");
sleep (1000);
await page.keyboard.press('End'); 
//console.log("waiting 1 sec");
sleep (1000);
await page.keyboard.press('End'); 
//console.log("waiting 1 sec");
sleep (1000);
await page.keyboard.up('Control');

const html = await page.content();
var name = 'undefined';

try 
	{
	const re = /<h1.*?>(?<title>.*?)\s+\(.*?\)<\/h1>/;
	const result = re.exec(html);
    name = result.groups.title.replace(/&amp;/g, '&');
	console.log(stock + " is " + result.groups.title);
	} 
catch (err) 
	{
	//fs.writeFileSync('badstock'.html, html, 'utf-8');
    console.log(err);
	}

var myRegexp = new RegExp('<tr.*?><td.*?><span.*?>(?<date>.*?)</span></td><td.*?><span.*?>(?<open>.*?)</span></td><td.*?><span.*?>(?<high>.*?)</span></td><td.*?><span.*?>(?<low>.*?)</span></td><td.*?><span.*?>(?<close>.*?)</span></td><td.*?><span.*?>(?<aclose>.*?)</span></td><td.*?><span.*?>(?<volume>.*?)</span></td>', 'gm');
const matches = html.matchAll(myRegexp);
var i=0;
var datum =[];
for (const match of matches) 
	{
	if (match.groups.date.match(/\*Close price/i))
		break;

	if (!match.groups.open.match(/Dividend/i))
		{
		i++;
		var data = "";
		let date = new Date(match.groups.date);        
		data += date.getFullYear() + "-";
		data += sprintf("%02d", date.getMonth()+1) + "-";
		data += sprintf("%02d", date.getDate()) + ",";
		data += match.groups.open.replace(/,/g, '') + ",";
		data += match.groups.high.replace(/,/g, '') + ",";
		data += match.groups.low.replace(/,/g, '') + ",";
		data += match.groups.close.replace(/,/g, '') + ",";
		data += match.groups.volume.replace(/,/g, '') + "\n";
		datum.push(data);
		}
	}

var data = "Date,Open,High,Low,Close,Volume\n";
datum.reverse();

for (index = 0; index < datum.length; index++) 
	{ 
	data += datum[index]; 
	} 

console.log(datum.length + " rows saved to "+filename);
fs.writeFileSync(filename, data, 'utf-8');

const db = await dbPromise;
await db.all(`INSERT INTO Stocks (symbol, name, profitloss, startdate, enddate) VALUES ('${stock}', '${name}', 0, '', '')`);

await browser.close();
}

//##################################################
//#                                                #
//# UpdateResults                                  #
//#                                                #
//##################################################

async function UpdateResults (url) 
{
const {browser, page} = await startBrowser();
await page.goto(url, {waitUntil: 'networkidle0'});

const mylink = await findByLink(page, "Update results");
await page.goto(mylink, {waitUntil: 'networkidle0'});
await closeBrowser(browser);
}

//##################################################
//#                                                #
//# startBrowser                                   #
//#                                                #
//##################################################

async function startBrowser() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return {browser, page};
}

//##################################################
//#                                                #
//# closeBrowser                                   #
//#                                                #
//##################################################

async function closeBrowser(browser) {
  return browser.close();
}

//##################################################
//#                                                #
//# getText                                        #
//#                                                #
//##################################################

function getText(linkText) {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/\ +/g, " ");

  // Replace &nbsp; with a space 
  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

//##################################################
//#                                                #
//# findByLink                                     #
//#                                                #
//##################################################

async function findByLink(page, linkString) {
  const links = await page.$$('a')
  for (var i=0; i < links.length; i++) 
	{
    let valueHandle = await links[i].getProperty('innerText');
    let linkHandle = await links[i].getProperty('href');
    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (linkString == text) 
		{
		console.log(linkHandle._remoteObject.value); 
		return linkHandle._remoteObject.value;
		}
	}
  return null;
}
