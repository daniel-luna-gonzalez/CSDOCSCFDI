    /*
 *Este archivo .js contiene las funciones necesarias para realizar las operaciones de la barra de
 *herramientas (upload xml, upload pdf, envio de mail e imprimir).
 */

/* 
 *          ****************************************************
 *          *           Contenedor de Selección de XML         * 
 *          ****************************************************
 */         

  /* global ProviderTabledT, ClientTabledT, PayRollTabledT */

var w_Width = $(window).width();
  var w_Height = $(window).height();
  var visor_Width = w_Width * .65;
  var visor_Height = w_Height * 0.9;


$(document).ready(function()
{
    /*  Contenedor de listado de Selección   */    
  
       var atributos_content_seleccion={height: 350,width:550,minWidth:350,minHeigth:350,
           closeOnEscape:false,position: "right-5 top+13",modal:true,
                buttons: {"Descargar":function(){descarga_seleccionados(); }, "Limpiar Listado": function () { limpiar_tabla_seleccion(); },"cerrar": function () { $(this).dialog("close"); }
                }};       
       
        $('#seleccion_icon').click(function()
        {
           $('#contenedor_seleccion').dialog(atributos_content_seleccion);
           $("#contenedor_seleccion").siblings('div.ui-dialog-titlebar').remove();
           if($('#tabla_seleccion').length==0 && $('#imagen_lista_vacia_seleccion').length==0)
           {
               $('#contenedor_seleccion').append('<center><p><img src="img/mono_error.png" title="Lista vacía" width="70px" heigth="70" id="imagen_lista_vacia_seleccion"></center></p>');
               $('#contenedor_seleccion').append('<center><p id="texto_lista_vacia_seleccion" class="mensaje_content_selección">La lista de Selección se encuentra vacía...</center></p>');             
           }
           
            $('#clean_icon_seleccion').click(function(){
                limpiar_tabla_seleccion();
            });
        });   
        
        /* Botonoes de Mostrar Acuse en Vista Previa */
        $('#proveedor_boton_get_acuse').button();
        $('#cliente_boton_get_acuse').button();
        $('#nomina_boton_get_acuse').button();
        
});
                                                
/*
 *Función para envio de mail
 */
var nodest=1;
function mail(content)
{            
    var TabledT, PdfPath, XmlPath, FileState, IdCfdi;
    if(content === 'Provider')
        TabledT = ProviderTabledT;
    if(content === 'Client')
        TabledT = ClientTabledT;
    if(content === 'PayRoll')
        TabledT = PayRollTabledT;
    $('#'+content+'CfdiTable tr.selected').each(function()
   {                
       var position = TabledT.fnGetPosition(this); // getting the clicked row position  
       IdCfdi = $(this).attr('id');
       XmlPath = TabledT.fnGetData(position)[0];
       PdfPath = TabledT.fnGetData(position)[1]; 
       FileState = TabledT.fnGetData(position)[10];              
   }); 
    
    console.log(IdCfdi);
    if(!IdCfdi>0)
    {
        Advertencia("Debe seleccionar un documento");
        return 0;
    }
    
    insert_forms_mail();
                
    if(PdfPath.length>0)/*Se comprueba si existe un PDF asociado al XML */
        $('#mail').append('<input type="checkbox" id="radio_mail_pdf" value=1 checked>Insertar el PDF'); 
    
    $( "#mail" ).dialog({height: 600, width:500,modal: true,closeOnEscape:false,minWidth:400,buttons: {
        "Enviar": function (){ enviar_mail(content); },
        "Cancelar": function (){ $(this).dialog("close");$('#mail').html('');  } }
    });    
    
    
    /**********************************
     *Validación de correo electrónico*
     *     y agregar destinatario     *
     **********************************/  
    
    $(function()
    {
        var  dest=1;
      /* Al intentar agregar un destinatario con el botón + se verifica que sea correcto */  
      $('#add_dest_mail').click(function()
      {
          
          if(add_destinatario(dest))     
              {dest++; nodest++;}
   
      });
      /*  Se verifica si el correo es válido cuando se pierde el foco del campo de texto de correo   */
      $('#mail_email').focusout(function()
        {
            if(add_destinatario(dest))     
              {dest++; nodest++;}
        });
    });
    
    
    $("input").focus(function(){
            $(this).addClass("seleccionado");
        });
        $("input").blur(function(){
                $(this).removeClass("seleccionado");  
        });
        
        $("textarea").focus(function(){

                $(this).addClass("seleccionado");
        });
        $("textarea").blur(function(){
                $(this).removeClass("seleccionado");  
        });
        
    
}/*Fin de función */

function insert_forms_mail()
{
    nodest=1;
     $('#mail').html('');  
     $('#mail').append('<center><img src="img/email.png" title="Enviar e-mail" id="img_mail" width="10%" height="10%" ><center>');
      $('#mail').append('<p>Para:</p> ');  
      $('#mail').append('<p><input type="text" id="mail_email"  placeholder="correo@example.com" ><input type ="button" value="+" title="Agregar destinatario" id="add_dest_mail"></p>');
      $('#mail_email').addClass('seleccionado');
      $('#mail').append('<p id="p_asunto">Asunto:</p>');
      $('#mail').append('<input type="text" id="mail_asunto" width="95%" placeholder="Título del Asunto">');  
      $('#mail').append("<br>Mensaje:");
      $('#mail').append('<br><br><textarea class="estilotextarea"  id="mail_mensaje" rows="10" cols="50" placeholder="Mensaje"></textarea>');  
      $('#mail').append('<br><p><b>Adjuntar Archivos</b></p>');
      $('#mail').append('<br><input type="checkbox" id="radio_mail_xml" value=1 disabled="disabled" checked>Insertar el XML');
}

function select_empleado()
{
     $('#dialog_information').html('');
         $('#dialog_information').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
         $( "#dialog_information" ).append("<center>Seleccione un documento antes de intentar enviar un correo electrónico</center>");
         $( "#dialog_information" ).dialog(
         {height: 180,width:400,modal: true,title:"Atención",closeOnEscape:false,buttons: {"Aceptar": function (){ $(this).dialog("close");$('#dialog_information').html('');}}});
}

function add_destinatario(contador)
{
    var bool=false;
    var mail=$('#mail_email').val();
        if(mail.length==0)return bool;/** Evita que salga mensaje de correo inválido **/
     if (ValidaEmail(mail) == false)
    {
        if($('#warning_dest').length==0)
            {
                $('<font color="red"><p id="warning_dest">Introduzca un e-mail válido</p></font>').insertAfter($('#add_dest_mail'));
            }    
        $('#mail_email').focus();  
        return bool;
    }
    else
    {
        $('#warning_dest').remove();
        var text_mail=$('#mail_email').val();           
        $('<div id="destinatario'+contador+'" class="destinatarios">'+text_mail+'<input type ="button" id="button_dest'+contador+'" value="X" title="eliminar '+text_mail+'" onclick="delete_destinatario(\'destinatario'+contador+'\')"></div>').insertBefore($('#p_asunto'));
            $('#destinatario'+contador+'').css({'textOverflow':'ellipsis'});
            $('#mail_email').val('');
        bool=true;
    }     
    return bool;
}
/********************
 *Válidador de email*
 ********************/
function ValidaEmail(email)
{
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
/**************************
 *Eliminar un destinatario*
 **************************/
function delete_destinatario(destinatario)
{
    $('#'+destinatario+'').remove();
}
/****************************************************************************
*Se juntan todos los destinatarios en una sola cadena para luego ser enviada*
*****************************************************************************/
function cadena_emails()
{    
    var cadena_email='';
//    $('#mail').append("<p>Peso cadena="+cadena_email.length+"</p>");
    for(cont=0;cont<nodest;cont++)
        {         
            var id="destinatario"+(cont+1);
            if($('#'+id+'').length>0)/* Se comrpueba que existe el div email */
            {
                var email=$('#'+id+'').text();                                
                if(email.length>0)/* Si contiene algún correo */
                {       
//                    $('#mail').append('<p>email='+email+'</p>');
                    if(cadena_email.length==0)
                    {                      
                        cadena_email=":"+email;
                    }
                    else
                    {
                        cadena_email=cadena_email+":"+email;
                    }
//                    $('#mail').append('<p>cadena='+cadena_email+'</p>');
                }
            }
            
        }
//        $('#mail').append('<p>cadena='+cadena_email+'</p>');
        return cadena_email;
}
function enviar_mail(content)
{
    var TabledT, PdfPath, XmlPath, FileState, IdCfdi,  id_empleado_detalle=0;;
    if(content === 'Provider')
        TabledT = ProviderTabledT;
    if(content === 'Client')
        TabledT = ClientTabledT;
    if(content === 'PayRoll')
        TabledT = PayRollTabledT;
    
    $('#'+content+'CfdiTable tr.selected').each(function()
   {                
       var position = TabledT.fnGetPosition(this); // getting the clicked row position  
       id_empleado_detalle = $(this).attr('id');
       XmlPath = TabledT.fnGetData(position)[0];
       PdfPath = TabledT.fnGetData(position)[1]; 
       FileState = TabledT.fnGetData(position)[10];              
   }); 
    
    var mensaj_correoe = $('#mail_mensaje').val();
    mensaj_correoe=mensaj_correoe.replace(/^\s+/,'').replace(/\s+$/,'');
    
    if($("[id*=destinatario]").length===0)/* Sino se introdujo al menos un e-mail */
        {
            if($('#warning_destinatario').length===0)
                    $('<font color="red"><p id="warning_destinatario">Introduzca al menos un e-mail</p></font>').insertAfter($('#mail_email'));
            return;
        }
    if(mensaj_correoe.length===0)/* Sino introdujo algún mensaje */
        {
            if($('#warning_msj').length===0)
                    $('<font color="red"><p id="warning_msj">Introduzca un mensaje</p></font>').insertAfter($('#mail_mensaje'));
            return;
        }      
        
    $('#warning_msj').remove();
    $('#warning_destinatario').remove();
        
    var cadena_email=cadena_emails();
    $('#mail').append('<p>'+cadena_email+'</p>');    
    $('#mail').dialog("destroy");
    dialog_information();    
    $('#dialog_information').dialog('option', 'title', 'Status de envio(s)');
    $('#dialog_information').append('<p>Enviando correos... Por favor espere.</p>');
    $('#dialog_information').append('<center><img src="img/loading.gif" id="loading_send" title="Enviando correos" width="20" heigth="20"><center>'); 
    var id_usuario_sistema=$('#id_usr').val();       
    var asunto=$('#mail_asunto').val();
    var mensaje=$('#mail_mensaje').val();
    var radio_xml=$('#radio_mail_xml:checked').val();
    var radio_pdf=$('#radio_mail_pdf:checked').val();
    $('#mail').html('');  

    $.ajax({
    async:false, 
    cache:false,
//    processData: false,
//    contentType: false,
    dataType:"html", 
    type: 'POST',   
    url: "php/mail.php",
    data:'content='+content+'&id_usuario_sistema='+id_usuario_sistema +'&id='+id_empleado_detalle+'&destinatario_mail='+cadena_email+'&asunto='+asunto+'&mensaje='+mensaje+"&xml="+radio_xml+"&pdf="+radio_pdf+'&opcion=envio_mail'+'&PdfPath='+PdfPath+'&XmlPath='+XmlPath, 
    success:  function(xml)
    {   
        
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );
        console.log(xml);
        
        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            return 0;
        });   
        
        $('#dialog_information').dialog('option','width',500);
 
        $(xml).find('envio').each(function()
        {
            var tipo = $(this).find('status').text();
            var mensaje = $(this).find('mensaje').text();
            
            if(tipo==0)
            {                            
                $('<p>'+mensaje+'<img src="img/Alert.png" title="carga xml" width="20" heigth="20"></p>').insertBefore('#loading_send');                   
            }
            if(tipo==1)
            {                                        
                $('<p>'+mensaje+'<img src="img/success.png" title="carga xml" width="20" heigth="20"></p>').insertBefore('#loading_send');
            }                             
        }); 
                $('#loading_send').remove();   
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
}



/*  Ingresa elementos a la tabla de selección para después descargarlos  */

function crear_tabla_seleccion()
{
    
    $('#imagen_lista_vacia_seleccion').remove();
    $('#texto_lista_vacia_seleccion').remove();
    
    var tabla_seleccion=document.createElement("table");
    tabla_seleccion.setAttribute("id","tabla_seleccion");
    var thead=document.createElement("thead");
    var tr=document.createElement("tr");
    var th1=document.createElement("th");
    var th2=document.createElement("th");
    var th3=document.createElement("th");
    var th4=document.createElement("th");
    var th5=document.createElement("th");
    var th6=document.createElement("th");
    var th7=document.createElement("th");
    
    th1.innerHTML="Repositorio";
    th2.innerHTML="Emisor";
    th3.innerHTML="Receptor";
    th4.innerHTML="Fecha";
    th5.innerHTML="Folio";
    th6.innerHTML="Total";
    th7.innerHTML="Eliminar";
    
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);
    tr.appendChild(th5);
    tr.appendChild(th6);
    tr.appendChild(th7);
    
    thead.appendChild(tr);
    
    tabla_seleccion.appendChild(tr);
    
    $('#contenedor_seleccion').append(tabla_seleccion);
    
    
    
}

function content_seleccion(content,id,fecha,folio,total,RutaXml,RutaPdf,check_id,RutaAcuse)
{
    
    /* Se elimina fila de tabla de selección cuando se desactiva un checkbox */
    if(!($('#'+check_id).is(':checked'))) {  
            var id_fila=content+'_'+id;
            $('#'+id_fila).remove();
            return;     /* Se corta ejecución para no agregar una fila que se eliminó */
        }  
    
    /* Se crea la tabla cuando esta no existe */
    if($('#tabla_seleccion').length===0)
    {
        crear_tabla_seleccion();
    }
    
    
    
    var arbol='';
    
    var repositorio="";
    if(content==='proveedor')
    {
        repositorio="Facturas Proveedor";
        arbol="proveedor_tree";
    }
    if(content==='cliente')
    {
        repositorio="Facturas Cliente";
        arbol="cliente_tree";
    }
    if(content==='nomina')
    {
        repositorio="Recibos de Nómina";
        arbol="tree";
    }
    
    var get_arbol = $("#"+arbol).dynatree("getActiveNode");
    var nombre_receptor=get_arbol.data.title;
    
    var parent=get_arbol.getParent();
    var nombre_emisor=parent.data.title;
    
    /****** Se ingresa una fila a la tabla ******/
    
     var tr1 = document.createElement("tr");
    /* Boton de eliminar de la lista de selección*/
    var img=document.createElement('img');
    img.setAttribute("src","img/delete_icon.png");
    img.setAttribute("width","30px");
    img.setAttribute("heigth","30px");
    img.style.cursor="pointer";

    var id_fila=content+'_'+id;
    tr1.setAttribute('id',id_fila);
    var quitar_de_lista="quitar_de_seleccion("+tr1.id+",'"+content+"','"+id+"')";
    img.setAttribute("onclick",quitar_de_lista);
    img.title="Quitar a "+nombre_receptor;
    
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var td4 = document.createElement("td");
    var td5 = document.createElement("td");
    var td6 = document.createElement("td");
    var td7=document.createElement("td");
    var td8=document.createElement("td");
    var td9=document.createElement("td");
    var td10=document.createElement("td");
    
    
    td1.innerHTML = repositorio;
    td2.innerHTML = nombre_emisor;
    td3.innerHTML = nombre_receptor;
    td4.innerHTML=fecha;
    td5.innerHTML=folio;   
    td6.innerHTML="$"+total;
    td7.appendChild(img);
    td8.innerHTML=RutaXml;
    td9.innerHTML=RutaPdf;
    td10.innerHTML=RutaAcuse;
    
    td8.setAttribute("class","celda_oculta_xml");
    td9.setAttribute("class","celda_oculta_pdf");
    td10.setAttribute("class","celda_oculta_acuse");
    
    td2.setAttribute("class","descarga_emisor");
    td3.setAttribute("class","descarga_receptor");
    
    tr1.appendChild(td1);	        
    tr1.appendChild(td2);	
    tr1.appendChild(td3);
    tr1.appendChild(td4);
    tr1.appendChild(td5);
    tr1.appendChild(td6);	
    tr1.appendChild(td7);    
    tr1.appendChild(td8);
    tr1.appendChild(td9);
    tr1.appendChild(td10);
    
    $('#tabla_seleccion').append(tr1);
}


/* Se elimina la fila de la tabla de selección */
function quitar_de_seleccion(id_fila,content,id_detalle)
{
    var check_id=content+"_check_"+id_detalle;
    $('#'+check_id).prop("checked", "");/* Desmarca el checkbox de la tabla listado de facturas */
      $(id_fila).remove();/* Quita el elemento del listado de selección */
}


function limpiar_tabla_seleccion()
{
    
    if($('#tabla_seleccion').length===1)
    {
        /*  Deseleccionamos todos los checkbox de las tablas de "Listado de Facturas"*/
        var obtener_id_checks=$('#tabla_seleccion img');
        for(cont=0;cont<obtener_id_checks.length;cont++)
        {
            var funcion=obtener_id_checks.eq(cont).attr('onclick');
        
            var func = new Function(funcion);
            func();
        }
        
        /* La tabla de selección se elimina */
        $("#tabla_seleccion").remove();        
        $('#contenedor_seleccion').append('<center><p><img src="img/mono_error.png" title="Lista vacía" width="70px" heigth="70" id="imagen_lista_vacia_seleccion"></center></p>');
        $('#contenedor_seleccion').append('<center><p id="texto_lista_vacia_seleccion" class="mensaje_content_selección">La lista de Selección se encuentra vacía...</center></p>');             
    }
    
}

/*
 *               ****************************************
 *               *           Botón de Descarga          *
 *               ****************************************
 */

/*  Se manda a descarga todos los archivos que se encuentran seleccionados 
 * Se construye el XML y se envia a PHP para formar el paquete de descarga*/

function descarga_seleccionados()
{
    var descarga = $(".celda_oculta_xml");/* celdas que tiene XML en la sección de selección */
    var ruta_pdf=$(".celda_oculta_pdf");
    var ruta_acuse=$('.celda_oculta_acuse');
    var emisor=$('.descarga_emisor');
    var receptor=$('.descarga_receptor');
    var xml = "<Descarga version='1.0' encoding='UTF-8'>";
    var cuerpo_xml='';
    
    /* Si no existen elementos seleccionados */
    if(descarga.size()==0)
    {
        dialog_information();
        $('#dialog_information').html('');
        $('#dialog_information').dialog('option', 'title', 'Ocurrió un error durante la descarga');  
        $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>Seleccione al menos un documento para poder iniciar la descarga</p>');
        return;
    }
    
  for(var i=0; i< descarga.size(); i++)
    {
        var contenido = descarga.eq(i).text();
        var contenido_pdf=ruta_pdf.eq(i).text();
        var contenido_acuse=ruta_acuse.eq(i).text();
        var contenido_emisor=emisor.eq(i).text();
        var contenido_receptor=receptor.eq(i).text();
//        $('#contenedor_seleccion').append('<p>'+contenido_emisor+'  '+' '+contenido_receptor+' '+contenido+'</p>');
        
      cuerpo_xml=cuerpo_xml+'<descarga>\n\
        <emisor>'+contenido_emisor+'</emisor>\n\
        <receptor>'+contenido_receptor+'</receptor>\n\
        <ruta>'+contenido+'</ruta>\n\
        <ruta_pdf>'+contenido_pdf+'</ruta_pdf>\n\
        <ruta_acuse>'+contenido_acuse+'</ruta_acuse>\n\
        </descarga>';
    }
    /* Se agrega el nombre de usuario para crear directorio temporal  */
    xml=xml+'<usuario><nombre>'+$('#form_user').val()+'</nombre></usuario>';
     xml=xml+cuerpo_xml+"</Descarga>";
    
    /* envio de XML a PHP */
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("opcion=descarga&xml="+xml);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {
          
           var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("respuesta");

           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                var zip=root[cont].getElementsByTagName("nombre_zip")[0].childNodes[0].nodeValue;                
                
                if(estado==0)
                {              
                    dialog_information();
                    $('#dialog_information').html('');
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió un error durante la descarga');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {              
                    var mensaje="<p>Descargando paquete CFDI...</p>";
                    var titulo="Notificación de Descarga";
                    efecto_notificacion(mensaje,titulo);
                    var usuario=$('#form_user').val();
//                    $('#contenedor_seleccion').append("<p>Descargando archivo...</p>");
                    var ventana=window.open('php/Seleccion_archivos.php?opcion=descarga_zip&zip='+zip+'&usuario='+usuario,"nuevo", "directories=no, location=no, menubar=no, scrollbars=yes, statusbar=yes, tittlebar=yes, width=500, height=100");
                    
                }       
            }           
       }
   }    
}


function efecto_notificacion(mensaje,titulo)
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





            /*************************************************** 
             *          Content Factura Proveedor              * 
             ***************************************************
             */

var opc_update_xml={height: 450,width:350,modal: true,closeOnEscape:false,title:'Actualizar XML',
                buttons: 
                {                        
                    "Aceptar": function (){  cliente_subir_archivo_xml($('#cliente_radio_upload_xml').val());},
                    "Cancelar": function (){ $(this).dialog("destroy");  }                                                               
                }};


$(document).ready(function()
{   
    $("#proveedor_btn_imprimir").bind("click",function()
    {         
        if($('#proveedor_radio_upload_xml').length===1)
               proveedor_llenar_vista_impresion();/* Se llena el div de impresion con la información del xml*/
        else
        {
            $('#proveedor_upload_xml').html('');        
            $('#proveedor_upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
            $("#proveedor_upload_xml").append("<center>Seleccione un empleado antes de intentar imprimir una Factura de Proveedor</center>");
            $("#proveedor_upload_xml").dialog(
            {
                height: 180,width:400,modal: true, closeOnEscape:false,title:'Imprimir',
                buttons: { "Aceptar": function (){ $(this).dialog("close");$('#proveedor_upload_xml').html('');}}
           });             
        }
    });            
});            
            
//devulve el pdf para ser previsualizado
function proveedor_search_pdf(id_detalle)
{    

    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Seleccion_archivos.php",
    data:"id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=proveedor&opcion=get_ruta_pdf', 
    success:  function(xml)
    {   
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML(xml);

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
        });     
        
        $(xml).find('PdfPath').each(function()
        {
            var Path = $(this).find('Path').text();
            var pdf = new Pdf();
            pdf.ShowPdf(Path);
        });
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
}        

//Dialog de carga PDF
  function proveedor_show_pdf()
  {     
      $( "#proveedor_visor_pdf" ).html('');
        $( "#proveedor_visor_pdf" ).dialog(
        {
            height: visor_Height,
            width:visor_Width,
            modal: true,    
            closeOnEscape:false,
            title:'Visor de PDF',
            buttons: { "Cerrar": function (){ $(this).dialog("close");}}                          
        });
  }  
  
  function proveedor_ajax_update_pdf()
  {      
      var id_empleado_detalle=$('#proveedor_radio_upload_xml').val();   
      if($('#proveedor_img_pdf_'+id_empleado_detalle).css('display')!='none')
      {
          $('.aviso_update_pdf').remove();
          $('#proveedor_upload_xml').append('<div class="aviso_update_pdf"><p><font color="red">La actualización de un PDF debe realizarse junto con su CFDI correspondiente.</font></p></div>');
          return;
      }
   
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('proveedor_browser_update_xml_pdf');
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('archivo',archivo[i]);
    data.append('id_detalle',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update_pdf');
    data.append('content','proveedor');
  }    
  
  $('#proveedor_upload_xml').dialog("close");
  
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {            
           alert(ajax.responseText);
           dialog_information();
           $('#dialog_information').html('');
           var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("Carga_PDF")
           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==0)
                {              
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el PDF');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {                   
                    $('#dialog_information').dialog('option', 'title', 'Cargar PDF');
                    $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga pdf" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                    /*Se muestra el icono de PDF */ 
                    var id=$('#proveedor_radio_upload_xml').val();           
                    $('#proveedor_img_pdf_'+id).show();
                    $('#proveedor_img_pdf_'+id).css({'cursor':'pointer'});
                }                                   
            }                     
       }              
    }    
  }
     
     
/*********************
   *Dialog de carga XML*
   *********************/
  function proveedor_upload_xml()
  {       
      $('#proveedor_upload_xml').html('');
      if($('#proveedor_radio_upload_xml').length==1)/* proveedor_radio_upload es creado en 'proveedor_llama_xml()' */
          {              
              $('#proveedor_upload_xml').append('<center><img src="img/upload.png" title="carga xml" id="proveedor_img_upload_xml" width="170px" heigth="170px"><center>');      
              $('#proveedor_upload_xml').append('<p>Seleccione la nueva Factura de Proveedor</p>');
              $('#proveedor_upload_xml').append('<input id="proveedor_browser_update_xml" type="file" name="archivos"  accept="text/xml"/>');               
              $('#proveedor_upload_xml').append('<br><p>Seleccione su PDF (Opcional)</p>');              
              $('#proveedor_upload_xml').append('<input id="proveedor_browser_update_xml_pdf" type="file" name="archivos"  accept="application/pdf"/>');               

              $('#proveedor_browser_update_xml').css('display','block');       
          
          $( "#proveedor_upload_xml" ).dialog(
           {
                height: 450,width:350,modal: true,closeOnEscape:false,title:'Actualizar XML',
                buttons: 
                    {                        
                        "Aceptar": function ()
                        {                     
                            proveedor_subir_archivo_xml($('#proveedor_radio_upload_xml').val());                     
                        }
                        ,
                         "Cancelar": function () { $(this).dialog("close"); }                                                               
                    }
            });     
          }
    else
    {
         $('#proveedor_upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="proveedor_icon_caution" width ="10%" heigth="10%"><center>');
         $( "#proveedor_upload_xml" ).append("<center>Seleccione una Factura antes de intentar Actualizar un XML</center>"); 
         $( "#proveedor_upload_xml" ).dialog(
           {
                height: 180,width:400,modal: true, closeOnEscape:false,title:'Atención',effect: "blind",
                duration: 1000, buttons: { "Aceptar": function (){$(this).dialog("close"); $('#proveedor_upload_xml').html('');} }
            }        
            );     
    }
           
  }    
  /*
   *Se toma el valor del input file y se envia 
   **/
  function proveedor_subir_archivo_xml(id_empleado_detalle){
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('proveedor_browser_update_xml');  
  var archivo_pdf=document.getElementById('proveedor_browser_update_xml_pdf');
  if(archivos.files.length==0 && archivo_pdf.files.length==0){return;}
  if(archivos.files.length==0 && archivo_pdf.files.length>0){proveedor_ajax_update_pdf(); return;}/* Update de PDF */
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var pdf=archivo_pdf.files;
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('xml',archivo[i]);
    data.append('pdf',pdf[i]);
    data.append('id',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update');
    data.append('content','proveedor');    
  }    
  $("#proveedor_upload_xml").dialog('option','buttons',{});
  $("#proveedor_upload_xml").dialog('option','title','Actualizando CFDI...');
  $('#proveedor_browser_update_xml').remove();
  $('#proveedor_upload_xml').append('<center>Actualizando... <img src="img/loading.gif" id="proveedor_loading_update" title="Enviando correos" width="20" heigth="20"><center>'); 
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {        
           $('#proveedor_loading_update').remove();
           $('#proveedor_upload_xml').dialog("close");
           dialog_information();
           $('#dialog_information').html('');
            var xml=ajax.responseXML;          
           var root=xml.getElementsByTagName("Carga_XML");
           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==0)
                {              
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el XML');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {                   
                    $('#dialog_information').dialog('option', 'title', 'Actualizar XML');
                    $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga xml" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
//                    proveedor_llama_xml($('#proveedor_radio_upload_xml').val()); /* reload en preview */
                }                                   
            } 
       }              
    }
    
}

   /* Inicializa el Contenedor donde se encuentra el Historial y los acuses */ 
    $(function() {
    $( "#proveedor_contenedor_documentos" ).tabs({
//      beforeLoad: function( event, ui ) {
//        proveedor_get_historico();
//      }
    });
    });






            /*************************************************** 
             *          Content Factura Cliente                * 
             ***************************************************
             */
            
    /*********************************************************************
 *Impresión del xml por el boton de la barra de herramientas de Print*
 *********************************************************************/
$(document).ready(function()
{   
	$("#cliente_btn_imprimir").bind("click",function()
	{         
             if($('#cliente_radio_upload_xml').length==1)
          {
                cliente_llenar_vista_impresion();
          }
          else
            {
             $('#cliente_upload_xml').html('');
             $('#cliente_upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
             $( "#cliente_upload_xml" ).append("<center>Seleccione un empleado antes de intentar imprimir una Factura de Cliente</center>");
             $( "#cliente_upload_xml" ).dialog(
               {
                    height: 180,width:400,modal: true, closeOnEscape:false, title:'Atención',
                    buttons: {                        
                            "Aceptar": function ()
                            { 
                                $(this).dialog("close");
                                $('#cliente_upload_xml').html('');
                            }                                                                          
                        }
               });     
            }
	});
});




//devulve el pdf para ser previsualizado
function cliente_search_pdf(id_detalle)
{    
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=cliente&opcion=get_ruta_pdf');    
 
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                   
           var ruta=ajax.responseText;  
           cliente_show_pdf();           
           $('#cliente_visor_pdf').append('<embed src="'+ruta+'" width="99%" height="99%"></embed>');                               
       }              
    }    
}

//Dialog de carga PDF
  function cliente_show_pdf()
  {     
      $( "#cliente_visor_pdf" ).html('');
        $( "#cliente_visor_pdf" ).dialog(
        {
            height: visor_Height,width:visor_Width,modal: true,    closeOnEscape:false,title:"Cargar un PDF",
            buttons: 
            {  "Cerrar": function () { $(this).dialog("close"); }   }                          
        });
  }
  
  function cliente_ajax_update_pdf()
  {
      var id_empleado_detalle=$('#cliente_radio_upload_xml').val();   
      if($('#cliente_img_pdf_'+id_empleado_detalle).css('display')!='none')
      {
          $('.aviso_update_pdf').remove();
          $('#upload_xml').append('<div class="aviso_update_pdf"><p><font color="red">La actualización de un PDF debe realizarse junto con su CFDI correspondiente.</font></p></div>');
          return;
      }
   
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('cliente_browser_update_xml_pdf');
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('archivo',archivo[i]);
    data.append('id_detalle',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update_pdf');
    data.append('content','cliente');
  }    
  
  $('#upload_xml').dialog("close");
  
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {            
           alert(ajax.responseText);
           dialog_information();
           $('#dialog_information').html('');
           var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("Carga_PDF")
           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==0)
                {              
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el PDF');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {                   
                    $('#dialog_information').dialog('option', 'title', 'Cargar PDF');
                    $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga pdf" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                    /*Se muestra el icono de PDF */ 
                    var id=$('#cliente_radio_upload_xml').val();           
                    $('#cliente_img_pdf_'+id).show();
                    $('#cliente_img_pdf_'+id).css({'cursor':'pointer'});
                }                                   
            }                                           
           }              
        }    
  }
     
     
/*********************
   *Dialog de carga XML*
   *********************/
function cliente_upload_xml()
{       
  $('#upload_xml').html('');
  if($('#cliente_radio_upload_xml').length==1)
  {         
      $('#upload_xml').append('<center><img src="img/upload.png" title="carga xml" id="img_upload_xml" width="170px" heigth="170px"><center>');
      $('#upload_xml').append('<p>Seleccione la nueva Factura de Cliente</p>');
      $('#upload_xml').append('<input id="cliente_browser_update_xml" type="file" name="archivos"  accept="text/xml"/>');                   
      $('#upload_xml').append('<br><p>Seleccione su PDF (Opcional)</p>'); 
      $('#upload_xml').append('<input id="cliente_browser_update_xml_pdf" type="file" name="archivos"  accept="application/pdf"/>');                   

      $('#browser_update_xml').css('display','block');       

      $( "#upload_xml" ).dialog(
       {
            height: 450,width:350,modal: true,closeOnEscape:false,title:'Actualizar XML',
            buttons: 
                {                        
                    "Aceptar": function (){ cliente_subir_archivo_xml($('#cliente_radio_upload_xml').val());                               }
                    ,
                     "Cancelar": function (){   $(this).dialog("close"); }                                                               
                }
        });     
  }
else
{
     $('#upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
     $( "#upload_xml" ).append("<center>Seleccione un cliente antes de intentar Actualizar un XML</center>");
     $( "#upload_xml" ).dialog(
       {
            height: 180, width:400,modal: true,closeOnEscape:false,
            buttons: 
                {                        
                    "Aceptar": function ()
                    { 
                        $(this).dialog("close");
                        $('#upload_xml').html('');
                    }                                                                          
                }
        }        
        );     
}
           
}    
  /*
   *Se toma el valor del input file y se envia 
   **/
  function cliente_subir_archivo_xml(id_empleado_detalle){
      
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('cliente_browser_update_xml');  
  var archivo_pdf=document.getElementById('cliente_browser_update_xml_pdf');
  if(archivos.files.length==0 && archivo_pdf.files.length==0){return;}
  if(archivos.files.length==0 && archivo_pdf.files.length>0){cliente_ajax_update_pdf(); return;}/* Update de PDF */
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var pdf=archivo_pdf.files;
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('xml',archivo[i]);
    data.append('pdf',pdf[i]);
    data.append('id',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update');
    data.append('content','cliente');    
  }    
  $("#upload_xml").dialog('option','buttons',{});
  $("#upload_xml").dialog('option','title','Actualizando CFDI...');
  $('#cliente_browser_update_xml').remove();
  $('#cliente_browser_update_xml_pdf').remove();
  $('#upload_xml').append('<center>Actualizando... <img src="img/loading.gif" id="cliente_loading_update" title="Enviando correos" width="20" heigth="20"><center>'); 
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {        
           alert(ajax.responseText);
           $('#cliente_loading_update').remove();
           $('#upload_xml').dialog("close");
           dialog_information();
           $('#dialog_information').html('');
            var xml=ajax.responseXML;     
           var root=xml.getElementsByTagName("Carga_XML");
           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==0)
                {              
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el XML');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {                   
                    $('#dialog_information').dialog('option', 'title', 'Actualizar XML');
                    $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga xml" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
//                    cliente_llama_xml($('#cliente_radio_upload_xml').val());/* reload en preview */
                }                                   
            } 
       }        
    }    
}

                    
                    
            /*************************************************************** 
             *                    Content Recibos de Nómina                * 
             ***************************************************************
             */

/*********************************************************************
 *Impresión del xml por el boton de la barra de herramientas de Print*
 *********************************************************************/
$(document).ready(function()
{   
    $("#btn_imprimir").bind("click",function()
    {
        $('#upload_xml').html('');
        if($('#radio_upload_xml').length==1)
          {
                
                nomina_llenar_vista_impresion();
          }
        else
        {         
         $('#upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
         $( "#upload_xml" ).append("<center>Seleccione un empleado antes de intentar imprimir un Recibo de Nómina</center>");
         $( "#upload_xml" ).dialog(
           {
                height: 180,width:400,modal: true, closeOnEscape:false,title:'Imprimir Recibo de Nómina',
                buttons:
                {                        
                    "Aceptar": function ()
                    { 
                        $(this).dialog("close");
                    }                                                                          
                }
           });     
        }
    });
});



  /*********************
   *Dialog de carga XML*
   *********************/
  function upload_xml()
  {       
      $('#upload_xml').empty();
  if($('#radio_upload_xml').length==1)
      {                                  
          $('#upload_xml').append('<center><img src="img/upload.png" title="carga xml" id="img_upload_xml" width="170px" heigth="170px">><center>');
          $('#upload_xml').append('<p>Seleccione la nueva Factura de Cliente</p>');
          $('#upload_xml').append('<input id="nomina_browser_update_xml" type="file" accept="text/xml"/>');                    
          $('#upload_xml').append('<br><p>Seleccione su PDF (Opcional)</p>'); 
          $('#upload_xml').append('<input id="nomina_browser_update_xml_pdf" type="file" accept="application/pdf"/>');                   

          $('#browser_update_xml').css('display','block');                 
      $( "#upload_xml" ).dialog(
       {
            height: 450,width:350,modal: true,closeOnEscape:false, title:'Actualizar XML',
            buttons: 
                {                        
                    "Aceptar": function ()
                    {                             
                        subir_archivo_xml($('#radio_upload_xml').val());  
                    }
                    ,
                     "Cancelar": function ()
                    { $(this).dialog("close"); }                                                               
                }
        });     
      }
    else
    {
         $('#upload_xml').append('<center><img src="img/caution.png" title="carga xml" id="icon_caution" width ="10%" heigth="10%"><center>');
         $( "#upload_xml" ).append("<center>Seleccione un empleado antes de intentar Actualizar un XML</center>");
         $( "#upload_xml" ).dialog(
           {
                height: 180,width:400,modal: true,closeOnEscape:false,title:'Atención',
                buttons: 
                    { "Aceptar": function ()
                        { 
                            $(this).dialog("close");
                        }                                                                          
                    }
            }        
            );     
    }
           
  }    
  
  /*
   *Se toma el valor del input file y se envia 
   **/
  function subir_archivo_xml(id_empleado_detalle){
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('nomina_browser_update_xml');  
  var archivo_pdf=document.getElementById('nomina_browser_update_xml_pdf');
  if(archivos.files.length==0 && archivo_pdf.files.length==0){return;}
  if(archivos.files.length==0 && archivo_pdf.files.length>0){ajax_update_pdf(); return;}/* Update de PDF */
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var pdf=archivo_pdf.files;
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('xml',archivo[i]);
    data.append('pdf',pdf[i]);
    data.append('id',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update');
    data.append('content','nomina');    
  }    
  $("#upload_xml").dialog('option','buttons',{});
  $("#upload_xml").dialog('option','title','Actualizando CFDI...');
  $('#nomina_browser_update_xml').remove();
  $('#nomina_browser_update_xml_pdf').remove();
  $('#upload_xml').append('<center>Actualizando... <img src="img/loading.gif" id="nomina_loading_update" title="Enviando correos" width="20" heigth="20"><center>'); 
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {        
           alert(ajax.responseText);
           $('#nomina_loading_update').remove();
           $('#upload_xml').dialog("close");
           dialog_information();
           $('#dialog_information').html('');
           var xml=ajax.responseXML;     
           var root=xml.getElementsByTagName("Carga_XML");
           for(cont=0; cont<root.length; cont++)
           {
                var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==0)
                {              
                    $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el XML');  
                    $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }
                if(estado==1)
                {                   
                    $('#dialog_information').dialog('option', 'title', 'Actualizar XML');
                    $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga xml" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
//                    llama_xml($('#radio_upload_xml').val());
                }                                   
            }            
       }              
    }
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
}

/* Update en un PDF  */
  function ajax_update_pdf()
  {
      var id_empleado_detalle=$('#radio_upload_xml').val();   
      if($('#nomina_img_pdf_'+id_empleado_detalle).css('display')!='none')
      {
          $('.aviso_update_pdf').remove();
          $('#upload_xml').append('<div class="aviso_update_pdf"><p><font color="red">La actualización de un PDF debe realizarse junto con su CFDI correspondiente.</font></p></div>');
          return;
      }
   
  var id_usuario_sistema=$('#id_usr').val();   /* Log */
  var archivos = document.getElementById('nomina_browser_update_xml_pdf');
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var data = new FormData();

  for(i=0; i<archivo.length; i++){
    data.append('archivo',archivo[i]);
    data.append('id_detalle',id_empleado_detalle);
    data.append('id_login',id_usuario_sistema);
    data.append('opcion','update_pdf');
    data.append('content','nomina');
  }    
  
  $('#upload_xml').dialog("close");
  
    ajax=objetoAjax();
    ajax.open("POST", 'php/UpdateCFDI.php',true);
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {            
           alert(ajax.responseText);
           dialog_information();
            $('#dialog_information').html('');
            var xml=ajax.responseXML;
            var root=xml.getElementsByTagName("Carga_PDF");
            for(cont=0; cont<root.length; cont++)
            {
                 var estado =root[cont].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                 var mensaje=root[cont].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                 if(estado==0)
                 {              
                     $('#dialog_information').dialog('option', 'title', 'Ocurrió algo al cargar el PDF');  
                     $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                 }
                 if(estado==1)
                 {                   
                     $('#dialog_information').dialog('option', 'title', 'Cargar PDF');
                     $('#dialog_information').append('<p><center><img src="img/success.png" title="carga carga pdf" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                     /*Se muestra el icono de PDF */ 
                     var id=$('#radio_upload_xml').val();           
                     $('#nomina_img_pdf_'+id).show();
                     $('#nomina_img_pdf_'+id).css({'cursor':'pointer'});
                 }                                   
            }                        
        }              
    };    
  }


/*
 *Cuadro de Dialogo de información que muestra si tuvo exito o no la consulta de update de xml y de pdf
 **/
function dialog_information()
{
    $( "#dialog_information" ).html("");
    $( "#dialog_information" ).dialog({height: 200,width:350,modal: true,closeOnEscape:false, buttons:{"Aceptar": function (){ $(this).dialog("close");} }});            
}
  
//devulve el pdf para ser previsualizado
function search_pdf(id_detalle)
{    
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);  
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+"&id_login="+id_usuario_sistema+'&opcion=get_ruta_pdf&content=nomina'); 
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                  
           var ruta=ajax.responseText;  
           show_pdf();           
           $('#visor_pdf').append('<embed src="'+ruta+'" width="99%" height="99%"></embed>');                               
       }              
    }
     
    
   
}
/* Visor de PDF */
  function show_pdf()
  {     
      $( "#visor_pdf" ).html('');
        $( "#visor_pdf" ).dialog(
        {
            height: visor_Height,
            width:visor_Width,
            modal: true,    
            closeOnEscape:false,
            title:'Visualizar PDF',
            buttons: 
            {                        
                "Cerrar": function ()
                {           
                    $(this).dialog("close");            
                }
            }                          
        });
  }
  
  
  
  function abrirVentana(liga)
  {
      window.open(liga, "nuevo", "directories=no, location=no, menubar=no, scrollbars=yes, statusbar=no, tittlebar=no, width=500, height=500");
  }
  
  