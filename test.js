const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter();

// feeder.add({
//     url: 'https://www.hcamag.com/ca/rss',
//     refresh: 2000,
//     eventName: 'nintendo'
//   });
  
  feeder.on('nintendo', function(item) {
    console.log(item);
  });