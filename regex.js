var url1 = 'https://robot-trader.herokuapp.com/api/results/profitloss/desc';
var url2 = 'https://robot-trader.herokuapp.com?stock=AAPL';
var url3 = 'https://robot-trader.herokuapp.com';

var patt = /\?/;
var result1 = patt.test(url1);
console.log (url1 + ' returns ' + result1);

var result2 = patt.test(url2);
console.log (url2 + ' returns ' + result2);

var result3 = patt.test(url3);
console.log (url3 + ' returns ' + result3);