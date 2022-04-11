import Request from '../utils/request'

const request = new Request()

/**
 * 线上音频收藏/点赞
 *
 */
export function likeAndCollect(params) {
    return request.post('/miniapp/knowledge/collect', params)
}

