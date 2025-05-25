// APIエンドポイントの定義
export const API_ENDPOINTS = {
  // 認証関連
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CODE: '/api/auth/code',
  },

  // 単語管理
  WORDS: {
    USER_LIST: '/api/words/user',
    ALL_LIST: '/api/words/all',
    DETAIL: (wordId) => `/api/words/${wordId}`,
    ADD: '/api/words/user/add',
    REMOVE: '/api/words/user/remove',
    UPDATE_LEARNING_STATUS: (wordId) => `/api/words/${wordId}/learning-status`,
  },

  // センテンス管理
  SENTENCES: {
    LIST: '/api/sentences',
    REMOVE: (sentenceId) => `/api/sentences/${sentenceId}/remove`,
    UPDATE_LEARNING_STATUS: (sentenceId) => `/api/sentences/${sentenceId}/learning-status`,
  },

  // イディオム管理
  IDIOMS: {
    LEARNING_LIST: '/api/idioms/learning',
    DETAIL: (idiomId) => `/api/idioms/${idiomId}`,
    LEARN: (idiomId) => `/api/idioms/${idiomId}/learn`,
    UPDATE_STATUS: (idiomId) => `/api/idioms/${idiomId}/status`,
    FAVORITE: (idiomId) => `/api/idioms/${idiomId}/favorite`,
  },

  // 会話管理
  CONVERSATIONS: {
    LIST: '/api/conversations',
    GENERATE: '/api/jobs/conversation-generation',
  },

  // その他
  MISC: {
    TEXT_INPUT: '/api/input',
    SPEAKERS: '/api/speakers',
    GRAMMARS: '/api/grammars',
  },
}; 