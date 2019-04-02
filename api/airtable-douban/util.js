const axios = require('axios');
const { airtable, douban,ifttt } = require('../../config');

exports.postAirtable = async (datas, key) => {
    const response = await axios({
        method: 'post',
        url: `https://api.airtable.com/v0/${key}`,
        headers: {
            "Authorization": "Bearer " + airtable.appkey,
        },
        data: datas,
    });
    
    var data = response.data

    if (data.id) console.log('SUCCEED');
    else console.log('ERROR');
}


exports.postIFTTT = async (datas, key) => {
    const response = await axios({
        method: 'post',
        url: `https://maker.ifttt.com/trigger/${key}/with/key/${ifttt.appkey}`,
        data: datas,
    });

    // 200 代表成功了
    var data = response.data
    console.log(data);
    
}


exports.renderStar = (num) => {
    switch (num) {
        case '1':
            return '★☆☆☆☆ 很差';
        case '2':
            return '★★☆☆☆ 较差';
        case '3':
            return '★★★☆☆ 还行';
        case '4':
            return '★★★★☆ 推荐';
        case '5':
            return '★★★★★ 力荐';
        default:
            return '';
    }
};

