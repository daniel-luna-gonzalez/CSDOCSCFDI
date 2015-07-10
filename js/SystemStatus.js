

/* Ventana que muestra el estado del sistema */
function show_status_system()
{
    $('#status_sistema').empty();    
    $('#status_sistema').append('<div class="titulo_ayuda">Estado del Sistema</div><br>');
    $('#status_sistema').append('<img src="img/loading.gif" id="loading_status_sistema" title="Obteniendo información de estado del servicio">');
    $('#status_sistema').dialog(
    {
        height: 350,
        width: 300,   
        closeOnEscape:false,
        position: "right-5 bottom-2",
        resizable:false
//                modal: true,
    });
            
     $("#status_sistema").siblings('div.ui-dialog-titlebar').remove();                    
}



/* Devuelve el estatus del sistema y muestra el resultado en la ventana de Estado del Sistema */

var restart=0;/* Bandera que marca el inicio de reinicio de sistema */
function get_status()
{    
    ajax=objetoAjax();
    ajax.open("POST", 'php/system.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("system_status=1");    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState===4 && ajax.status===200) 
       {
           $('#status_sistema').empty();
           $('#status_sistema').append('<div class="titulo_ayuda">Estado del Sistema</div><br>')
            $('#status_sistema').append('<div id="status_nomina"></div>');
            $('#status_sistema').append('<div id="status_cliente"></div>');
            $('#status_sistema').append('<div id="status_proveedor"></div>');
           var xml=ajax.responseXML;          
           var root=xml.getElementsByTagName("Estado");
           var estado_sistema=0;
         for(i=0;i<root.length;i++) 
         { 
             var status_recibo_nomina =root[i].getElementsByTagName("estado_recibo_nomina")[0].childNodes[0].nodeValue;
             var status_factura_cliente =root[i].getElementsByTagName("estado_factura_cliente")[0].childNodes[0].nodeValue;
             var status_factura_proveedor =root[i].getElementsByTagName("estado_factura_proveedor")[0].childNodes[0].nodeValue;

             if(status_recibo_nomina==1)
             {
                 estado_sistema++;
                 if($('#success_estado_recibo_nomina').length==0)
                 {                     
//                     $('#fail_estado_recibo_nomina').remove();
                     mensaje_recibo_nomina='Monitor de Recibo de Nómina';
                    $('#status_nomina').append('<table class="tabla_status"><tr><td><img src="img/success.png" width="40" heigth="40" id="success_estado_recibo_nomina"></td><td>'+mensaje_recibo_nomina+'</td></tr></table>');
                 }
                
             }
             if(status_recibo_nomina==0)
             {
                 if($('#fail_estado_recibo_nomina').length==0)
                 {                     
//                     $('#success_estado_recibo_nomina').remove();
                     mensaje_recibo_nomina='Monitor de Recibo de Nómina';
                    $('#status_nomina').append('<table class="tabla_status"><tr><td><img src="img/Alert.png"  width="40" heigth="40" id="fail_estado_recibo_nomina"></td><td>'+mensaje_recibo_nomina+'</td></tr></table>');
                 }
                 
             }
             if(status_factura_cliente==1)
             {
                 estado_sistema++;
                 if($('#success_estado_factura_cliente').length==0)
                 {
//                     $('#fail_estado_factura_cliente').remove();
                     mensaje_factura_cliente='Monitor de Factura Cliente ';
                    $('#status_cliente').append('<table class="tabla_status"><tr><td><img src="img/success.png" width="40" heigth="40" id="success_estado_factura_cliente"></td><td>'+mensaje_factura_cliente+'</td></tr></table>');
                 }
                
             }
             if(status_factura_cliente==0)
             {
                 if($('#fail_estado_factura_cliente').length==0)
                 {
//                     $('#success_estado_factura_cliente').remove();
                     mensaje_factura_cliente='Monitor de Factura Cliente';
                    $('#status_cliente').append('<table class="tabla_status"><tr><td><img src="img/Alert.png" width="40" heigth="40" id="fail_estado_factura_cliente"></td><td>'+mensaje_factura_cliente+'</td></tr></table>');
                 }
                 
             }
             if(status_factura_proveedor==1)
             {
                 estado_sistema++;
                 if($('#success_estado_factura_proveedor').length==0)
                 {
//                     $('#fail_estado_factura_proveedor').remove();
                     mensaje_factura_proveedor='Monitor de Factura Proveedor ';
                    $('#status_proveedor').append('<table class="tabla_status"><tr><td><img src="img/success.png" width="40" heigth="40" id="success_estado_factura_proveedor"></td><td>'+mensaje_factura_proveedor+'</td></tr></table>');
                 }
                
             }
             if(status_factura_proveedor==0)
             {
                 if($('#fail_estado_factura_proveedor').length==0)
                 {    
//                     $('#success_estado_factura_proveedor').remove();
                     mensaje_recibo_proveedor='Monitor de Factura Proveedor';
                    $('#status_proveedor').append('<table class="tabla_status"><tr><td><img src="img/Alert.png" width="40" heigth="40" id="fail_estado_factura_proveedor"></td><td>'+mensaje_recibo_proveedor+'</td></tr></table>');
                 }                 
             }
             if(estado_sistema==3)/* Si todos los servicios estan activos */
             {
                 $('#status_sistema').append('<br><br><table class="tabla_status"><tr><td><div class="mensaje_estatus"><p> Correcto</p></div><p>Su sistema funciona correctamente</p></td><td><img src="img/ok.png"></td></tr></table>');
             }
             else
             {
//                 $('#status_sistema').append('<table class="tabla_status"><tr><td><div class="mensaje_estatus_error"><p> Error</p></div><p>El sistema presenta un fallo en los monitores</p></td><td><img src="res/img/fallo.png"></td></tr><tr><td class="celda_boton_status_coflicto" colspan="2"><center><input type="button" value="Solucionar Conflicto" id="boton_status_solucion" onclick="restar_system()" style="cursor:pointer"></center></td></tr></table>')
                $('#status_sistema').append('<table class="tabla_status"><tr><td><div class="mensaje_estatus_error"><p> Error</p></div><p>El sistema presenta un fallo en los monitores</p></td><td><img src="img/fallo.png"></td></tr><tr><td class="celda_boton_status_coflicto" colspan="2"><center><b><h2>Es necesario reiniciar el sistema</h2></b><center></td></tr></table>');
             }
         }  
       }
   };
}