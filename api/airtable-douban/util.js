const axios = require('axios');
const { airtable } = require('../../config');


async function postAirtable(datas, type) {
    console.log(airtable.appkey);
    const response = await axios({
        method: 'post',
        url: 'https://api.airtable.com/v0/appSyHuGwMS7p7X1s/' + type,
        headers: {
            "Authorization": "Bearer " + airtable.appkey,
        },
        data: datas,
    });

    var data = response.data

    if (data.id) console.log('SUCCEED');
    else console.log('ERROR');
}

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
    postAirtable(content, "Movies")
};


exports.syncDouban = async (id) => {


    log.info(' books have been loaded in ' + (endTime - startTime) + " ms");
    // var startTime = new Date().getTime();

    // var wish = [];
    // var reading = [];
    // var read = [];

    // var res;
    // var start = 0;
    // do {
    //     res = callApi(config.douban.user, start, timeout);
    //     wish = wish.concat(res.wish);
    //     reading = reading.concat(res.reading);
    //     read = read.concat(res.read);
    //     start = res.start + res.count;
    // } while (start < res.total);

    // var endTime = new Date().getTime();

};
