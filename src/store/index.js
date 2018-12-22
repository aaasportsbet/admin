import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import app from './modules/app'
import errorLog from './modules/errorLog'
import permission from './modules/permission'
import scatter from './modules/scatter'
import tagsView from './modules/tagsView'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    errorLog,
    permission,
    tagsView,
    user,
    scatter
  },
  getters
})

export default store
