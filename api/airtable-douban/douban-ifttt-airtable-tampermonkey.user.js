// ==UserScript==
// @name         douban-ifttt-airtable-tampermonkey
// @namespace    https://blog.tonystudio.ml/2019/04/04/Tampermonkey-Tutorial/
// @homepageURL  https://blog.tonystudio.ml/2019/04/04/Tampermonkey-Tutorial/
// @supportURL   https://blog.tonystudio.ml/2019/04/04/Tampermonkey-Tutorial/
// @downloadURL  https://github.com/CoderTonyChan/tonystudio-api/raw/master/api/airtable-douban/douban-ifttt-airtable-tampermonkey.user.js
// @updateURL    https://github.com/CoderTonyChan/tonystudio-api/raw/master/api/airtable-douban/douban-ifttt-airtable-tampermonkey.user.js
// @version      1.01
// @description  try to take over the world!
// @author       CoderTonyChan
// @match        https://*.douban.com/people/103961302/*
// @connect        *
// @grant        GM_xmlhttpRequest
// @require         http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// ==/UserScript==


// This Userscirpt can't run under Greasemonkey 4.x platform
if (typeof GM_xmlhttpRequest === "undefined") {
    alert("不支持Greasemonkey 4.x，请换用暴力猴或Tampermonkey");
    return;
}

// console.log(GM_xmlhttpRequest);
const ifttt = 'ba5A6Wvz98s33G_QeCRHub';

function post(url, data, callback) {
    // console.log('post');
    // console.log(data);
    if (typeof data === "object") {
        data = JSON.stringify(data);
    }


    const req = GM_xmlhttpRequest({
        method: 'POST',
        url: url,
        headers: {
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
        },
        data: data,
        onreadystatechange: function (res) {
            if (res.readyState == 4) {
                if (res.status == 200) {
                    callback(res.response);
                }
            }
        }
    });
}


function postIFTTT(data,key,callback) {
    post(`https://maker.ifttt.com/trigger/${key}/with/key/${ifttt}`,data,(res) => {
        console.log(res);
        // 先写死 不写回调
        callback ? callback(res): 0;
    })
}




function getDoc(url, meta, callback) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (responseDetail) {
            if (responseDetail.status === 200) {
                let doc = page_parser(responseDetail.responseText);
                callback(doc, responseDetail, meta);
            }
        }
    });
}

function getJSON(url, callback) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: {
            'Accept': 'application/json'
        },
        onload: function (response) {
            if (response.status >= 200 && response.status < 400) {
                callback(JSON.parse(response.responseText), url);
            } else {
                callback(false, url);
            }
        }
    });
}

(function () {
    'use strict';

    const doubanSite = location.href;
    const reMovie = /movie.douban/i;
    const reBook = /book.douban/i;
    const reGame = /\/games/i;

    const ifttt = '<button class="ifttt" style="font-size: 18px;outline: none;">[upload airtable]</button>';

    // 电影
    if (reMovie.test(doubanSite)) {
        console.log('🎬');
        const ul_tag = $("div.grid-view .item .info .title");
        if (ul_tag) {
            ul_tag.append(ifttt);
        }

        $(".ifttt").click(function (event) {
            const currentTarget = $(event.currentTarget);
            const item = currentTarget.parent().parent().parent().parent()
            const pic = item.find('.pic')
            const info = item.find('.info')

            // console.log(pic.text());
            // console.log(info.html());

            const title = info.find('.title a').text().replace(/[\r\n]/g, "").replace(/[  ]/g, "").trim();
            const intro = info.find('.intro').text().trim()
            const date = info.find('.date').text().trim()
            let tags = info.find('.tags').text().trim()
            tags = tags ? tags.substr(3) : '';
            const comment = info.find('.comment').text()
            const classname = info.find('span[class^="rating"]').attr("class")
            const recommend = classname ? classname.replace(/[^0-9]/ig, "") : 3;
            const recommendInt = parseInt(recommend);
            const alt = pic.find('.nbg').attr("href")
            const image = pic.find('img').attr("src")


            // const tags = info.find('.tags').text()
            // "ul li:first"

            // console.log({ title, intro, tags, date, comment, alt, image, recommendInt });
            // console.log({ recommendInt });

            const id = /\/(\d{5,8})\//g.exec(alt)[1]
            const apiUrl = `https://api.douban.com/v2/movie/subject/${id}`

            getJSON(apiUrl,(json,url) => {
                if (json) {
                    let postData = {
                        "Info": intro,
                        "Tags": tags,
                        "Date": date,
                        "Personal Notes": comment,
                        "Personal Rating": recommendInt,
                        "Title": json.title,
                        "Original Title": json.original_title,
                        "Year": Number(json.year),
                        "Director": json.directors.map(i => i.name).join("，"),
                        "Cast": json.casts.map(i => i.name).join("，"),
                        "Genre": json.genres.join("，"),
                        "Country": json.countries.join("，"),
                        "Douban Link": json.alt,
                        "Aka": json.aka.join("，"),
                        "Summary": json.summary,
                        "Douban Rating": parseInt(json.rating.average),
                        "Subtype": json.subtype,
                        "Cover": json.images.large
                    }

                    let value1 = '';
                    for (const key in postData) {
                        if (postData.hasOwnProperty(key)) {
                            const value = postData[key];
                            value1 = `${value1}::airtable::${key}::${JSON.stringify(value)}`
                        }
                    }
                    value1 = value1.replace(/\"/g, "");
                    value1 = value1.replace(/\]/g, "");
                    value1 = value1.replace(/\[/g, "");
                    let content = {
                        "value1": value1
                    }
                    
                    postIFTTT(content, 'douban_movie',(res) => {
                        currentTarget.text('完成')
                    })
                    // postIFTTT(content, 'douban_game')
                    // postIFTTT(content, 'douban_book')

                }else {
                    console.log('getJSON失败');
                    
                }
            })


            // let catchData = {
            //     recommendInt,
            //     title: title,
            //     alt: alt,
            //     image: image,
            //     tags: tags,
            //     date: date,
            //     recommend: recommend,
            //     comment: comment,
            //     info: info
            // };

        });
    }

    // 📖
    if (reBook.test(doubanSite)) {
        console.log('📖');
        const ul_tag = $("ul.interest-list .subject-item .info h2");
        if (ul_tag) {
            ul_tag.append(ifttt);
        }

        $(".ifttt").click(function (event) {
            const currentTarget = $(event.currentTarget);
            const item = currentTarget.parent().parent().parent()
            const pic = item.find('.pic')
            const info = item.find('.info')

            // console.log(pic.text());
            // console.log(info.html());

            const title = info.find('h2 a').text().replace(/[\r\n]/g, "").replace(/[  ]/g, "").trim();
            const intro = info.find('.pub').text().trim()
            const date = info.find('.date').text().trim().replace(/[\r\n]/g, "").replace(/[\n]/g, "")
            let tags = info.find('.tags').text().trim()
            tags = tags ? tags.substr(3) : '';
            const comment = info.find('.comment').text().replace(/[\r\n]/g, "").replace(/[\n]/g, "")
            const classname = info.find('span[class^="rating"]').attr("class")
            const recommend = classname ? classname.replace(/[^0-9]/ig, "") : 3;
            const recommendInt = parseInt(recommend);
            const alt = pic.find('.nbg').attr("href")
            const image = pic.find('img').attr("src")

            const year = date.substring(0, 4)
            // const tags = info.find('.tags').text()
            // "ul li:first"
            
            // console.log({ title, intro, tags, date, comment, alt, image, recommendInt, year});
            // console.log({ recommendInt });

            // 倒数第二
            const infoArray = intro.split(' / ');
            // console.log(infoArray);

            const publishDate = infoArray[infoArray.length - 2].trim().replace(/年/g, "-").replace(/月/g, "-");
            const author = infoArray[0].trim()

            // console.log(publishDate);
            
            let postData = {
                "作者": author,
                "Year": Number(year),
                "Publish Date": publishDate,
                "Title": title,
                "Status": date,
                "Tag": tags,
                "Douban Link": alt,
                "Summary": intro,
                "Personal Notes": comment,
                "Personal Rating": recommendInt,
                "Cover": image
            }

            let value1 = '';
            for (const key in postData) {
                if (postData.hasOwnProperty(key)) {
                    const value = postData[key];
                    value1 = `${value1}::airtable::${key}::${JSON.stringify(value)}`
                }
            }
            value1 = value1.replace(/\"/g, "");
            value1 = value1.replace(/\]/g, "");
            value1 = value1.replace(/\[/g, "");
            let content = {
                "value1": value1
            }
            postIFTTT(content, 'douban_book',(res) => {
                currentTarget.text('完成')
            })
        });
    }

    // 🎮
    if (reGame.test(doubanSite)) {
        console.log('🎮');
        const ul_tag = $("div.game-list .common-item .content .title");
        if (ul_tag) {
            ul_tag.append(ifttt);
        }

        $(".ifttt").click(function (event) {
            const currentTarget = $(event.currentTarget);
            const item = currentTarget.parent().parent().parent()
            const pic = item.find('.pic')
            const info = item.find('.content')

            // console.log(pic.text());
            // console.log(info.html());

            const title = info.find('.title a').text().replace(/[\r\n]/g, "").replace(/[  ]/g, "").trim();
            const date = info.find('.date').text().trim()
            let tags = info.find('.tags').text().trim()
            tags = tags ? tags.substr(3) : '';
            const comment = info.find('div:not([class])').text()
            const classname = info.find('span[class^="rating"]').attr("class")
            const recommend = classname ? classname.replace(/[^0-9]/ig, "") : 30;
            let recommendInt = parseInt(recommend) / 10; // 会是40
            const alt = pic.find('a').attr("href")
            const image = pic.find('img').attr("src")

            info.find('.desc').children().remove()
            const intro = info.find('.desc').text().trim().replace(/[\r\n]/g, "").replace(/[\n]/g, "")

            if (recommendInt === 0) {
                recommendInt = 3;
            }
            // const tags = info.find('.tags').text()
            // "ul li:first"
            const year = date.substring(0, 4)
            // 最后一个
            const publishDate = intro.split('/').pop().trim()

            // 第一个是平台
            const platform = intro.split('/').shift().trim()

            // console.log({ title, intro, tags, date, comment, alt, image, recommendInt });
            // console.log({ recommendInt });
            // console.log({ year, publishDate, platform});

            // 增加系列 增加发行商 The Pokémon Company Nintendo 
            let series = undefined;
            let publish = undefined;
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
                publish = "Nintendo"
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

            let postData = {
                "Publish Date": publishDate,
                "平台": platform,
                "系列": series,
                "发行商": publish,
                "Year": Number(year),
                "Title": title,
                "Tag": tags,
                "Douban Link": alt,
                "Summary": intro,
                "Personal Notes": comment,
                "Personal Rating": recommendInt,
                "Date": date,
                "Cover": image
            }

            let value1 = '';
            for (const key in postData) {
                if (postData.hasOwnProperty(key)) {
                    const value = postData[key];
                    value1 = `${value1}::airtable::${key}::${JSON.stringify(value)}`
                }
            }
            value1 = value1.replace(/\"/g, "");
            value1 = value1.replace(/\]/g, "");
            value1 = value1.replace(/\[/g, "");
            let content = {
                "value1": value1
            }
            postIFTTT(content, 'douban_game', (res) => {
                currentTarget.text('完成')
            })
            
        });
    }

})();