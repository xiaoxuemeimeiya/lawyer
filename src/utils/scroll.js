import { throttle } from "./util"

/**
 * 滚动到底部/右边时触发
 */
export const onScrollToLower = throttle(function() {
  console.log(
    "滚动到底部/右边时触发--this.state.isScrollEnd=>" + this.state.isScrollEnd
  )

  this.getData()
}, 2000)
