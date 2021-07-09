import * as nodeOps from './node-ops.js'
import { createPatchFunction } from '../../core/vdom/patch.js';

export const patch = createPatchFunction({ nodeOps })
