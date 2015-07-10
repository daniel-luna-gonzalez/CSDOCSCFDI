/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var HideClose={show: { effect: "blind", duration: 800 },
              hide: { effect: "fade", duration: 500 }};

var ButtonsWindows={Buttons:function(){$(this).dialog('close');}};
var WindowError={width:400, height:500, minWidth:300, minHeight:400, modal:true, title:"Error en la Operación",buttons: {Aceptar: function() {$( this ).remove();}}};
var WindowAdvertencia={width:300, height:300, minWidth:300, minHeight:300, modal:true, title:"Advertencia",buttons: {Aceptar: function() {$( this ).remove();}}};
var WindowExito={width:300, height:300, minWidth:300, minHeight:300,draggable:false, modal:true, title:"Operación realizada con éxito",buttons: {Aceptar: function() {$( this ).remove();}}};
var WindowSalida={width:300, height:550, minWidth:300, minHeight:300, modal:true, title:"Registro de Resultados de Operación",show: { effect: "blind", duration: 800 },buttons: {Aceptar: function() {$( this ).remove();}}};
var WindowConfirmacion={width:300, height:300, minWidth:300, minHeight:250,draggable:false, modal:true, title:"Mensaje de Confirmación",buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowLoading={width:200, height:200, minWidth:200, minHeight:200,draggable:false, modal:true,open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}};


//Borra la brra de título de los dialogs
//open: function() { $(this).closest(".ui-dialog").find(".ui-dialog-titlebar:first").hide(); }


function Salida(mensaje)
{    
    $('#MensajeSalida').remove();
    $('body').append('<div id = "MensajeSalida"></div>');
    $('#MensajeSalida').dialog(WindowSalida);
    $('#MensajeSalida').empty();
    $('#MensajeSalida').append('<p><center><img src="img/edit_icon.png"></center></p>');
    $('#MensajeSalida').append(mensaje);
}
function Error(mensaje)
{
    $('#MensajeError').remove();
    $('body').append('<div id = "MensajeError"></div>');
    $('#MensajeError').dialog(WindowError);
    $('#MensajeError').empty();
    $('#MensajeError').append('<p><center><img src="img/fallo.png"></center></p>');
    $('#MensajeError').append(mensaje);
}

function Advertencia(mensaje)
{
    $('#MensajeAdvertencia').remove();
    $('body').append('<div id = "MensajeAdvertencia"></div>');
    $('#MensajeAdvertencia').dialog(WindowAdvertencia);
    $('#MensajeAdvertencia').empty();
    $('#MensajeAdvertencia').append('<p><center><img src="img/caution.png" width = "50px" heigth = "50px"></center></p>');
    $('#MensajeAdvertencia').append(mensaje);
}

function Exito(mensaje)
{
    $('#MensajeExito').remove();
    $('body').append('<div id = "MensajeExito"></div>');
    $('#MensajeExito').dialog(WindowExito);
    $('#MensajeExito').empty();
    $('#MensajeExito').append('<p><center><img src="img/success.png" width="80px" heigth="80px"></center></p>');
    $('#MensajeExito').append(mensaje);
}

function Loading()
{
    $('#Loading').remove();
    $('body').append('<div id="Loading"\n\
><center><img src="../img/loading.gif"></center></div>');
    $('#Loading').dialog(WindowLoading);    
//    ''
}

/*
 * Error cuando la respuesta viene en formato XML
 */
function ErrorXml(xml)
{
    $('#MensajeErrorXml').remove();
    $('body').append('<div id = "MensajeErrorXml"></div>');
    $('#MensajeErrorXml').dialog(WindowError);
    $('#MensajeErrorXml').empty();
    $('#MensajeErrorXml').append('<center><img src="img/fallo.png"></center>');
       
    $(xml).find("Error").each(function()
    {
        var $Error=$(this);
        var estado=$Error.find("Estado").text();
        var mensaje=$Error.find("Mensaje").text();
        $('#MensajeErrorXml').append(mensaje);
        return;
    });   
}

function ExitoXml(xml)
{
    $('#MensajeExitoXml').remove();
    $('body').append('<div id = "MensajeExitoXml"></div>');
    $('#MensajeExitoXml').dialog(WindowExito);
    $('#MensajeExitoXml').empty();
    $('#MensajeExitoXml').append('<center><img src="img/success.png" width="80px" heigth="80px"></center>');
       
    $(xml).find("Exito").each(function()
    {
        var $Instancias=$(this);
        var estado=$Instancias.find("Estado").text();
        var mensaje=$Instancias.find("Mensaje").text();
        $('#MensajeExitoXml').append(mensaje);
        return;
    });   
}

