function alertUnsavedChanges($window) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      isDirty: '=',
    },
    link($scope) {
      const unloadMessage = '离开此页面将失去做出的更改';
      const confirmMessage = `${unloadMessage}\n\n确定要离开这个页面吗？`;
      // store original handler (if any)
      const _onbeforeunload = $window.onbeforeunload;

      $window.onbeforeunload = function onbeforeunload() {
        return $scope.isDirty ? unloadMessage : null;
      };

      $scope.$on('$locationChangeStart', (event, next, current) => {
        if (next.split('?')[0] === current.split('?')[0] || next.split('#')[0] === current.split('#')[0]) {
          return;
        }

        if ($scope.isDirty && !$window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      });

      $scope.$on('$destroy', () => {
        $window.onbeforeunload = _onbeforeunload;
      });
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('alertUnsavedChanges', alertUnsavedChanges);
}

init.init = true;
