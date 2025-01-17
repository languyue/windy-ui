<template>
  <div class="edit-content">
    <codemirror
      ref="codemirror"
      v-model="content"
      :options="options"
    ></codemirror>

    <div class="tip" v-if="language == 'javascript'">只支持ES5</div>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import '../lib/cm-setting'
export default {
  components: {
    codemirror,
  },
  props: {
    // 编辑器中呈现的内容
    codes: {
      type: String,
    },
    language: {
      type: String,
      default: 'application/json',
    },
    readonly: {
      type: Boolean,
      default: function () {
        return false
      },
    },
  },
  watch: {
    codes: {
      immediate: true,
      handler(val) {
        if (val) {
          this.content = val
        }
      },
    },
    content: {
      handler(n) {
        this.$emit('change', n)
      },
    },
    readonly: {
      handler(val) {
        console.log("fake", val)
        this.$set(this.options, 'readOnly', val)
        this.refreshEditor()
      },
    },
  },
  data() {
    return {
      monacoEditor: null,
      content: '',
      hoverProvider: null,
      options: {
        line: true,
        theme: 'lesser-dark', // 主题
        tabSize: 4, // 制表符的宽度
        readOnly: this.readonly, // 只读
        lineNumbers: true, // 是否显示行号
        styleActiveLine: true, // 高亮选中行
        mode: this.language,
      },
    }
  },
  methods: {
    getValue() {
      return this.content
    },
    refreshEditor() {
      this.$nextTick(() => {
        if (this.$refs.codemirror) {
          this.$refs.codemirror.codemirror.focus()
          this.$refs.codemirror.codemirror.refresh()
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.edit-content {
  position: relative;
  .tip {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #fff;
    opacity: 0.5;
  }
}
</style>
