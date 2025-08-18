export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated && to.path !== '/login') {
    console.log('Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login')
  }
})