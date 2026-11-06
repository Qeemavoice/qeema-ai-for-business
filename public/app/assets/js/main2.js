jQuery(document).ready(function(){
    $(".targetDiv").hide();
});


jQuery(function(){
 
   jQuery('.showSingle').click(function(){
      jQuery('.targetDiv').hide('.cnt');
      jQuery('#div'+$(this).attr('target')).slideToggle();

   }); 
});