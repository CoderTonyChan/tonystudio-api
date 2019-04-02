const axios = require('axios');

const { postAirtable,postIFTTT } = require('./util');

// const { httpsOverHttp } = require('tunnel');
// const agent = httpsOverHttp({
//     proxy: {
//         host: '127.0.0.1',
//         port: 1087,
//     },
// });

// const axiosClient = axios.create({
//     httpsAgent: agent,
// });

const getDetail = async (link) => {
    // debug
    // console.log(link);
    // const resp = await axiosClient(link);
    const resp = await axios({
        method: 'get',
        url: link,
    });
    const detailPage = resp.data;
    // console.log(detailPage);
    
    // debug
    // console.log(detailPage);
    // 演员
    const actressReg = /<a class="avatar-box"[\s\S]*?<\/a>/g;
    let match = detailPage.match(actressReg);
    let actresses = [];
    if (match) {
        match.map((i) => {
            const name = /<span>(.*?)<\/span>/.exec(i)[1];
            actresses = actresses.concat(name);
            return null;
        });
    } else {
        actresses = null; // []
    }
    // 影片详情
    let filmCover = /<a class="bigImage" href="(.*?)"/.exec(detailPage);
    if (filmCover) {
        filmCover = filmCover[1];
    } 

    // 注意 使用.* 的话 有换行就惨了
    let filmName = /<h3>([\s\S]*?)<\/h3/.exec(detailPage);
    if (filmName) {
        filmName = filmName[1];
    }

    let filmTime = /<span class="header">發行日期:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
    if (filmTime) {
        filmTime = filmTime[1];
    } else {
        filmTime = null;
    }

    let filmLast = /<span class="header">長度:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
    if (filmLast) {
        const lastmins = /\d+/.exec(filmLast[1]);
        const hours = Math.floor(lastmins / 60);
        let mins = lastmins % 60;
        mins = mins === '0' ? '00' : mins;
        filmLast = hours + ':' + mins;
    } else {
        filmLast = null;
    }
    let filmEstabName = /<span class="header">發行商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
    if (filmEstabName) {
        filmEstabName = filmEstabName[2];
    } else {
        filmEstabName = null;
    }

    let filmMakerbName = /<span class="header">製作商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
    if (filmMakerbName) {
        filmMakerbName = filmMakerbName[2];
    } else {
        filmMakerbName = null;
    }
    let seriesName = /<span class="header">系列:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
    if (seriesName) {
        seriesName = seriesName[2];
    } else {
        seriesName = null;
    }
    let directorName = /<span class="header">導演:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
    if (directorName) {
        directorName = directorName[2];
    } else {
        directorName = null;
    }

    const code = /<span class="header">識別碼:[\s\S]*?">([\s\S]*?)<\/span>/.exec(detailPage)[1];
    // 影片截图
    const regScreenshot = /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g;
    match = detailPage.match(regScreenshot);
    let screenData = [];
    if (match) {
        screenData = match.map((i) => /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g.exec(i)[1]);
    } else {
        screenData = null;
    }
    const detail = { filmName,filmCover,actresses, filmTime, filmLast, filmEstabName, filmMakerbName, seriesName, directorName, code, screenData };

    const postData = {
        "Title": `${filmName} ${filmTime}`,
        "Original Title": filmName,
        "Director": directorName,
        "Actresses": actresses ? actresses.join("，") : null,
        "Date": filmTime,
        "Film Last": filmLast,
        "Link": link,
        "Code": code,
        "Film Estab Name": filmEstabName,
        "Film Maker Name": filmMakerbName,
        "Series Name": seriesName,
        "Cover": filmCover,
        "Screen Data": screenData ? screenData.map((i) => (i)) : [],
        "Japonx Link": `https://www.japonx.tv/portal/index/search.html?k=${code}&x=0&y=0`,
        "Avgle Link": `https://api.avgle.com/v1/search/${code}/0?limit=10&t=a&o=bw`,
        "Javlibrary Link": `http://www.javlibrary.com/cn/vl_searchbyid.php?keyword=${code}`
    };

    // console.log(postData)

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
    // console.log(value1)
    // await postAirtable(content, "app2Z4H0EoUnF1OM9/Movies")

    await postIFTTT(content,'javbus_movie')
    
    console.log(content)
    return detail;
};


const getActress = async (link) => {
    // debug
    // console.log(link);
    // const resp = await axiosClient(link);

    const resp = await axios({
        method: 'get',
        url: link,
    });

    // 身材
    var temp = /<div class="photo-info">[\s\S]*?生日:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var birth = temp[1];
    } else {
        var birth = "????-??-??";
    }
    var temp = /<div class="photo-info">[\s\S]*?年齡:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var age = temp[1] + "岁";
    } else {
        var age = "??岁";
    }
    var temp = /<div class="photo-info">[\s\S]*?身高:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var height = temp[1];
    } else {
        var height = "???cm";
    }
    var temp = /<div class="photo-info">[\s\S]*?罩杯:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var breast = temp[1];
    } else {
        var breast = "?";
    }
    var temp = /<div class="photo-info">[\s\S]*?胸圍:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var xiong = temp[1];
    } else {
        var xiong = "??cm";
    }
    var temp = /<div class="photo-info">[\s\S]*?腰圍:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var yao = temp[1];
    } else {
        var yao = "??cm";
    }
    var temp = /<div class="photo-info">[\s\S]*?臀圍:\s(.*?)<\/p>/.exec(
        resp.data
    );
    if (temp) {
        var tun = temp[1];
    } else {
        var tun = "??cm";
    }

    return { birth, age, height, breast, xiong, yao, tun };
};

exports.syncJavbusIFTTT = async (id) => {
    // const LocalData = require('../../data/JavBusBackup.json');

    // 同步favorite
    // const LocalFavList = LocalData.favorite.map(i => `https://www.javbus.com/${i.shortCode}`)//.map((link) => { getDetail(link)});

    // for (const link of LocalFavList) {
    //     console.log(link);
    //     await getDetail(link)
    // }

    // 同步archive
    // const LocalArcList = LocalData.archive.map(i => `https://www.javbus.com/${i.shortCode}`)//.map(async (link) => { getDetail(link)});

    // for (const link of LocalArcList) {
    //     console.log(link);
    //     await getDetail(link)
    // }

    // console.log(LocalFavList.length);
    // console.log(LocalArcList.length);

    // await Promise.all(LocalFavList)
    // await Promise.all(LocalArcList)

    // const LocalActressList = LocalData.actress.map(i => `https://www.javbus.com/${i.un}star/${i.shortCode}`);


    // 测试同步favorite
    // const detail = await getDetail('https://www.javbus.com/IPX-230');

    // 测试同步Actress
    testJavbusActress();


    // 同步Actress
    // for (const actress of LocalData.actress) {
    //     const { birth, age, height, breast, xiong, yao, tun } = await getActress(`https://www.javbus.com/${actress.un}star/${actress.shortCode}`);
    //     const { info, shortCode, src } = actress;
    //     console.log({ birth, age, height, breast, xiong, yao, tun, info, shortCode, src} );

    //     let content = {
    //         "fields": {
    //             "Name": info,
    //             "Photo": [{
    //                 "url": src
    //             }],
    //             "Birth": birth,
    //             "Height": height,
    //             "Age": age,
    //             "Breast": breast,
    //             "Xiong": xiong,
    //             "Yao": yao,
    //             "Tun": tun,
    //             "Short Code": shortCode,
    //             "uncensored": actress.un.length > 0,
    //         }
    //     }
    //     console.log(content)
    //     await postAirtable(content, "app2Z4H0EoUnF1OM9/Actresses")
    // }
    // console.log(LocalData.actress.length);uncensored
    
    
};


const testJavbusActress = async () => {

    const { birth, age, height, breast, xiong, yao, tun } = await getActress(`https://www.javbus.com/star/ow0`);
    const { info, shortCode, src, un} = { "src": "https://pics.javbus.com/actress/ow0_a.jpg", "info": "園田みおん", "shortCode": "ow0", "un": "" };


    let postData = {
        "Name": info,
        "Photo": src,
        "Birth": birth,
        "Height": height,
        "Age": age,
        "Breast": breast,
        "Xiong": xiong,
        "Yao": yao,
        "Tun": tun,
        "Short Code": shortCode,
        "uncensored": un.length > 0,
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
    // console.log(value1)
    // await postAirtable(content, "app2Z4H0EoUnF1OM9/Movies")

    await postIFTTT(content, 'javbus_actress')

};





exports.syncJavbusActress = async (id) => {
    const LocalData = require('../../data/JavBusBackup.json');

    for (const actress of LocalData.actress) {
        const { birth, age, height, breast, xiong, yao, tun } = await getActress(`https://www.javbus.com/${actress.un}star/${actress.shortCode}`);
        const { info, shortCode, src } = actress;
        console.log({ birth, age, height, breast, xiong, yao, tun, info, shortCode, src });

        let content = {
            "fields": {
                "Name": info,
                "Photo": [{
                    "url": src
                }],
                "Birth": birth,
                "Height": height,
                "Age": age,
                "Breast": breast,
                "Xiong": xiong,
                "Yao": yao,
                "Tun": tun,
                "Short Code": shortCode,
                "uncensored": actress.un.length > 0,
            }
        }
        console.log(content)
        await postAirtable(content, "app2Z4H0EoUnF1OM9/Actresses")
    }
};


exports.syncJavbusArcList = async (id) => {
    const LocalData = require('../../data/JavBusBackup.json');

    const LocalArcList = LocalData.archive.map(i => `https://www.javbus.com/${i.shortCode}`)//.map(async (link) => { getDetail(link)});

    for (const link of LocalArcList) {
        console.log(link);
        await getDetail(link)
    }
    console.log(LocalArcList.length);


};


exports.syncJavbusFavList = async (id) => {
    const LocalData = require('../../data/JavBusBackup.json');

    const LocalFavList = LocalData.favorite.map(i => `https://www.javbus.com/${i.shortCode}`)//.map((link) => { getDetail(link)});

    for (const link of LocalFavList) {
        console.log(link);
        await getDetail(link)
    }
    console.log(LocalFavList.length);

};


exports.syncJavbusArcList = async (id) => {
    const LocalData = require('../../data/JavBusBackup.json');

    const LocalArcList = LocalData.archive.map(i => `https://www.javbus.com/${i.shortCode}`)//.map(async (link) => { getDetail(link)});

    for (const link of LocalArcList) {
        console.log(link);
        await getDetail(link)
    }
    console.log(LocalArcList.length);


};
