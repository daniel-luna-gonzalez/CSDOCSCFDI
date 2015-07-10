/* global DatePicker */

/***********************************************************************************************
 * ********************************************************************************************
 *                                       Ventana de Error                                     *
 * ********************************************************************************************
 */
  var ventana_error={modal:true,maxHeigth:550,heigth:500, width:300,closeOnEscape:false, title:'Mensaje inesperado...', buttons: { "Aceptar": function (){ $(this).dialog("close");  }   }};
  var AnchoPantalla = $(window).width();
  var AnchoDialogMotor = AnchoPantalla * .80;
  var AltoPantalla = $(window).height();
  var AltoDialogMotor = AltoPantalla * 0.80;



/***********************************************************************************************
 *                                      Uso de mouse                                           *
 ***********************************************************************************************
 */
$(document).ready(function(){
    $("input").focus(function(){

                $(this).addClass("seleccionado");
        });
        $("input").blur(function(){
                $(this).removeClass("seleccionado");  

        });                        
});
/*
*****************************************************************************************************
*                                      Ventanas Content                                             *
*****************************************************************************************************
 */
  var wWidth = $(window).width();
  var dWidth = wWidth * .99;
  var wHeight = $(window).height();
  var dHeight = wHeight * 0.92;
function content_proveedores()
{
    $( ".barra_botones" ).buttonset();
    $( ".boton_busqueda" ).buttonset();
$.datepicker.regional['es'] = DatePicker;
    $.datepicker.setDefaults($.datepicker.regional['es']);
   $(function () {
       $("#ProviderStartDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
                onClose: function( selectedDate ) {$( "#ProviderEndDateForm" ).datepicker( "option", "minDate", selectedDate );}});
        $( "#ProviderEndDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
                onClose: function( selectedDate ) {$( "#ProviderStartDateForm" ).datepicker( "option", "maxDate", selectedDate );}});   
   });
   
   $('#proveedor_limpiar_fecha1').click(function(){ $('#ProviderStartDateForm').val(''); });
   $('#proveedor_limpiar_fecha2').click(function(){ $('#ProviderEndDateForm').val('');  });                              
    
    $( "#window_content_proveedor" ).dialog({height: dHeight,width: dWidth,closeOnEscape:false,minWidth:600,minHeigth:600,title:'Contenedor Facturas Proveedor'}).dialogExtend(BotonesWindow);          
    
    var enterprise = new Enterprise();
    var xml = enterprise.GetListEnterprisesXml('Provider');
    var miselect = $("#ProviderEnterprise");
    miselect.find('option').remove().end().append('').val('');
    $("#ProviderEnterprise").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
    $(xml).find("Enterprise").each(function()
    {
       var $Empresa=$(this);
       var id = $Empresa.find("IdEnterprise").text();
       var rfc = $Empresa.find("RFC").text();
       var nombre = $Empresa.find("Name").text();  
       $("#ProviderEnterprise").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
    });
    
    
//    proveedor_list_empresas();
}


function content_clientes()
{
    $( ".barra_botones" ).buttonset();
    $( ".boton_busqueda" ).buttonset();
    $.datepicker.regional['es'] = DatePicker;
    $.datepicker.setDefaults($.datepicker.regional['es']);
   $(function () {
       $("#ClientStartDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
            onClose: function( selectedDate ) {$( "#ClientEndDateForm" ).datepicker( "option", "minDate", selectedDate );}});
        $( "#ClientEndDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
                    onClose: function( selectedDate ) {$( "#ClientStartDateForm" ).datepicker( "option", "maxDate", selectedDate );}});   
   });
   
   $('#cliente_limpiar_fecha1').click(function(){$('#ClientStartDateForm').val('');});
   $('#cliente_limpiar_fecha2').click(function(){ $('#ClientEndDateForm').val('');});            
      
    $('#window_content_cliente').css({'display':''});
    $( "#window_content_cliente" ).dialog({height: dHeight,width: dWidth,  minWidth:dHeight,minHeigth:dWidth,closeOnEscape:false,title:'Contenedor Facturas Cliente'   }).dialogExtend(BotonesWindow);          
    
    
    var enterprise = new Enterprise();
    var xml = enterprise.GetListEnterprisesXml('Client');
    var miselect = $("#ClientEnterprise");
    miselect.find('option').remove().end().append('').val('');
    $("#ClientEnterprise").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
    $(xml).find("Enterprise").each(function()
    {
       var $Empresa=$(this);
       var id = $Empresa.find("IdEnterprise").text();
       var rfc = $Empresa.find("RFC").text();
       var nombre = $Empresa.find("Name").text();  
       $("#ClientEnterprise").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
    });
//    cliente_list_empresas();
}

function content_nomina()
{
    $( ".barra_botones" ).buttonset();
    $( ".boton_busqueda" ).buttonset();
    
    $.datepicker.regional['es'] = DatePicker;
    $.datepicker.setDefaults($.datepicker.regional['es']);
   $(function () {
       $("#PayRollStartDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
                onClose: function( selectedDate ) {$( "#PayRollEndDateForm" ).datepicker( "option", "minDate", selectedDate );}
            });
        $( "#PayRollEndDateForm" ).datepicker({defaultDate: "+1w",dateFormat:'yy-mm-dd',changeMonth: true,numberOfMonths: 3,isRTL: true,
            onClose: function( selectedDate ) {$( "#PayRollStartDateForm" ).datepicker( "option", "maxDate", selectedDate ); }
        });   
   });
   
   $('#nomina_limpiar_fecha1').click(function(){$('#PayRollStartDataForm').val('');});
   $('#nomina_limpiar_fecha2').click(function(){$('#PayRollEndDataForm').val('');});
                
    $( "#window_content_nomina" ).dialog({height: dHeight,width: dWidth,  closeOnEscape:false,minWidth:dHeight,minHeigth:dWidth,title:'Contenedor Recibos de Nómina'}).dialogExtend(BotonesWindow);          

    var enterprise = new Enterprise();
    var xml = enterprise.GetListEnterprisesXml('PayRoll');
    var miselect = $("#PayRollEnterprise");
    miselect.find('option').remove().end().append('').val('');
    $("#PayRollEnterprise").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
    $(xml).find("Enterprise").each(function()
    {
       var $Empresa=$(this);
       var id = $Empresa.find("IdEnterprise").text();
       var rfc = $Empresa.find("rfc").text();
       var nombre = $Empresa.find("Name").text();  
       $("#PayRollEnterprise").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
    });
//    List_empresas(); /* Se llena listado de empresas */
}


