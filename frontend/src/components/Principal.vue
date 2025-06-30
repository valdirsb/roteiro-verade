<template>
    
    <h3 class="text-center mb-0 header">CRIADOR DE ROTEIRO</h3>

    <div class="container chat-box mt-0" ref="chatContainer">
        <ChatBox v-for="mensagem, key in mensagens.slice().reverse()" :mensagem="mensagem" :key="key"  />
    </div>

    <div class="mt-3 p-3 border rounded fixed-bottom">
        <div class="input-box">
            <div class="input-group mb-3">
                <select class="form-select" id="personagem" v-model="personagemAtivo">
                    <option v-for="personagem in personagens" :key="personagem.nome" >{{ personagem.nome }}</option>
                </select>
                <input v-model="texto" type="text" class="form-control form-control-lg" @keyup.enter="enviarMensagem" placeholder="Digite sua mensagem..." aria-label="Recipient's username" aria-describedby="button-addon2" autocomplete="off" name="personagem">
                <div class="input-group-append">
                    <button @click="enviarMensagem" class="btn btn-lg btn-outline-secondary" type="button" id="button-addon2">></button>
                </div>
            </div>
        </div>
    </div>
  
</template>
  
<script>

import ChatBox from './ChatBox.vue'

export default {

components: {
    ChatBox
},

data() {
    return {
        personagens: [
            { nome: 'Liry', avatar: '/liry.png' , cor:'purple' },
            { nome: 'Zad', avatar: '/zad.png', cor:'#ff7f00' },
            { nome: 'Kim', avatar: '/kim.png', cor:'green' },
            { nome: 'Camila', avatar: '/camila.png', cor:'red' },
            { nome: 'Texto de Ação', avatar: '', cor:'#d3d3d3' }
        ],
        mensagens: [],

        personagemAtivo: 'Liry',
        texto: '',

    }
},

methods: {
    enviarMensagem() {
        if (this.texto != '') {
            
            this.mensagens.push({
                personagem: this.personagemAtivo,
                texto: this.texto,
                avatar: this.personagens.find(p => p.nome === this.personagemAtivo).avatar,
                cor: this.personagens.find(p => p.nome === this.personagemAtivo).cor
            })
            this.texto = ''
            // this.scrollToEnd()
        }
    },

    // scrollToEnd() {
    //     this.$nextTick(() => {
    //         const chatBox = this.$refs.chatContainer;
    //         if (chatBox) {
    //             chatBox.scrollTop = chatBox.scrollHeight;
    //         }
    //     });
    // }


},


}


</script>
  
<style>
    .header {
        background: #9d44eb;
        color: #fff;
        padding: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .chat-box {
        height: 78vh; /* Defina uma altura fixa adequada */
        overflow-y: auto; /* Garante que a rolagem vertical seja permitida */
        display: flex;
        flex-direction: column-reverse;
        margin: 20px auto;
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 70px;
    }
  

  .message {
      display: flex;
      align-items: center;
      background: #e0e0d1;
      padding: 10px;
      border-radius: 20px;
      margin-bottom: 10px;
  }
  .message img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 10px;
  }
  .message strong {
      display: block;
  }
  .input-box {
      display: flex;
      gap: 10px;
  }
  .fixed-bottom {
      position: fixed;
      bottom: 0;
      width: 100%;
      background: white;
      z-index: 1000;
  }

  
</style>