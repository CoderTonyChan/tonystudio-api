# 网易云API解析

```
::airtable::Name::{{Name}}
::airtable::Album::{{Album}}
::airtable::Artist::{{Artist}}
::airtable::Playlist::{{Playlist}}
::airtable::Genre::{{Genre}}
::airtable::Album Cover::{{Album Cover}} 
```

照片成功例子 
每次check 好似只能运行 50次

```

::airtable::Title::SSNI-424 パンチラ誘惑で全力アピールしてくる彼女の巨乳姉と、誘惑に負けちゃう最低な僕。 葵 2019-03-07::airtable::Original Title::パンチラ誘惑で全力アピールしてくる彼女の巨乳姉と、誘惑に負けちゃう最低な僕。 葵::airtable::Director::五右衛門::airtable::Actresses::葵::airtable::Date:: 2019-03-07::airtable::Film Last::3:00::airtable::Link::https://www.javbus.com/SSNI-424::airtable::Code::SSNI-424::airtable::Film Estab Name::S1NO.1STYLE::airtable::Film Maker Name::エスワンナンバーワンスタイル::airtable::Series Name::誘惑に負けちゃう最低な僕。::airtable::Cover::https://pics.javbus.com/cover/6zoi_b.jpg::airtable::Screen Data::https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-1.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-2.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-3.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-4.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-5.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-6.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-7.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-8.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-9.jpg,https://pics.dmm.co.jp/digital/video/ssni00424/ssni00424jp-10.jpg::airtable::Japonx Link::https://www.japonx.tv/portal/index/search.html?k=SSNI-424&x=0&y=0::airtable::Avgle Link::https://api.avgle.com/v1/search/SSNI-424/0?limit=10&t=a&o=bw::airtable::Javlibrary Link::http://www.javlibrary.com/cn/vl_searchbyid.php?keyword=SSNI-424
```

## [Python爬虫+可视化实例：网易云音乐歌单](https://www.jianshu.com/p/19e8e37d993c)

这个例子是直接爬html

## 抓包

发现接口地址是分开发的

普通接口用
https://music.163.com

个人接口用这个地址
https://interface.music.163.com

使用这个地址的东西全部都加密了 
URL	https://interface.music.163.com/eapi/playlist/v4/detail?cache_key=65S0B0MmjiVOLV47LzYG1ur%2BbWIMqWDS9Stt9NvmaIE4ktvT4HmPTcA%2Byr3W5KKQ&_nmclfl=1

返回这种 

```sh
�$��%+a�wn5�a���b�h��f�f/Ԓk2�XP��e�Vn��ݾ0�FOFb㋢�T�+,��C�Y�p%��Ft]t�����WO���$T������Ql8A�=��d��4&'GB�W6
��ha?�B�/�lsq��4nƙ�G<�u"/�e��m�×P��GM͆��\eljZ�s�/�5��7�M�����,������i-�R��3����xW�`�:�#�a���G���k��nn���o.2�2tB���
�y)���ј��Ͳ�S�Y��rT4Ж�dn��j�]����b�,��$-u탙�㐮�%3˂��2Qs��!�~LUs��Y���0l���֡�)�MW�:����Cw�Gudj�!��A5�+�ҨPE�:�6���@�l.�ҿ�W�Q:�!��F_��c�����Vu9zc+UK�ϱ0�$�#1C��?���a<w�V6��^D���᫑�jS�A�Tl�y�9w2�KO�h�eh�β���西�J����%ī].^�9��T�8���;rvϼ!�M�֍B���A֛�C�*���i�	��I���+�/@��Y4Db�� F�a�e����nE<sZ���!L�ud
```


## 网上例子

同样歌单的接口 

```js
const response = await axios({
        method: 'post',
        url: 'https://music.163.com/api/v3/playlist/detail',
        headers: {
            Referer: 'https://music.163.com/',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            id: id,
        }),
    });
```

这个接口则没有加密

## 利用公开接口的项目

https://github.com/Binaryify/NeteaseCloudMusicApi

该项目应该是使用公开接口的



