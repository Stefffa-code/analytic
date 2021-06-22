<template>
<!-- :class="{'notifications': User.confirm_email == 0 }" -->
<div class="wrap-mail-layout"  >
  <!-- <ConfirmEmail v-if="User.confirm_email == 0" /> -->
  
  <div class="main-layuot" > 
    <Sidebar  />

    <main class="main-layuot__content"  >
      <Navbar> 
        {{title}}
      </Navbar>
      <div class="d-loading" v-if="loading">
        <!-- <HumanPreloader :bg="'#202B49'"  /> -->
        <ThreeCircleLoader />
      </div>

      <router-view v-else></router-view> 
    </main>

  </div>
</div>
</template>

<script>
import Navbar from  '@/components/app/Navbar'
import Sidebar from  '@/components/app/Sidebar'
import StubPage from '../components/ui/stubs/StubPage'
import {mapGetters, mapActions, mapMutations} from 'vuex'
import HumanPreloader from '../components/ui/loaders/HumanPreloader'
import ThreeCircleLoader from '@/components/ui/loaders/ThreeCircleLoader'
import ConfirmEmail from '@/components/app/ConfirmEmail'



export default {
  name: 'main-layout',
  props: ['title', 'stub'],
  data: ()=> ({
    
  }),
  components: {
    Navbar, Sidebar, StubPage, HumanPreloader, ConfirmEmail, ThreeCircleLoader
  },

  computed: {
    ...mapGetters(['loading', 'User']), 
  }
}
</script>

<style lang="scss">
@import '@/style/darkTheme.scss';

.d-loading{
  width: 100%;
  height: 100%;
  background-color: $paperBg;
}
main{
  position: relative;
  margin-left: 60px;
  overflow-x: auto ;
}
.main-layuot-no-scroll{
  overflow: hidden;
}
.wrap-mail-layout{
  height: inherit;
}
.main-layuot{
  height: inherit;
}

.wrap-mail-layout{
  height: inherit;
}
.main-layuot{
  height: inherit;
}

.main-layuot{
  // height: 100%;  
  display: flex;    
  position: relative;
  align-items: stretch;
  border-bottom: 1px solid transparent;
  &__content{
    flex-grow: 1;    
    background:  $paperGradient;
  }
}
.notifications{
  height: calc(100% - 23px);
}
</style>

