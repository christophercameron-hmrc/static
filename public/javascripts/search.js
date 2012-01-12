$(document).ready(function() {
	// this is for custom formating of results
   $.extend( $.ui.autocomplete.prototype, {
    
    _renderItem: function( ul, item) {
      var list = "<li></li>";
      if (item['class']) {
        list = "<li class=\""+item['class']+"\"></li>";
      }
			// temp until the service actually returns us a type
			else{
				list = "<li class=\"guide\"></li>";
			}
      return $( list )
        .data( "item.autocomplete", item )
        .append( $( "<a href='"+item['url']+"'></a>" ).html( item.html || item.label ) )
        .appendTo( ul );
    }
  });

  var preloaded_search_data = false;
  /* Preload some common searches into the autocomplete box */
  $.getJSON('/preload-autocomplete', function(data) {
    preloaded_search_data = data.map( function(e) {
      return { 'label': e.title, 'url': e.link, 'class': e.format };  
    });
  });

  var filter_terms = function(search_term,data) {
    var highlight_term = function(string,term) {
      html_safe = html_escape(string);
      var terms = term.split(' ');
      for (var i in terms)  {
        var clean_term = html_escape(terms[i].replace(/^\s+|\s+$/g, ''));
        if (clean_term != "") {
          var regex = new RegExp("\\b("+clean_term+")","ig");
          var count = 0;
          html_safe = html_safe.replace(regex,function(str){
            count++;
            return str;
          });
          if (count < 1) {
            return false;
          }
        }
      }
      return html_safe;
    };

    return $.map(data, function(item) {
      if (highlight_term(item.label,search_term)) {
        return {
          label: html_escape(item.label),
          html:  highlight_term(item.label,search_term),
          url:   item.url
        };
      }
    });
  };

  var html_escape = function( string) {
      return $('<div/>').text(string).html();
  };

	/* Smoke and mirrors search hint */
	$("#main_autocomplete").live("focus", function(){
	  if($(".hint-suggest").length == 0){
	    $("#search_hint").after("<span class='hint-suggest'><em>Type for suggestions</em></span>");
      $("#search_hint").addClass("visuallyhidden");
    }
	});
	
	$("#site-search-text").live("focus", function(){
	  if($(".hint-suggest").length == 0){
	      var attachPoint = $(this).parent("fieldset");
	      attachPoint.append("<span class='hint-suggest'><em>Type for suggestions</em></span>");
      }
	});
	
	$("#site-search-text, #main_autocomplete").live("blur", function(){
	  $(".hint-suggest").remove();
	  $("#search_hint").removeClass("visuallyhidden");
	});
	
  $("#site-search-text, #main_autocomplete").autocomplete({ 
    delay: 300,
    width: 300, 
    source: function(req, add){  
      $(".hint-suggest").text("Loading...");
      if($(".search-landing").length == 0){
        $(".hint-suggest").addClass("search-loading");
      }
      if (req.term.length > 3 || preloaded_search_data == false) {
        $.ajax({
          url: $("form[role=search]")[0].action.replace(/search$/, "autocomplete?q="+req.term),
          dataType: "json",
          cache: true,
          success: function(data) {
            var results = $.map(data, function(e) {
              return { 'label': e.title, 'url': e.link, 'class': e.format };
            });
            add(results)
          },
          error: function(){
            $(".hint-suggest").removeClass("search-loading");
            $(".hint-suggest").text("No results found");
          }
        });
      } else {
        add( filter_terms(req.term,preloaded_search_data) );
      }
    },  
    select: function(event, ui) {
      location.href = ui.item.url;
    },
    open: function(event, ui){
      if($("#site-search-text").length != 0){
        // all this just to move the ul to the left by an offset
        var offset = $("#site-search-text").offset(),
        leftoffset = offset.left,
        width = $("#site-search-text").width();

        var newLeft = (leftoffset - width);
        $(".ui-autocomplete").css("left", newLeft+"px").css("width", ((width*2)+4)+"px");
      }
      // quickly add the search value to end of list
      var searchVal = $(".ui-autocomplete-input").attr("value");
      var searchUrl = $("#search")[0].action;
      $(".ui-autocomplete").append("<li class='search-site ui-state-hover'><a href='"+searchUrl+"?q="+searchVal+"' class='ui-corner-all' tabindex='-1'>Search for <em>"+searchVal+"</em></li>");
      $("#search_hint").remove();
    }
  });
  
});
