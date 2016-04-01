var template;

$(function() {
  $.ajax({
    url: 'getOverview',
    type: 'GET',
    dataType: 'html',
    success: function(json) {
      var cardsArray = JSON.parse(json);
      var retrieved = {
        "grant" : cardsArray
      };

      $.ajax({
        url : 'templates/overviewPanel.html',
        dataType: 'html',
        method: 'GET',
        success: function(data) {
          template = Handlebars.compile(data);
          $("#overviewContent").append(template(retrieved));
          $('[data-toggle="tooltip"]').tooltip({container:'body'});
        }
      });
    }
  });

  $('#grant-descr-editor').markdown({
    resize: 'vertical',
    iconlibrary: 'fa',
    hiddenButtons: ['cmdPreview'],
    fullscreen: {
      enable: false
    },
    footer: '<small><div id="grant-descr-editor-ftr"></div></small>',
    onChange: function(e) {
      var content = e.parseContent();
      $('#grant-descr-editor-ftr').show().html(content);
    }
  });

  $('#grantGen * [data-toggle="popover"]').popover({
    container:'body',
    html : true
  });
});
