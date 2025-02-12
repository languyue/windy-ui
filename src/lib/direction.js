import Vue from 'vue'

Vue.directive('clickOnce', {
  inserted(el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        // const button = el.__vue__ // 获取 Vue 组件实例
        // if (!button.loading) {
        //   button.loading = true // 启用 loading 效果
        // }

        el.classList.add('is-disabled')
        el.disabled = true
        let clearStatus = function () {
          el.disabled = false
          el.classList.remove('is-disabled')
          // button.loading = false // 关闭 loading 效果
        }

        if (
          binding.value &&
          binding.value === 'function' &&
          binding.value() &&
          typeof binding.value().then === 'function'
        ) {
          const result = binding.value()
          result
            .then(() => {
              clearStatus()
            })
            .finally(() => {
              clearStatus()
            })
        } else {
          setTimeout(() => {
            clearStatus()
          }, 1000)
        }
      }
    })
  },
})

Vue.directive('auth', {
  inserted(el, binding, vnode) {
    // 监听 rbacList 的变化
    const vm = vnode.context // 获取 Vue 实例
    const checkPermission = () => {
      const res = vm.$store.state.rbacList
      // 判断是否包含权限，若不包含则移除元素
      if (!res.includes(binding.value)) {
        el.remove()
      }
    }

    // 检查是否已经有数据
    if (vm.$store.state.rbacList && vm.$store.state.rbacList.length) {
      checkPermission()
    } else {
      // 监听 rbacList 的变化
      const unwatch = vm.$watch(
        () => vm.$store.state.rbacList,
        (newVal) => {
          if (newVal && newVal.length) {
            checkPermission()
            unwatch() // 获取到数据后，停止监听
          }
        }
      )
    }
  },
})
