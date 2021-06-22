<template>
  <div>
    <base-submenu v-for="(department, index) in departments"
                 :key="'department-filter-' + index"
                 :menu="department.entityShort"
                 :selectedChildren="selectedUsers()"
                 :selectedParent="ifSelectDepartment(department.id)"
                 @clickChild="clickDepartmentChild($event)"
                 @clickParent="clickDepartment(department.entityShort.id)"
    />
  </div>
</template>

<script>
  import BaseSubmenu from "./BaseSubmenu.vue";
  import {AppStorage} from "../../../AppStorage";


  export default {
    name: 'DepartmentsFilter',

    components: {BaseSubmenu },

    props: {
      filter: { type: Object, required: true }
    },

    data() {
      return {
        departments: [],
        pipelines: [],
        segments: [],
      }
    },

    methods: {
      selectedUsers(){
        return this.filter.usersId
      },

      clickDepartmentChild(data){
        let select = this.filter.usersId.includes(data.child.id)

        if(select) this.filter.uncheckUsers([data.child.id])
        else  this.filter.checkUsers([data.child.id])

        this.$emit('changeFilter')
      },

      clickDepartment(id){
        let select = this.ifSelectDepartment(id)

        if(select) this.filter.uncheckDepartments([id])
        else  this.filter.checkDepartments([id])
        this.$emit('changeFilter')
      },

      ifSelectDepartment(id){
        return this.filter.departments.includes(id)
      },
      },

    mounted() {
      this.departments = AppStorage.departments.data
    }

  }
</script>

