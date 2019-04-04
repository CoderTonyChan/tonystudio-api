
const { airtable, douban } = require('../../config');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const { postAirtable, renderStar } = require('./util');
const axios = require('axios');

async function resolvGames(url, timeout) {
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
    var items = xpath.select('//div[@class="game-list"]/div[@class="common-item"]', doc);
    var list = [];
    var next = xpath.select('string(//span[@class="next"]/a/@href)', doc);
    if (next.startsWith("?")) {
        next = "https://www.douban.com/people/" + douban.user + "/games" + next;
    }

    for (var i in items) {
        var parser = new Dom().parseFromString(items[i].toString());
        var title = xpath.select1('string(//div[@class="title"]/a)', parser);
        var alt = xpath.select1('string(//div[@class="title"]/a/@href)', parser);
        var image = xpath.select1('string(//div[@class="pic"]/a/img/@src)', parser);

        var tags = xpath.select1('string(//div[@class="rating-info"]/span[@class="tags"])', parser);
        tags = tags ? tags.substr(3) : '';
        var date = xpath.select1('string(//div[@class="rating-info"]/span[@class="date"])', parser);
        date = date ? date : '';

        var recommend = xpath.select1('string(//div[@class="rating-info"]/span[contains(@class,"allstar")]/@class)', parser);
        var recommendInt = 3;
        if (recommend.indexOf('None') > 0) {
            console.log(recommend);
        } else {
            recommendInt = parseInt(recommend.substr(19, 1))
        }

        recommend = renderStar(recommend.substr(19, 1));
        console.log(recommend);

        var comment = xpath.select1('string(//div[@class="content"]/div[not(@class)])', parser);
        comment = comment ? comment : '';

        var info = xpath.select1('string(//div[@class="desc"]/text())', parser);
        info = info ? info : '';
        info = info.replace(/(^\s*)|(\s*$)/g, '');

        const year = date.substring(0, 4)

        // 最后一个
        const publishDate = info.split('/').pop().trim()

        // 第一个是平台
        const platform = info.split('/').shift().trim()

        // 增加系列 增加发行商 The Pokémon Company Nintendo 
        let series = '';
        let publish = '';
        if (/王国之心/ig.test(title)) {
            series = "王国之心"
            publish = "SQUARE ENIX"
        } else if (/勇者斗恶龙/ig.test(title)) {
            series = "勇者斗恶龙"
            publish = "SQUARE ENIX"
        } else if (/星之卡比/ig.test(title)) {
            series = "星之卡比"
            publish = "Nintendo"
        } else if (/大乱斗/ig.test(title)) {
            series = "任天堂明星大乱斗"
            publish = "Nintendo"
        } else if (/火焰之纹章/ig.test(title)) {
            series = "火焰之纹章"
            publish = "Nintendo"
        } else if (/古墓丽影/ig.test(title)) {
            series = "古墓丽影"
            publish = "SQUARE ENIX"
        } else if (/塞尔达/ig.test(title)) {
            series = "塞尔达传说"
        } else if (/马里奥/ig.test(title)) {
            series = "马里奥"
            publish = "Nintendo"
        } else if (/瓦里奥/ig.test(title)) {
            series = "马里奥"
            publish = "Nintendo"
        } else if (/最终幻想/ig.test(title)) {
            series = "最终幻想"
            publish = "SQUARE ENIX"
        }
        else if (/宝可/ig.test(title)) {
            series = "精灵宝可梦"
            publish = "The Pokémon Company"
        }
        else if (/口袋/ig.test(title)) {
            series = "精灵宝可梦"
            publish = "The Pokémon Company"
        }
        else if (/马力欧/ig.test(title)) {
            series = "马力欧"
            publish = "Nintendo"
        }
        else if (/超级机器人大战/ig.test(title)) {
            series = "超级机器人大战"
            publish = "BANDAI NAMCO"
        }
        else if (/SD高达/ig.test(title)) {
            series = "SD高达"
            publish = "BANDAI NAMCO"
        }
        else if (/高达/ig.test(title)) {
            series = "高达"
            publish = "BANDAI NAMCO"
        }
        else if (/洛克人/ig.test(title)) {
            series = "洛克人"
            publish = "Capcom"
        }
        else if (/生化危机/ig.test(title)) {
            series = "生化危机"
            publish = "Capcom"
        }
        else if (/怪物猎人/ig.test(title)) {
            series = "怪物猎人"
            publish = "Capcom"
        }
        else if (/鬼武者/ig.test(title)) {
            series = "鬼武者"
            publish = "Capcom"
        }
        else if (/龙珠/ig.test(title)) {
            series = "龙珠"
            publish = "BANDAI NAMCO"
        }
        else if (/寄生前夜/ig.test(title)) {
            publish = "SQUARE ENIX"
        }
        else if (/战神/ig.test(title)) {
            series = "战神"
            publish = "Sony Computer Entertainment"
        }
        else if (/逆转裁判/ig.test(title)) {
            series = "逆转裁判"
            publish = "Capcom"
        }
        else if (/恶魔城/ig.test(title)) {
            series = "恶魔城"
            publish = "Konami"
        }

        
        list.push({
            title: title,
            alt: alt,
            image: image,
            tags: tags,
            date: date,
            recommend: recommend,
            comment: comment,
            info: info
        });

        let content = {
            "fields": {
                "Publish Date": publishDate,
                "平台": platform,
                "系列": series,
                "发行商": publish,
                "Year": Number(year),
                "Title": title,
                "Tag": tags,
                "Douban Link": alt,
                "Summary": info,
                "Personal Notes": comment,
                "Personal Rating": recommendInt,
                "Date": date,
                "Cover": [{
                    "url": image
                }]
            }
        }
        // console.log(content)
        await postAirtable(content, "app4irXzCOE85aN6F/Games")
    }

    return {
        'list': list,
        'next': next
    };
}

exports.syncDoubanGames = async () => {
    var timeout = 10000;
    var startTime = new Date().getTime();

    var rawUrl = 'https://www.douban.com/people/' + douban.user + '/games';
    var playedUrl = rawUrl + '?action=collect';
    var playingUrl = rawUrl + '?action=do';
    var wishUrl = rawUrl + '?action=wish';

    var wish = [];
    var played = [];
    var playing = [];
    for (var nextWish = wishUrl; nextWish;) {
        var resWish = await resolvGames(nextWish, timeout);
        nextWish = resWish.next;
        wish = wish.concat(resWish.list);
    }


    for (var nextPlayed = playedUrl; nextPlayed;) {
        var resPlayed = await resolvGames(nextPlayed, timeout);
        nextPlayed = resPlayed.next;
        played = played.concat(resPlayed.list);
    }

    for (var nextPlaying = playingUrl; nextPlaying;) {
        var resPlaying = await resolvGames(nextPlaying, timeout);
        nextPlaying = resPlaying.next;
        playing = playing.concat(resPlaying.list);
    }

    var endTime = new Date().getTime();

    console.log(`books have been loaded in ${endTime - startTime} ms`);

    // console.log(played);
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