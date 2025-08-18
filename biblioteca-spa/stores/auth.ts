import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null as any,
    token: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getUser: (state) => state.user,
    getAuthHeader: (state) => {
      return {
        'Authorization': 'Basic ' + btoa('admin:admin123')
      }
    }
  },

  actions: {
    login(username: string, password: string) {
      if (username === 'admin' && password === 'admin123') {
        this.isAuthenticated = true
        this.user = { username }
        this.token = btoa(`${username}:${password}`)
        
        if (process.client) {
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('auth_user', JSON.stringify(this.user))
        }
        
        console.log('Usuario autenticado correctamente')
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
      this.user = null
      this.token = null
      
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      
      console.log('Sesión cerrada')
    },

    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('auth_user')
        
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
          console.log('Autenticación restaurada desde localStorage')
        }
      }
    }
  }
})