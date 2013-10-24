$(function(){

	var $addAnswer = $('#add-answer');
	var $newAnswer = $('#new-answer');
	var $confirm = $('#confirm');

	//Init Event Listeners
	$addAnswer.click(function(e){
		e.preventDefault();
		$newAnswer.show();
		$confirm.show();
	});
	$confirm.click(function(e){
		console.log($newAnswer.val());
	})
	$('.edit').click(function(e){
		e.preventDefault();
		var row = $(e.currentTarget).parent().parent().parent();
		row.find('.static').hide();
		row.find('.update').show();
	});
	$('.cancel').click(function(e){
		e.preventDefault();
		var row = $(e.currentTarget).parent().parent().parent();
		row.find('.static').show();
		row.find('.update').hide(); 
	})
});