<template>
  <div id="app">
    
    <component :is='layout' :title="title" :stub="stub">      
        <router-view />
    </component>
  </div>
</template>

<script>
import EmptyLayout from '@/layouts/EmptyLayout'
import MainLayout from '@/layouts/MainLayout'
import LoadingLayout from '@/layouts/LoadingLayout'

import store from '@/store'
import axios from 'axios'

import {mapGetters, mapActions, mapMutations} from 'vuex'


export default{
  components:{
    EmptyLayout, MainLayout, LoadingLayout,  
  },

  methods: {
    ...mapMutations(['reset_toast']),
  },
  
  computed: {
    ...mapGetters(['toastMessage', 'User']), 

    layout() {
      return (this.$route.meta.layout|| 'loading') + '-layout';
    },
    title(){
      return (this.$route.meta.title);
    },
    stub(){
      return (this.$route.meta.stub);
    }
  },

  watch: {
    'toastMessage.message'(){      
      if(this.toastMessage.message){   

        switch (this.toastMessage.type) {
          case 'info': this.$toast.info(this.toastMessage.message);
            break;
          case 'success': this.$toast.success(this.toastMessage.message);
            break;
          case 'error': this.$toast.error(this.toastMessage.message);
            break;
          case 'warning': this.$toast.warning(this.toastMessage.message);
            break;

          default: this.$toast.info(this.toastMessage.message);
            break;
        }
      }     
      this.reset_toast()
    }
  },

  created(){   }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss">
@import './style/typography.scss';
@import './style/common.scss';
@import './style/inputForm.scss';
@import './style/externalComponent.scss';
@import './style/ui.scss';
@import './style/style.scss';
@import './style/vue-animation.scss';


</style>
