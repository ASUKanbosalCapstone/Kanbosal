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

$(function () {
    $("#cardGenCreate").click(function () {
        var description = $("#grant-descr-editor").html();
        var grantName = $("#grantName").val();
        var grantUrl = $("#grantUrl").val();
		/* var grantTemplate = $.ajax({
			url : '/templates/overviewPanel.html',
			dataType: 'html',
			method: 'GET',
			success: function(data) {
				newGrantTemplate = Handlebars.compile(data);
			}
		}); */
		
        var myGrant = {
            Grant_Name : grantName,
            Description : description,
            Url : grantUrl,
            Users : [],
            Card_Count : 0,
            Grant_Columns: [
                {
                    Progress: 0.0,
                    To_Do: [],
                    In_Progress: [],
                    Complete: []
                },
                {
                    Progress: 0.0,
                    To_Do: [],
                    In_Progress: [],
                    Complete: []
                },
                {
                    Progress: 0.0,
                    Cards: []
                },
                {
                    Progress: 0.0,
                    To_Do: [],
                    In_Progress: [],
                    Complete: []
                }
            ]
        };
		
        $.ajax({
            url: 'http://localhost:3000/grants',
            type: 'PUT',
            data: JSON.stringify(myGrant),
            contentType: 'application/json'			
        });
	});
});
