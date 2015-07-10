/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Process =  new Array();
            
            
var BotonesWindow={"closable" : true, // enable/disable close button
        "maximizable" : true, // enable/disable maximize button
        "minimizable" : true, // enable/disable minimize button
//        "collapsable" : true, // enable/disable collapse button
        "dblclick" : "maximize", // set action on double click. false, 'maximize', 'minimize', 'collapse'
        //"titlebar" : "transparent", // false, 'none', 'transparent'
        "minimizeLocation" : "left", // sets alignment of minimized dialogues
        "icons" : { // jQuery UI icon class
          "close" : "ui-icon-circle-close",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus"
          //"collapse" : "ui-icon-triangle-1-s",
          //"restore" : "ui-icon-bullet"}
      }
  };

var OptionsDataTable = 
    {            
//        "bJQueryUI": true,
//        "sPaginationType": "full_numbers",
//        "scrollCollapse": true,
        "oLanguage":
        {
            "sLengthMenu": "Mostrar _MENU_ registros por página",
            "sZeroRecords": "No se encontraron resultados",
            "sInfo": "Mostrados _START_ de _END_ de _TOTAL_ registro(s)",
            "sInfoEmpty": "Mostrados 0 de 0 of 0 registros",
            "sInfoFiltered": "(Filtrando desde _MAX_ total registros)"
        },
        "autoWidth" : false            
    };

var DatePicker = {
    closeText: 'Cerrar',
    prevText: '<Ant',
    nextText: 'Sig>',
    currentText: 'Hoy',
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
    dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
    weekHeader: 'Sm',
    dateFormat: 'dd/mm/yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
    };
    
function Notificacion(titulo,mensaje)
{    
    $.gritter.add({
            // (string | mandatory) the heading of the notification
            title: titulo,
            // (string | mandatory) the text inside the notification
            text: mensaje,
            // (string | optional) the image to display on the left
//            image: 'http://a0.twimg.com/profile_images/59268975/jquery_avatar_bigger.png',
            // (bool | optional) if you want it to fade out on its own or just sit there
            sticky: false,
            // (int | optional) the time you want it to be alive for before fading out
            time: ''
    });

    return false;

}