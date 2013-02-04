
(function($){
		
	$(document).ready(function(){

		var currentpage = 0;

		// Search MediaSilo for the most recent files

		function search(days,searchitem){

			// If no timespan is given, set the default to 30
			var dateCreated = new Date();
			var timespan = days.length!=0 ? days : 30;
			var searchargument = searchitem!=null ? searchitem : '';
  			var time = parseInt(dateCreated.getTime()/1000);
			var delta = eval(time - parseInt(timespan)*24*60*60);

			// Only use timespan if no specific search value was entered
    		if(searchitem.length){
                 var searchQuery = "(or filename:'" + searchargument + "' title:'" + searchargument + "' description:'" + searchargument + "' tags:'" + searchargument + "' )";
            } else {
                 var searchQuery = "(and datecreated:"+delta+".. (or filename:'" + searchargument + "' title:'" + searchargument + "' description:'" + searchargument + "' tags:'" + searchargument + " ' ))";
            }

            // Clear the current list of thumbnails
            $('.thumbnails').html('');

            console.log(searchQuery);
            $.ajax({
				url: "api/index.php?method=proxycall&parameters=Asset.CloudAdvancedSearch&searchquery="+searchQuery+"&types=video&page="+currentpage+"&pagesize=24&orderby=datecreated_desc",
		        success: function(response, textStatus, jqXHR){
		            var data = $.parseJSON(response);
		            console.log(data)
		            for (var i = 0; i < data.ASSETS.length; i++){
                                          //
			            var thumbnailtemplate = 
							'<li class="span3">'+
								'<div class="thumbnail border-radius-top">'+
									'<div class="bg-thumbnail-img">'+
										'<a class="overlay" href="detail.html?id='+data.ASSETS[i].uuid+'">'+
											'<img src="assets/img/icons/play.png">'+
										'</a>'+
										'<a href="detail.html?id='+data.ASSETS[i].uuid+'"><img class="border-radius-top" width="200" height="160" src="https://preview.mediasilo.com/?thumbnail=200x160&format=jpg&quality=90&src='+data.ASSETS[i].thumbnail_large+'"></a>'+
									'</div>'+
									'<h5><a href="detail.html?id='+data.ASSETS[i].uuid+'">'+data.ASSETS[i].title+'</a></h5>'+
								'</div>'+
								'<div class="box border-radius-bottom">'+
									'<p>'+
										'<span class="title_torrent pull-left">Movie</span>'+
										'<span class="number-view pull-right"><i class="icon-white icon-eye-open"></i>'+formatdate(data.ASSETS[i].datecreated)+'</span>'+
									'</p>'+
								'</div>'+
							'</li>';

						$('.thumbnails').append(thumbnailtemplate);
					}
			    },
		        error: function(jqXHR, textStatus, errorThrown){
		            console.log(
		                "The following error occured: "+errorThrown
		            );
		        }
			}
		)}
		
		function formatdate(val){
			console.log(val);
			return val;
		}
			
		// Return the asset detail for display
 		function getdetail(assetid){
 			$.ajax({
		        url: "api/index.php?method=proxycall&parameters=Asset.GetByUUID&uuid="+assetid,
				success: function(response, textStatus, jqXHR){
		            var data = $.parseJSON(response);
       	 	
       	 			$("#clip-title").html(data.ASSETS[0].title);
       	 			$("#video-play").html('');
       	 	
       	 			jwplayer("video-play").setup({
				        width: '680',
				        height: '382',
				        playlist: [{
				        	image: data.ASSETS[0].thumbnail_large,
				        	sources: [
				            	{ 
				            		file: data.ASSETS[0].fileaccess.stream.streamer+'/mp4:'+data.ASSETS[0].fileaccess.stream.url,
				            		provider: 'rtmp'
				            	}
				        	],
				        	title: data.ASSETS[0].title
				    	}],
			        	primary: 'flash'
			    	});
				 },
		        error: function(jqXHR, textStatus, errorThrown){
		            console.log(
		                "The following error occured: "+errorThrown
		            );
		        }
		    });
 		}



 		// Magic dust for the text input box
 		$('input.box-text').bind('focus blur', function(){
			$(this).toggleClass('focus');
		});

 		$('.bg-thumbnail-img').hover(function(){
			$(this).find('.overlay').show();
			$(this).find('.overlay').next().css({'opacity': 0.1});
		},function(){
			$(this).find('.overlay').hide();
			$(this).find('.overlay').next().css({'opacity': 1});
		});


 		// Trigger search when user submits search query
		$('#search').on('submit', function(event){
			event.preventDefault();
			search(30,$('#searchquery').val());
		});


		// Utility function to read the asset ID
        function GetURLParameter(sParam){
		    var sPageURL = window.location.search.substring(1);
		    var sURLVariables = sPageURL.split('&');
		    for (var i = 0; i < sURLVariables.length; i++) {
		        var sParameterName = sURLVariables[i].split('=');
		        if (sParameterName[0] == sParam){
		            return sParameterName[1];
		        }
		    }
		}


		// Execute when script is loaded and page is rendered
    
        // Run the default search
        search(60,'');

        // Check if we're on the detail page, if so load detail
        var assetid = GetURLParameter('id');
        if(assetid != undefined){
        	getdetail(assetid);
        }

	});

})(jQuery);
