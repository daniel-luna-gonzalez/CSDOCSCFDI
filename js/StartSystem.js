

/* global EnvironmentData */

$(document).ready(function() {

//Se esconde el dock
$('#dock_').css('display', 'none');

/* The alias name is the database instance name  */
var EnterpriseAlias = window.location.pathname;
EnvironmentData.EnterpriseAlias = EnterpriseAlias.replace('.html','');
EnvironmentData.EnterpriseAlias = EnvironmentData.EnterpriseAlias.replace('/','');
$(document).attr('title',EnvironmentData.EnterpriseAlias);
//-----------------------------------------------------------------------------------
//	1.	Clock
//-----------------------------------------------------------------------------------

var users = new UsersManager();
var CheckUserRoot = users.CheckIfExistRoot();

var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Augosto", "Septiembre", "Octubre", "Noviembre", "Deciembre" ]; 
var dayNames= ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]

var newDate = new Date();
newDate.setDate(newDate.getDate());

$('#DateAbbr').html(dayNames[newDate.getDay()].substr(0,3) + " ");

setInterval( function() {
	var minutes = new Date().getMinutes();
	$(".min, .mins").html(( minutes < 10 ? "0" : "" ) + minutes);
    },1000);
	
setInterval( function() {
	var hours = new Date().getHours();
	$(".hours, .hour").html(( hours < 10 ? "0" : "" ) + hours);
    }, 1000);
    
//-----------------------------------------------------------------------------------
//	2.	Fix Classes after Validate Login
//-----------------------------------------------------------------------------------

$('#boton_login').click(function() {
        login();
});


//-----------------------------------------------------------------------------------
//	4.	Dock
//-----------------------------------------------------------------------------------

$('.dock ul li').hover(
	function(){
		$(this).addClass('ok').prev().addClass('prev').prev().addClass('prev-ancor');
		$(this).addClass('ok').next().addClass('next').next().addClass('next-ancor');
	},
	function(){
		$('.dock ul li').removeClass('ok prev next next-ancor prev-ancor');
	}
);

}); 

function StartSystem()
{
     $('input[type=password]').addClass('valid');
     $('#form_user').addClass('valid');
     $('#SystemEnterprisesForm').addClass('valid');
     $('#select_login_instancias').addClass('valid');
     $('#boton_login').removeClass('submit').addClass('charge');
     $('#pageLogin').addClass('initLog').delay(1900).queue(function() { $(this).removeClass('initLog').addClass('initLogExit'); $(this).dequeue(); });;
     $('#page, #head').delay(2500).queue(function() { $(this).addClass('vis'); $(this).dequeue(); });                                
     setTimeout(function() { $('#dock_').css('display', 'block');}, 4000);  
}

function DeniedSystemStart()
{
    $('#form_usuario').select();
    $('#form_password').select();              
    $('.validate').addClass('error').delay(210).queue(function() { $(this).removeClass('error'); $(this).dequeue();});
}