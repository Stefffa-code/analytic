<template>
  <Accordeon class="menu-group"
             :class="{'uncheck': !selectedParent  }"
             :hoverEffect="'none'"
             :openByIcon="true"
  >
      <div slot="header" class="menu-group--name" @click="clickHeader()">
         <svg-icon :name="'add'" class="switch--svg-icon"  />
        {{menu.name}}
      </div>

      <div class="submenu" :key="'redraw-' + redraw" :class="{'forbid-event': !selectedParent }" >
        <div v-for="(item, index)  in menu.children" :key="'submenu-' + item.name + index"
             class="submenu--item"
             @click="clickOnSub(menu, item)"
             :class="{ 'selected': ifSelectedItem( item.id) }"
        >
          <div class="item-lighthouse" ></div>
          {{item.name}} - {{item.id}}
        </div>
      </div>

  </Accordeon>

</template>



<script>
  import Accordeon from '../../../../components/ui/accordeon/Accordeon.vue'
  import SvgIcon from '../../../../components/ui/SvgIcon.vue'

  export default {
    name: 'BaseSubmenu',
    props: {
      menu: {type: Object, required: true},
      selectedChildren: {type: Array, required: false},
      selectedParent: {type: Boolean, required: false, default:true},
    },

    components: { Accordeon, SvgIcon },

    data() {
      return {
        redraw: 0
      }
    },

    methods: {
      clickOnSub(parent, child){
        this.$emit('clickChild', {parent, child })
      },

      clickHeader(){
        this.$emit('clickParent')
      },

      ifSelectedItem(id){
        return this.selectedChildren.includes(id)
      },
    }
  }
</script>



<style lang="scss" scoped >
  @import '@/style/darkTheme.scss';
  .switch--svg-icon{
    width: 10px;
    height: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
  .forbid-event{
    pointer-events: none;
  }

   .menu-group{
     margin: 2px;
     background-color: $componentBg;
     border-radius: 4px;

     &--name{
       font-size: 16px;
       color: $text;
       cursor: pointer;
     }
   }

  .menu-group.uncheck{
    opacity: 0.6;
    .menu-group--name{
      color: $textSecondary;
    }
  }

  .submenu{
    font-weight: 300;
    color: $textSecondary;

    &--item{ 
      padding: 3px 0;
      cursor: pointer;
      font-weight: 300;

      &.selected{
        color: lighten( $textSecondary, 26);
        .item-lighthouse{
          background: $orange;
        }
      }
    }
    .item-lighthouse{
      display: inline-block;
      margin-right: 5px;
      width: 8px;
      height: 8px;
      border-radius: 10px;
      background: $textSecondary;
    }
  }
</style>
