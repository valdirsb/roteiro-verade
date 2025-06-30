<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <router-link to="/dashboard" class="back-link">
        Voltar ao Dashboard
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.not-found-container {
  text-align: center;
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  color: var(--primary-color);
  margin-bottom: 20px;
}

h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 20px;
}

p {
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.back-link {
  display: inline-block;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.back-link:hover {
  background: var(--primary-dark);
}
</style> 