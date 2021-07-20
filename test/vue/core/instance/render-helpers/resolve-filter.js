import { resolveAsset } from "../../util/index.js";

// 获取 filter
export function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true)
}