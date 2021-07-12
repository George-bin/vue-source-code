import * as nodeOps from './node-ops.js'
import { createPatchFunction } from '../../core/vdom/patch.js';
import baseModules from '../../core/vdom/modules/index.js'
import platformModules from './modules/index.js'

const modules = platformModules.concat(baseModules)

export const patch = createPatchFunction({ modules, nodeOps })
