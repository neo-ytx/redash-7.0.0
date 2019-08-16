import 'brace/mode/snippets';
import template from './edit.html';

function SnippetCtrl($routeParams, $http, $location, toastr, currentUser, AlertDialog, QuerySnippet) {
  this.snippetId = $routeParams.snippetId;

  this.editorOptions = {
    mode: 'snippets',
    advanced: {
      behavioursEnabled: true,
      enableSnippets: false,
      autoScrollEditorIntoView: true,
    },
    onLoad(editor) {
      editor.$blockScrolling = Infinity;
      editor.getSession().setUseWrapMode(true);
      editor.setShowPrintMargin(false);
    },
  };

  this.saveChanges = () => {
    this.snippet.$save((snippet) => {
      toastr.success('保存。');
      if (this.snippetId === 'new') {
        $location.path(`/query_snippets/${snippet.id}`).replace();
      }
    }, () => {
      toastr.error('保存代码段失败。');
    });
  };

  this.delete = () => {
    const doDelete = () => {
      this.snippet.$delete(() => {
        $location.path('/query_snippets');
        toastr.success('查询代码段已删除。');
      }, () => {
        toastr.error('删除查询代码段失败。');
      });
    };

    const title = '删除该代码段';
    const message = `你确定要删除 "${this.snippet.trigger}" 代码段?`;
    const confirm = { class: 'btn-warning', title: '删除' };

    AlertDialog.open(title, message, confirm).then(doDelete);
  };

  if (this.snippetId === 'new') {
    this.snippet = new QuerySnippet({ description: '' });
    this.canEdit = true;
  } else {
    this.snippet = QuerySnippet.get({ id: this.snippetId }, (snippet) => {
      this.canEdit = currentUser.canEdit(snippet);
    });
  }
}

export default function init(ngModule) {
  ngModule.component('snippetPage', {
    template,
    controller: SnippetCtrl,
  });

  return {
    '/query_snippets/:snippetId': {
      template: '<snippet-page></snippet-page>',
      title: '所有查询代码段',
    },
  };
}

init.init = true;
