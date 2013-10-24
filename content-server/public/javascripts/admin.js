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
});