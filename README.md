# robot-trader
Automated robot trader

This project is a Node.js React client/server app to compare how different stocks behave with the MA crossover indicator.

A little SQLite database is used to keep track of each stock performance.

I am indebted to https://github.com/rrag/react-stockcharts for their wonderful charting library.

The trading data is sourced from https://finance.yahoo.com/quote/AAPL/history?p=AAPL
The stocks directory contains the *.csv files downloaded from there. Make sure you have at least 2 years worth of daily quotes.

There is an interface to add/delete/upload stocks which is by default disabled in production so that people don't mess up the data.

Something worth mentioning is the hassles you have with running a react client with a node.js server on the same machine. 

They need to use two ports in development which is declared in /client/package.json with "proxy": "http://localhost:5000" for the server (also the last few lines of /index.js) while the client runs on http://localhost:3000. That's fine for fetch() but for me that wasn't enough because I make calls from the client to the server via html links. This requires yet another module http-proxy-middleware declared also in /client/package.json plus /client/src/setupProxy.js to finish it off.

You can see robot-trader running here https://robot-trader.herokuapp.com

To run locally you need two powershell windows - one to run the node server with npm start inside /robot-trader and the second to run the react client inside /robot-trader/client

Enjoy -

PS. If you want to impress your dinner guests for your next cocktail party, just remove the worst performing stocks from your stocklist and replace them with some thoroughbreds picked up from the latest trading blogs...

You may sport a trading system with a success rate above 75% if you try.

Nothing dishonest with that - but the problem is there is no guarantee your stocklist will perform as well next year as it did last year. With the power of hindsight you can always pick the best last performers with technical analysis tools but that does not predict the future. 

One question was - how do you maintain the data? Well, now we have two methods. There is a user interface to add/delete stocks (new sqlite row + relevant *.csv file). login by clicking on the robot-trader logo. New links will appear on the stcklist table. You may want to setup your own password inside the server's index.js

The second automated method is to run node scraper.js in a third powershell window which will read the file stocklist.txt and download data from yahoo.It will automatically click the link "Update Results" at the bottom of your localhost:3000 react client browser to tally all the stocks performance back into the SQLite database. Nifty huh?
