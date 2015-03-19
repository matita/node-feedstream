var FeedParser = require('feedparser'),
  request = require('request'),
  events = require('events'),
  util = require('util');

util.inherits(FeedStream, events.EventEmitter);

function FeedStream(config) {
  var me = this,
    options = {
      url: '',
      delay: 1000 * 60
    },
    guids = [],
    queue = [];
  
  for (var o in config)
    options[o] = config[o];



  function handleItem(item) {
    var guid = item.guid || JSON.stringify(item);

    if (guids.indexOf(guid) == -1) {
      guids.push(guid);
      queue.push(item);
    }
  }

  function dequeue() {
    if (!queue.length)
      return me.emit('noitem');
    
    var item;
    while (item = queue.pop())
      me.emit('item', item);
  }
  
  
  me.fetch = function() {
    var req = request(options.url),
      feed = new FeedParser();

    req.on('error', function(err) {
      me.emit('error', err)
    });

    req.on('response', function(res) {
      var stream = this;
      if (res.statusCode != 200)
        return stream.emit('error', new Error('Bad status code: ' + res.statusCode));
      stream.pipe(feed);
    });

    feed.on('error', function(err) {
      me.emit('error', err);
    });

    feed.on('readable', function() {
      var stream = this,
        meta = stream.meta,
        item;

      while (item = stream.read())
        handleItem(item);
    });

    feed.on('end', function() {
      dequeue();
      setTimeout(function() {
        me.fetch();
      }, options.delay);
    });

    return me;
  }
}

module.exports = FeedStream;

