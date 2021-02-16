const path = require('path');
const resolve = dir => path.join(__dirname, dir);
const axios = require('axios');
const bodyParser = require('body-parser');

module.exports = {
    publicPath: './',
    devServer: {
        before(app) {

            // Banner 焦点图
            app.get('/api/getTopBanner', function (req, res) {
                const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
                const jumpPrefixMap = {
                    10002: 'https://y.qq.com/n/yqq/album/',
                    10014: 'https://y.qq.com/n/yqq/playlist/',
                    10012: 'https://y.qq.com/n/yqq/mv/v/'
                }

                axios.get(url, {
                    headers: {
                        referer: 'https://u.y.qq.com/',
                        host: 'u.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    response = response.data
                    if (response.code === 0) {
                        const slider = []
                        const content = response.focus.data && response.focus.data.content
                        if (content) {
                            for (let i = 0; i < content.length; i++) {
                                const item = content[i]
                                const sliderItem = {}
                                const jumpPrefix = jumpPrefixMap[item.type || 10002]
                                sliderItem.id = item.id
                                sliderItem.linkUrl = jumpPrefix + item.jump_info.url + '.html'
                                sliderItem.picUrl = item.pic_info.url
                                slider.push(sliderItem)
                            }
                        }
                        res.json({
                            code: 0,
                            data: {
                                slider
                            }
                        })
                    } else {
                        res.json(response)
                    }
                }).catch((e) => {
                    console.log(e)
                })
            })

            // 推荐歌单列表
            app.get('/api/getDiscList', function (req, res) {
                const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';

                axios.get(url, {
                    headers: {
                        referer: 'https://c.y.qq.com/',
                        host: 'c.y.qq.com'
                    },
                    params: req.query
                }).then(response => {
                    res.json(response.data)
                }).catch(err => {
                    console.log(err);
                })
            })

            // 歌曲URL
            app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
                const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
                axios.post(url, req.body, {
                    headers: {
                        referer: 'https://y.qq.com/',
                        origin: 'https://y.qq.com',
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                }).then(response => {
                    res.json(response.data);
                }).catch(err => {
                    console.log(err);
                })
            })

            // 歌词
            app.get('/api/lyric', function (req, res) {
                const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

                axios.get(url, {
                    headers: {
                        referer: 'https://c.y.qq.com/',
                        host: 'c.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    let ret = response.data
                    if (typeof ret === 'string') {
                        const reg = /^\w+\(({.+})\)$/
                        const matches = ret.match(reg)
                        if (matches) {
                            ret = JSON.parse(matches[1])
                        }
                    }
                    res.json(ret)
                }).catch((e) => {
                    console.log(e)
                })
            })

            //歌单歌曲列表
            app.get('/api/getCdInfo', function (req, res) {
                const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
                axios.get(url, {
                    headers: {
                        referer: 'https://c.y.qq.com/',
                        host: 'c.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    let ret = response.data
                    if (typeof ret === 'string') {
                        const reg = /^\w+\(({.+})\)$/
                        const matches = ret.match(reg)
                        if (matches) {
                            ret = JSON.parse(matches[1])
                        }
                    }
                    res.json(ret)
                }).catch((e) => {
                    console.log(e)
                })
            })
        }
    },
    chainWebpack: config => {
        config.resolve.alias
            .set('api', resolve('src/api'))
            .set('style', resolve('src/assets/style'))
            .set('base', resolve('src/components/base'))
            .set('common', resolve('src/components/common'))
            .set('config', resolve('src/config'))
            .set('page', resolve('src/page'))
            .set('images', resolve('src/assets/images'))
    }

}