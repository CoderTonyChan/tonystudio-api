const axios = require('axios');
const qs = require('querystring');

const { postAirtable,postIFTTT } = require('./util');


const getDetail = async (playlistID, genre) => {
    // 这个请求只返回10个
    // const response = await axios({
    //     method: 'post',
    //     url: 'https://music.163.com/api/v3/playlist/detail',
    //     headers: {
    //         Referer: 'https://music.163.com/',
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     data: qs.stringify({
    //         id: playlistID,
    //     }),
    // });

    // 需要配合 NeteaseCloudMusicApi 这个30个可以 但是需要登录
    const response = await axios({
        url: `http://localhost:3000/playlist/detail?id=${playlistID}`,
    });
    
    console.log(response);


    // for (let index = 50; index < response.data.playlist.tracks.length; index++) {
    // for (let index = 100; index < response.data.playlist.tracks.length; index++) {
    for (let index = 100; index < response.data.playlist.tracks.length; index++) {
        const track = response.data.playlist.tracks[index];
        const postData = {
            "Name": track.name,
            "Album Covers": track.al.picUrl,
            "Album": track.al.name,
            "Artist": track.ar[0].name,
            "Playlist": response.data.playlist.name,
            "Genre": genre,
        };
        console.log(postData)
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
        // console.log(content)
        // await postAirtable(content, "app2Z4H0EoUnF1OM9/Movies")

        await postIFTTT(content, 'music_ifttt')
    };

    

    // return detail;
};

// getDetail(2553442303, '华语'); // 2004华语乐坛有多“疯狂”？
// getDetail(2217381267, '华语'); // 1999-2005小学时代百首经典华语歌曲
// getDetail(2209502469, '华语'); // 2006-2009初中时代百首华语歌曲
getDetail(2177513740, '华语'); // 2010-2012高中时代80首经典华语歌曲

