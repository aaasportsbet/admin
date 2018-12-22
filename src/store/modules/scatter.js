const scatter = {
  state: {eos: null},
  mutations: {
    SET_SCATTER_EOS(state, eos) {
      state.eos = eos;
    }
  },
  actions: {
    setScatterEOS({commit}, eos) {
      commit('SET_SCATTER_EOS', eos);
    }
  }
}

export default scatter
