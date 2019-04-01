
const { airtable, douban } = require('../../config');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const { postAirtable, renderStar } = require('./util');
const axios = require('axios');

exports.postMovieData = async (id) => {
    let apiUrl = `https://api.douban.com/v2/movie/subject/${id}`

    const resp = await axios({
        method: 'get',
        url: apiUrl,
    });
    // console.log(resp);
    let data = resp.data
    let content = {
        "fields": {
            "Title": data.title,
            "Original Title": data.original_title,
            "Year": Number(data.year),
            "Director": data.directors.map(i => i.name).join("，"),
            "Cast": data.casts.map(i => i.name).join("，"),
            "Genre": data.genres.join("，"),
            "Country": data.countries.join("，"),
            "Douban Link": data.alt,
            "Aka": data.aka.join("，"),
            "Summary": data.summary,
            "Douban Rating": parseInt(data.rating.average),
            "Subtype": data.subtype,
            "Cover": [{
                "url": data.images.large
            }]
        }
    }
    console.log(content)
    await postAirtable(content, "appSyHuGwMS7p7X1s/Movies")
};

exports.postMovieData = async (id, catchData) => {
    let apiUrl = `https://api.douban.com/v2/movie/subject/${id}`

    const {
        title,
        alt,
        image,
        tags,
        date,
        recommend,
        comment,
        info,
    } = catchData;

    var {
        recommendInt
    } = catchData;

    const resp = await axios({
        method: 'get',
        url: apiUrl,
    });

    if (Number.isNaN(recommendInt)) {
        recommendInt = 3;
    }

    // console.log(resp);
    let data = resp.data
    let content = {
        "fields": {
            "Info": info,
            "Tags": tags,
            "Date": date,
            "Personal Notes": comment,
            "Personal Rating": recommendInt,
            "Title": data.title,
            "Original Title": data.original_title,
            "Year": Number(data.year),
            "Director": data.directors.map(i => i.name).join("，"),
            "Cast": data.casts.map(i => i.name).join("，"),
            "Genre": data.genres.join("，"),
            "Country": data.countries.join("，"),
            "Douban Link": data.alt,
            "Aka": data.aka.join("，"),
            "Summary": data.summary,
            "Douban Rating": data.rating.average > 0 ? parseInt(data.rating.average) : 5,
            "Subtype": data.subtype,
            "Cover": [{
                "url": data.images.large
            }]
        }
    }
    console.log(content)

    await postAirtable(content, "appSyHuGwMS7p7X1s/Movies")
};


async function resolvSimpleMovies(url, timeout) {
    console.log(url);
    var offline = false;
    var response = '';
    try {
        response = await axios({
            method: 'get',
            url: url,
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

    var items = xpath.select('//div[@class="grid-view"]/div[@class="item"]', doc);
    var next = xpath.select('string(//span[@class="next"]/a/@href)', doc);
    if (next.startsWith("/")) {
        next = "https://movie.douban.com" + next;
    }


    var list = [];
    for (var i in items) {
        var parser = new Dom().parseFromString(items[i].toString());
        var title = xpath.select1('string(//li[@class="title"]/a/em)', parser);
        var alt = xpath.select1('string(//li[@class="title"]/a/@href)', parser);
        var image = xpath.select1('string(//div[@class="item"]/div[@class="pic"]/a/img/@src)', parser).replace('ipst', 'spst');

        var tags = xpath.select1('string(//li/span[@class="tags"])', parser);
        tags = tags ? tags.substr(3) : '';
        var date = xpath.select1('string(//li/span[@class="date"])', parser);
        date = date ? date : '';

        var recommend = xpath.select1('string(//li/span[starts-with(@class,"rating")]/@class)', parser);
        const recommendInt = parseInt(recommend.substr(6, 1));
        recommend = renderStar(recommend.substr(6, 1));


        var comment = xpath.select1('string(//li/span[@class="comment"])', parser);
        comment = comment ? comment : '';

        var info = xpath.select1('string(//li[@class="intro"])', parser);
        info = info ? info : '';

        //image = 'https://images.weserv.nl/?url=' + image.substr(8, image.length - 8) + '&w=100';

        let id = /\/(\d{5,8})\//g.exec(alt)[1]

        let catchData = {
            recommendInt,
            title: title,
            alt: alt,
            image: image,
            tags: tags,
            date: date,
            recommend: recommend,
            comment: comment,
            info: info
        };
        console.log(`catchData`);
        console.log(catchData);


        let content = {
            "fields": {
                "Info": info,
                "Tags": tags,
                "Date": date,
                "Personal Notes": comment,
                "Personal Rating": recommendInt,
                "Title": title,
                "Douban Link": alt,
                "Cover": [{
                    "url": image
                }]
            }
        }

        await postAirtable(content, "appSyHuGwMS7p7X1s/Movies")

        list.push(catchData);
    }

    return {
        'list': list,
        'next': next
    };
}

async function resolvMovies(url, timeout) {
    console.log(url);
    var offline = false;
    var response = '';
    try {
        response = await axios({
            method: 'get',
            url: url,
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

    var items = xpath.select('//div[@class="grid-view"]/div[@class="item"]', doc);
    var next = xpath.select('string(//span[@class="next"]/a/@href)', doc);
    if (next.startsWith("/")) {
        next = "https://movie.douban.com" + next;
    }


    var list = [];
    for (var i in items) {
        var parser = new Dom().parseFromString(items[i].toString());
        var title = xpath.select1('string(//li[@class="title"]/a/em)', parser);
        var alt = xpath.select1('string(//li[@class="title"]/a/@href)', parser);
        var image = xpath.select1('string(//div[@class="item"]/div[@class="pic"]/a/img/@src)', parser).replace('ipst', 'spst');

        var tags = xpath.select1('string(//li/span[@class="tags"])', parser);
        tags = tags ? tags.substr(3) : '';
        var date = xpath.select1('string(//li/span[@class="date"])', parser);
        date = date ? date : '';

        var recommend = xpath.select1('string(//li/span[starts-with(@class,"rating")]/@class)', parser);
        const recommendInt = parseInt(recommend.substr(6, 1));
        recommend = renderStar(recommend.substr(6, 1));


        var comment = xpath.select1('string(//li/span[@class="comment"])', parser);
        comment = comment ? comment : '';

        var info = xpath.select1('string(//li[@class="intro"])', parser);
        info = info ? info : '';

        //image = 'https://images.weserv.nl/?url=' + image.substr(8, image.length - 8) + '&w=100';

        let id = /\/(\d{5,8})\//g.exec(alt)[1]

        let catchData = {
            recommendInt,
            title: title,
            alt: alt,
            image: image,
            tags: tags,
            date: date,
            recommend: recommend,
            comment: comment,
            info: info
        };
        console.log(`catchData`);
        console.log(catchData);
        
        await exports.postMovieData(id, catchData)

        list.push(catchData);
    }

    return {
        'list': list,
        'next': next
    };
}

exports.syncDoubanMovie = async () => {
    var timeout = 10000;
    var startTime = new Date().getTime();

    var wish = [];
    var watched = [];
    var watching = [];

    // var wishUrl = `https://movie.douban.com/people/${douban.user}/wish`;

    // for (var nextWish = wishUrl; nextWish;) {
    //     var resWish = await resolvMovies(nextWish, timeout);
    //     nextWish = resWish.next;
    //     wish = wish.concat(resWish.list);
    // }

    // var watchedUrl = `https://movie.douban.com/people/${douban.user}/collect`;
    var watchedUrl = `https://movie.douban.com/people/103961302/collect?start=15&sort=time&rating=all&filter=all&mode=grid`;

    for (var nextWatched = watchedUrl; nextWatched;) {
        var resWatched = await resolvSimpleMovies(nextWatched, timeout);
        nextWatched = resWatched.next;
        watched = watched.concat(resWatched.list);
    }
    
    // var watchingUrl = `https://movie.douban.com/people/${douban.user}/do`;

    // for (var nextWatching = watchingUrl; nextWatching;) {
    //     var resWatching = await resolvMovies(nextWatching, timeout);
    //     nextWatching = resWatching.next;
    //     watching = watching.concat(resWatching.list);
    // }

    var endTime = new Date().getTime();

    console.log(`movies have been loaded in ${endTime - startTime} ms`);

    // console.log(wish);
    // let content = {
    //     "fields": {
    //         "Title": '王国之心 358/2天 Kingdom Hearts 358/2 Days',
    //         "Tag": ' 2009 SquareEnix nds',
    //         "Douban Link": 'https://www.douban.com/game/26347022/',
    //         "Summary": 'DS / 动作冒险 / 2009-09-29',
    //         "Personal Notes": '55.6W NDS 故事在1.4',
    //         "Personal Rating": 0,
    //         "Date": '2019-02-21'
    //     }
    // }
    // console.log(content)
    // await postAirtable(content, "app4irXzCOE85aN6F/Games")
};
