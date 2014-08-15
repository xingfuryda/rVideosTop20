var feed = require("feed-read"),
    http = require("http"),
    express = require("express"),
    app = express(),
    urls = [],
    articleList = [],
    Feed = require("feed");
    
app.listen(process.env.PORT);
console.log('Express server started on port %s', process.env.PORT);
    
app.get('/', function(req, res){
    // send basic http headers to client
    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    getArticles(function(){
        for (var i = articleList.length; i--; ) {
            res.write(articleList[i]);
        }
        res.end();
    });
});

app.get('/rss', function(req, res) {

    // Initializing feed object
    var feed = new Feed({
        title:          'Reddit Videos Top 20',
        description:    'Only the video links extarcted for you!',
        link:           'http://example.com/',
        image:          'http://example.com/logo.png',
        copyright:      'Copyright © 2013 John Doe. All rights reserved',

        author: {
            name:       'John Doe',
            email:      'john.doe@example.com',
            link:       'https://example.com/john-doe'
        }
    });
    
    getArticles(function(){
        for (var i = articleList.length; i--; ) {
            
            //make an item
            feed.addItem({
                title:          'An article',
                link:           articleList[i],
                description:    'This is the description',
                date:           new Date(),
                content:        'hi'
            });
        }
        
        // Setting the appropriate Content-Type
        res.set('Content-Type', 'text/xml');
    
        // Sending the feed as a response
        res.send(feed.render('rss-2.0'));
    });
});

var getArticles = function (callback) {
    
    feed('http://www.reddit.com/r/videos/.rss', function (err, articles) {
        // loop through the list of articles returned
        for (var i = 0; i < articles.length; i++) {
            
            //skip any [meta] entries
            if (articles[i].title.indexOf('[Meta]') > -1) {
                continue;
            }
            
            //extract the <a> containing text [link]
            if (articles[i].content.indexOf('[link]') > -1) {
                var linkIndex = articles[i].content.indexOf('[link]');
                var aIndex = articles[i].content.lastIndexOf('<a ', linkIndex);
                var link = articles[i].content.substring(aIndex + 9,linkIndex - 2);
                articleList.push(link);
            }
        }
        callback();
    });
};
