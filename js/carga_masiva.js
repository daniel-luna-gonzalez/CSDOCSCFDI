
/* global BotonesWindow */

//Seleccionamos el XMLHttpRequest
function objetoAjax(){
        var xmlhttp=false;
        try {
               xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
               try {
                  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
               } catch (E) {
                       xmlhttp = false;
               }
        }
 
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
               xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
}


function carga_masiva_(content)
  {
      var id_usuario_sistema=$('#id_usr').val();   /* Log */
      var archivos;
      var result=';'
      var browser;
      var img;
      if(content=='nomina')
      {$('#cargados_nomina').html('');      archivos    = document.getElementById('browser_carga_nomina'); result=$('#cargados_nomina');browser='browser_carga_nomina'; img=$('#img_carga_nomina');}
      if(content=='cliente')
      {$('#cargados_cliente').html('');     archivos    = document.getElementById('browser_carga_cliente'); result=$('#cargados_cliente');browser='browser_carga_cliente'; img=$('#img_carga_cliente');}
      if(content=='proveedor')
      {$('#cargados_proveedor').html('');   archivos    = document.getElementById('browser_carga_proveedor'); result=$('#cargados_proveedor'); browser='browser_carga_proveedor'; img=$('#img_carga_proveedor');}
//      archivos    = document.getElementById('browser_carga_nomina'); result=$('#cargados_nomina');browser='browser_carga_nomina'; img=$('#img_carga_nomina');
  
      var archivo = archivos.files;     
      var data = new FormData();

      for(i=0; i<archivo.length; i++)
      {
        data.append('archivo'+i,archivo[i]);   
        if(i==0)
            {
                data.append('id_login',id_usuario_sistema);
            }
      }    
      data.append('content',content);
      
        ajax=objetoAjax();
        ajax.open("POST", 'php/attachment.php',true);
        ajax.send(data);    
        ajax.onreadystatechange=function() 
        {
           if (ajax.readyState==4) 
           {          
               $(result).html('');
               $(result).append(ajax.responseText);
               $(archivos).remove();
               if(content=='cliente')
               {
                    $('#subir_cliente').append('<input id="'+browser+'" type="file" name="archivos[]" multiple="multiple" onchange="carga_masiva_(\''+content+'\');" accept="text/xml"/>');                                      
               }
               if(content=='nomina')
               {
                    $('#subir_nomina').append('<input id="'+browser+'" type="file" name="archivos[]" multiple="multiple" onchange="carga_masiva_(\''+content+'\');" accept="text/xml"/>');               

               }
               if(content=='proveedor')
               {
                $('#subir_proveedor').append('<input id="'+browser+'" type="file" name="archivos[]" multiple="multiple" onchange="carga_masiva_(\''+content+'\');" accept="text/xml"/>');               

               }
           }              
        }    
  };
  
  
/*
 ************************************************************************************************
 *                                      Ventanas de Carga Masiva                                *
 ************************************************************************************************                                      
 */
function carga_factura_cliente()
{
    $('#cargados_cliente').html('');
    $( "#carga_factura_cliente" ).dialog({height: 400,width: 300,resizable: false,closeOnEscape:false, title:'Carga Factura Clientes'}).dialogExtend(BotonesWindow);                     
}

function carga_factura_proveedor()
{
    $('#cargados_proveedor').html('');
    $( "#carga_factura_proveedor" ).dialog(
        {
            height: 400,
            width: 300,   
            resizable: false,
            closeOnEscape:false,
            title:'Carga Factura Proveedor'
        }).dialogExtend(BotonesWindow);          
}

function carga_nomina()
{
    $('#cargados_nomina').html('');
    $( "#carga_recibo_nomina_xml" ).dialog({height: 400,width: 300,resizable: false,closeOnEscape:false,title:'Carga Recibos de Nómina'}).dialogExtend(BotonesWindow);   
}

