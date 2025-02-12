<template>
  <div class="content">
    <Toolbar
      class="edit-title"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="edit-content"
      v-model="html"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="onCreated"
      @onChange="changeData"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

export default Vue.extend({
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      html: '<p></p>',
      toolbarConfig: {},
      editorConfig: { placeholder: '请输入内容...' },
      mode: 'default', // or 'simple'
    }
  },
  props: {
    content: {
      type: String,
      default: '',
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    content(val) {
      this.html = val
    },
    disable(val) {
      if (val) {
        this.editor.disable()
      } else {
        this.editor.enable()
      }
    },
  },
  methods: {
    changeData(editor) {
      console.log(editor.children)
    },
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
      if (this.disable) {
        this.editor.disable()
      }
    },
  },
  created() {
    this.html = this.content
  },
  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
    // setTimeout(() => {
    //   this.html = '<p>模拟请求</p>'
    // }, 1500)
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
})
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="less" scoped>
.content {
  border: 1px solid #ccc;

  .edit-content {
    height: 300px;
    overflow-y: hidden;
  }
  .edit-title {
    border-bottom: 1px solid #ccc;
  }
}
</style>
