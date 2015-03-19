var FeedStream = require('./main.js');

var lastDate;
var feed = new FeedStream({
    url: 'http://www.tntvillage.scambioetico.org/rss.php?c=0&p=20',
    delay: 1000 * 60 * 15
  })
  .on('error', function(err) {
    console.error('error', err);
  })
  .on('item', function(item) {
    var now = new Date();
    if (!lastDate || lastDate < now.getTime() - 1000 * 60) {
      console.log('---');
      console.log(now);
      console.log('---');
      lastDate = now.getTime();
    }
    console.log('new item -', item.title);
  })
  .on('noitem', function() {
    
  })
  .fetch();








