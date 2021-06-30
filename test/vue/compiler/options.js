import modules from './modules/index.js'

export const baseOptions = {
  modules
}

export default {
  outputSourceRange: true,
  isPreTag: (tag) => tag === 'pre',
  modules
}
