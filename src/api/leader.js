// 领袖专题
import Request from "../utils/request"

const request = new Request()

/**
 * 领袖专题
 *
 * @export
 * @param {number} [page=1] 页码
 * @returns
 */
export function getLeader(page = 1) {
  return request.post("/miniapp/adv/index", { type: 2, page })
}
