
const { airtable, douban } = require('../../config');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const { postAirtable, renderStar } = require('./util');
const axios = require('axios');

// 方法已经过期 api 不让调用
function callApi(user, start, timeout) {
    var wish = [];
    var reading = [];
    var read = [];
    var res = '';
    try {
        res = request('https://api.douban.com/v2/book/user/' + user + '/collections?start=' + start + '&count=100', {
            timeout: timeout,
            dataType: 'json'
        });
    } catch (err) {
        offline = true;
    }

    if (offline) {
        return {
            'wish': wish,
            'reading': reading,
            'read': read,
            'start': 0,
            'count': 0,
            'total': 0
        };
    }

    for (var i in res.data.collections) {
        var book = res.data.collections[i];
        var item = {
            image: book.book.image,
            alt: book.book.alt,
            author: book.book.author,
            title: book.book.title,
            pubdate: book.book.pubdate,
            publisher: book.book.publisher,
            tags: (book.tags ? book.tags.join(' ') : ''),
            updated: book.updated.substring(0, 10),
            rating: book.book.rating.average,
            recommend: (book.rating ? renderStar(book.rating.value) : ''),
            comment: (book.comment ? book.comment : '')
        };
        if (book.status === 'wish') {
            wish.push(item);
        } else if (book.status === 'read') {
            read.push(item);
        } else if (book.status === 'reading') {
            reading.push(item);
        }
    }

    return {
        'wish': wish,
        'reading': reading,
        'read': read,
        'start': res.data.start,
        'count': res.data.count,
        'total': res.data.total
    };
}

// 方法已经过期 
exports.syncDoubanBook_DEPRECATED = async (id) => {
    var timeout = 10000;
    var startTime = new Date().getTime();

    var wish = [];
    var reading = [];
    var read = [];

    var res;
    var start = 0;
    do {
        res = callApi(douban.user, start, timeout);
        wish = wish.concat(res.wish);
        reading = reading.concat(res.reading);
        read = read.concat(res.read);
        start = res.start + res.count;
    } while (start < res.total);

    var endTime = new Date().getTime();
    console.log(`books have been loaded in ${endTime - startTime} ms`);

    console.log(read);
};


async function resolvBook(url, timeout, headers) {
    console.log(url);
    var offline = false;
    var response = '';
    try {
        response = await axios({
            method: 'get',
            url: url,
            headers: headers,
        });

    } catch (err) {
        console.log(err);
        offline = true;
    }

    if (offline) {
        return {
            list: [],
            next: ""
        };
    }

    if (headers['Cookie'] instanceof Array && headers['Cookie'].length === 0) {
        headers['Cookie'] = response.headers['set-cookie']
    }

    var doc = new Dom({
        errorHandler: {
            warning: function (e) {
            },

            error: function (e) {
            },

            fatalError: function (e) {
            }
        }
    }).parseFromString(response.data.toString());

    // console.log(doc);

    var items = xpath.select('//ul[@class="interest-list"]/li[@class="subject-item"]', doc);

    var next = xpath.select('string(//span[@class="next"]/a/@href)', doc);
    if (next.startsWith("/")) {
        next = "https://book.douban.com" + next;
    }

    var list = [];
    for (var i in items) {
        var parser = new Dom().parseFromString(items[i].toString());
        var title = xpath.select1('string(//div[@class="info"]/h2/a/@title)', parser);
        var alt = xpath.select1('string(//div[@class="info"]/h2/a/@href)', parser);
        var image = xpath.select1('string(//div[@class="pic"]/a/img/@src)', parser);

        var pub = xpath.select1('string(//div[@class="pub"])', parser);

        var updated = xpath.select1('string(//span[@class="date"])', parser).trim();

        var tags = xpath.select1('string(//span[@class="tags"])', parser);
        tags = tags ? tags.substr(3) : '';

        // var recommend = xpath.select1('string(//li/span[starts-with(@class,"rating")]/@class)', parser);
        var recommend = xpath.select1('string(//div[@class="short-note"]/div/span[contains(@class,"rating")]/@class)', parser);

        var recommendInt = parseInt(recommend.substr(6, 1));

        recommend = renderStar(recommend.substr(6, 1));
        var comment = xpath.select1('string(//p[@class="comment"])', parser);
        comment = comment ? comment : '';

        //image = 'https://images.weserv.nl/?url=' + image.substr(8, image.length - 8) + '&w=100';

        const year = updated.substring(0, 4);

        list.push({
            title: title,
            alt: alt,
            image: image,
            pub: pub,
            updated: updated,
            tags: tags,
            recommend: recommend,
            comment: comment
        });

        let content = {
            "fields": {
                "Title": title,
                "Year": Number(year),
                "Status": updated,
                "Tag": tags,
                "Douban Link": alt,
                "Summary": pub,
                "Personal Notes": comment,
                "Personal Rating": recommendInt,
                "Cover": [{
                    "url": image
                }]
            }
        }
        // console.log(content)
        await postAirtable(content, "appMNrTlu4PFyccyl/Books")
    }

    return {
        'list': list,
        'next': next
    };
}


exports.syncDoubanBook = async () => {
    var timeout = 10000;
    var startTime = new Date().getTime();

    var wish = [];
    var read = [];
    var reading = [];
    var headers = {
        'Cookie': []
    };

    var wishUrl = 'https://book.douban.com/people/' + douban.user + '/wish';

    for (var nextWish = wishUrl; nextWish;) {
        var resWish = await resolvBook(nextWish, timeout, headers);
        nextWish = resWish.next;
        wish = wish.concat(resWish.list);
    }

    var readingUrl = 'https://book.douban.com/people/' + douban.user + '/do';

    for (var nextreading = readingUrl; nextreading;) {
        var resreading = await resolvBook(nextreading, timeout, headers);
        nextreading = resreading.next;
        reading = reading.concat(resreading.list);
    }


    var readUrl = 'https://book.douban.com/people/' + douban.user + '/collect';

    for (var nextread = readUrl; nextread;) {
        var resread = await resolvBook(nextread, timeout, headers);
        nextread = resread.next;
        read = read.concat(resread.list);
    }

    var endTime = new Date().getTime();

    console.log(`books have been loaded in ${endTime - startTime} ms`);

    // console.log(reading);
};