<template>
  <div style="border: 1px solid #ccc;">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      ref="editor"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="onCreated"
      @onFocus="onFocus"
    />
  </div>
</template>
<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { i18nChangeLanguage } from '@wangeditor/editor';
import store from '@/core/services/store';
export default {
  components: { Editor, Toolbar },
  props: {
    content: { type: String },
    value: { type: String },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editor: null,
      html: '',
      toolbarConfig: {},
      editorConfig: {
        autoFocus: true,
        hoverbarKeys: {
          link: {
            menuKeys: ['editLink', 'unLink', 'viewLink'],
          },
          image: {
            menuKeys: [],
          },
        },
        MENU_CONF: {
          uploadImage: {
            onBeforeUpload(file) {
              return file;
            },

            onProgress(progress) {
              console.log('progress', progress);
            },

            // One file upload success
            onSuccess(file, res) {
              console.log(`${file.name} uploaded`, res);
            },
            async customUpload(file, insertFn) {
              const formData = new FormData();
              formData.append('image', file);
              // insert image
              store
                .dispatch('radiology/uploadResultImages', formData)
                .then(response => {
                  const host = window.location.origin;
                  const url = `${host}/${response.data.data}`;
                  insertFn(url, 'image');
                })
                .catch(error => {
                  console.error(`Image upload failed, ${error}`);
                });
            },
            maxNumberOfFiles: 10,
            allowedFileTypes: ['image/*'],
          },
          fontSize: {
            fontSizeList: ['12px', '16px', '24px', '40px'],
          },
          fontFamily: {
            fontFamilyList: ['Roboto, sans-serif', 'Arial', 'Tahoma', 'Verdana'],
          },
          color: {
            colors: ['#000', '#333', '#666'],
          },
        },
        customPaste: (editor, event) => {
          const html = event.clipboardData.getData('text/html'); // get paste html
          const text = event.clipboardData.getData('text/plain'); // get paste text

          // insert your custom text (sync)
          editor.insertText(text);

          // insert your custom text (async)
          setTimeout(() => {
            editor.insertText(html);
          }, 1000);

          event.preventDefault();
          return false;
        },
      },
      mode: 'default', // or 'simple'
    };
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor); // Use `Object.seal`
      i18nChangeLanguage('en');

      // Set editor content
      if (this.value || this.content) {
        this.editor.setHtml(this.value || this.content);
      }

      // Disabled editor
      if (!this.disabled) {
        this.editor.enable();
      }

      this.editor.on('change', () => {
        let html = this.editor.getHtml();
        const text = this.editor.getText();
        const editor = this.editor;
        if (html === '<p><br></p>') html = '';
        this.html = html;
        this.$emit('input', this.html);
        this.$emit('change', { html, text, editor });
      });

      this.$emit('ready', this.editor);
    },
    onFocus(editor) {
      this.editor = Object.seal(editor);
      if (this.disabled) {
        this.editor.disable();
      }
    },
  },
  watch: {
    content: {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, _oldVal) {
        if (this.editor) {
          if (newVal && newVal !== this.html) {
            this.html = newVal;
            this.editor.setHtml(newVal);
          } else if (!newVal) {
            this.editor.insertText('');
          }
        }
      },
    },

    value: {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, _oldVal) {
        if (this.editor) {
          if (newVal && newVal !== this.html) {
            this.html = newVal;
            this.editor.setHtml(newVal);
          } else if (!newVal) {
            this.editor.insertText('');
          }
        }
      },
    },
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // Timely destroy editor !
  },
};
</script>

<style src="../../node_modules/@wangeditor/editor/dist/css/style.css"></style>
