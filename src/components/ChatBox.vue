<template>
    <div class="message" :style="{'background-color': mensagem.cor }" >
        <img v-if="mensagem.personagem != 'Texto de Ação'" :src="mensagem.avatar" :alt="mensagem.personagem">
        <div :class="mensagem.personagem != 'Texto de Ação'?'cor':''">
            <strong v-if="mensagem.personagem != 'Texto de Ação'">{{ mensagem.personagem }}</strong>
            <span>{{ mensagem.texto }}</span>
        </div>
    </div>
</template>

<script>
export default {
props: ['mensagem'],
data() {
    return {
      count: 0
    }
  }
}
</script>

<style scoped>

.cor{
    color: white;
}

</style>