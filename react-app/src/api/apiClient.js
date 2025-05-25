import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });

    // 初期化時にローカルストレージからトークンを読み込む
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.setAuthToken(storedToken);
    }

    // レスポンスインターセプターを設定
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 認証エラー（401）の場合の処理
        if (error.response && error.response.status === 401) {
          // ローカルストレージのトークンを再確認
          const currentToken = localStorage.getItem('token');
          
          if (currentToken) {
            // トークンが存在する場合、再設定して再試行
            this.setAuthToken(currentToken);
            try {
              // 失敗したリクエストを再試行
              const originalRequest = error.config;
              return await this.client(originalRequest);
            } catch (retryError) {
              // 再試行も失敗した場合は、ログアウト処理を実行
              this.setAuthToken(null);
              localStorage.removeItem('token');
              window.location.href = '/login';
              return Promise.reject(retryError);
            }
          } else {
            // トークンが存在しない場合は、通常のログアウト処理
            this.setAuthToken(null);
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 認証トークンの設定
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // 共通のエラーハンドリング
  handleError(error) {
    console.error('API Error:', error);
    if (error.response) {
      // サーバーからのエラーレスポンス
      throw new Error(error.response.data.message || 'サーバーエラーが発生しました');
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      throw new Error('サーバーに接続できません');
    } else {
      // リクエストの作成時にエラー
      throw new Error('リクエストの作成に失敗しました');
    }
  }

  // GETリクエスト
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // POSTリクエスト
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // DELETEリクエスト
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // 単語関連のAPI
  words = {
    getUserWords: () => this.get(API_ENDPOINTS.WORDS.USER_LIST),
    getAllWords: () => this.get(API_ENDPOINTS.WORDS.ALL_LIST),
    getWordDetails: (wordId) => this.get(API_ENDPOINTS.WORDS.DETAIL(wordId)),
    addWord: (wordId) => this.post(API_ENDPOINTS.WORDS.ADD, { wordId }),
    removeWord: (wordId) => this.post(API_ENDPOINTS.WORDS.REMOVE, { wordId }),
    updateLearningStatus: (wordId, status) => 
      this.post(API_ENDPOINTS.WORDS.UPDATE_LEARNING_STATUS(wordId), { status }),
  };

  // センテンス関連のAPI
  sentences = {
    getList: () => this.get(API_ENDPOINTS.SENTENCES.LIST),
    remove: (sentenceId) => this.delete(API_ENDPOINTS.SENTENCES.REMOVE(sentenceId)),
    updateLearningStatus: (sentenceId, status) =>
      this.post(API_ENDPOINTS.SENTENCES.UPDATE_LEARNING_STATUS(sentenceId), { status }),
  };

  // イディオム関連のAPI
  idioms = {
    getLearningList: () => this.get(API_ENDPOINTS.IDIOMS.LEARNING_LIST),
    getDetails: (idiomId) => this.get(API_ENDPOINTS.IDIOMS.DETAIL(idiomId)),
    learn: (idiomId) => this.post(API_ENDPOINTS.IDIOMS.LEARN(idiomId)),
    updateStatus: (idiomId, status) => 
      this.post(API_ENDPOINTS.IDIOMS.UPDATE_STATUS(idiomId), { status }),
    toggleFavorite: (idiomId) => this.post(API_ENDPOINTS.IDIOMS.FAVORITE(idiomId)),
    getList: () => this.get(API_ENDPOINTS.IDIOMS.LIST),
  };

  // 会話関連のAPI
  conversations = {
    getList: () => this.get(API_ENDPOINTS.CONVERSATIONS.LIST),
    generate: (data) => this.post(API_ENDPOINTS.CONVERSATIONS.GENERATE, data),
    getDetails: (conversationId) => this.get(API_ENDPOINTS.CONVERSATIONS.DETAIL(conversationId)),
  };

  // その他のAPI
  misc = {
    processTextInput: (data) => this.post(API_ENDPOINTS.MISC.TEXT_INPUT, data),
    getSpeakers: () => this.get(API_ENDPOINTS.MISC.SPEAKERS),
    getGrammars: () => this.get(API_ENDPOINTS.MISC.GRAMMARS),
  };

  // 認証関連のAPI
  auth = {
    login: () => this.get(API_ENDPOINTS.AUTH.LOGIN),
    logout: () => this.get(API_ENDPOINTS.AUTH.LOGOUT),
    handleCode: (code, state) => this.post(API_ENDPOINTS.AUTH.CODE, { code, state }),
  };
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient(); 