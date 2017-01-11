$(function(){

	function resetSwitcher(type) {
		$('.switcher-'+type+'-images img').addClass('faded')
		$('.switcher-'+type).removeClass('active')
	}

	$('#switcher-inbox-1').click(function(){
		resetSwitcher('inbox')

		$('.switcher-inbox-images img.first').removeClass('faded')

		$(this).addClass('active')
	})

	$('#switcher-inbox-2').click(function(){
		resetSwitcher('inbox')

		$('.switcher-inbox-images img.second').removeClass('faded')
		$(this).addClass('active')
	})

	$('#switcher-monitoring-1').click(function(){
		resetSwitcher('monitoring')

		$('.switcher-monitoring-images img.first').removeClass('faded')

		$(this).addClass('active')
	})

	$('#switcher-monitoring-2').click(function(){
		resetSwitcher('monitoring')

		$('.switcher-monitoring-images img.second').removeClass('faded')
		$(this).addClass('active')
	})
})

