/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

  /* global OptionsDataTable, EnvironmentData */

var w_Width = $(window).width();
  var w_Height = $(window).height();
  var visor_Width = w_Width * .65;
  var visor_Height = w_Height * 0.9;

var Historical = function()
{
    var self = this;
    _ShowPdfPreview = function(content, PdfRoute)
    {
        var cfdi = new CFDI(content);
        cfdi.ShowFile(PdfRoute);
    };
    
    _ShowXmlPreview = function(content, Path)
    {
        var cfdi = new CFDI(content);
        var xml = cfdi.GetXmlStructureByPath(content, Path);
        if($.isXMLDoc(xml))
        {
            var preview = new Preview();
            preview.CfdiPreview(content, xml);
            $('#div_cfdi_copia_historico').dialog({minWidth:500,height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: {"Descargar Histórico": function (){ self.DownloadHistorical(content); }, "Cerrar": function() { $(this).dialog("destroy"); } } });
        }                
    };
    
    _ShowValidationReceipt = function(content, IdReceipt, Path)
    {
        var receipt = new Receipt();
        var xml = receipt.GetXmlValidationReceiptByPath(content,IdReceipt, Path);   
        console.log(xml);
        if($.isXMLDoc(xml))
        {
            receipt.ShowRecipt(xml);
        }
    };
    
    _BuildHistoricalTable = function(xml,content)
    {                
        $('#TableHistorical'+content).empty();
        var contenedor='';
        if(content==='cliente')
        {
            contenedor='cliente_historico_xml';
        }

        if(content==='proveedor')
        {
            contenedor='proveedor_historico_xml';
        }
        if(content==='nomina')
        {
            contenedor='nomina_historico_xml';
        }
        
        $('#'+contenedor).empty();
        $('#'+contenedor).append('<table class = "display hover" id = "TableHistorical'+content+'">\n\
        <thead><tr><th>Usuario modificador</th><th>Tipo</th><th>Fecha Modificación</th><th>Acuse</th><th>XML</th><th>PDF</th></tr>\n\
        </thead><tbody></tbody></table>');
        
        HistoricalTabledT = $('#TableHistorical'+content).dataTable(OptionsDataTable);    
        HistoricalTableDT = new $.fn.dataTable.Api('#TableHistorical'+content);
        
        if($(xml).find('Register').length===0) 
            $('#'+content+'_contenedor_documentos').tabs( "option", "disabled", [1] );
        else
            $('#'+content+'_contenedor_documentos').tabs("enable", 1 );
        
        $(xml).find('Register').each(function()
        {  
            var id_historical = $(this).find('id_historical').text();
            var usuario = $(this).find('nombre_usuario').text();
            var fecha = $(this).find('fecha_hora').text();
            var tipo_archivo = $(this).find('tipo_archivo').text();
            var id_acuse = $(this).find('id_validacion').text();
            var ruta_acuse = $(this).find('ruta_acuse').text();
            var ruta_xml = $(this).find('ruta_xml').text();
            var ruta_pdf = $(this).find('ruta_pdf').text();
            var PdfImage;
            
            if(ruta_pdf.length>0)
                PdfImage = '<img src = "img/pdf_icon.png" onclick = "_ShowPdfPreview(\''+ content +'\',\''+ruta_pdf+'\')" title = "Ver vista previa del pdf" style = "cursor:pointer">';
            
            var data = 
           [
                usuario,
                tipo_archivo,
                fecha,                
                '<img src = "img/acuse.png" onclick = "_ShowValidationReceipt(\''+content+'\',\''+id_acuse+'\', \''+ruta_acuse+'\')" title = "Ver acuse" style = "cursor:pointer">',
                '<img src = "img/folder_xml.png" onclick = "_ShowXmlPreview(\''+content+'\',\''+ruta_xml+'\')" title = "Ver docoumento xml" style = "cursor:pointer">',
                PdfImage
           ];   
           
            var ai = HistoricalTableDT.row.add(data).draw();
            var n = HistoricalTabledT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',id_historical);                                    
        });
        
        $('#TableHistorical'+content+' tbody').on( 'click', 'tr', function ()
        {
            HistoricalTableDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');        
        } );  
    };
};

Historical.prototype.GetHistoric = function(content, IdDetail)
{
    var id_usuario_sistema=$('#id_usr').val();/* Log */    
    $.ajax({
    async:true, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Historical.php",
    data: "IdDetail="+IdDetail+"&IdLogin="+id_usuario_sistema+'&content='+content+'&option=GetHistoric', 
    success:  function(xml)
    {   
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            return 0;
        });    
        
        if($.isXMLDoc(xml))
        {
            _BuildHistoricalTable(xml,content);
        }
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
};

Historical.prototype.DownloadHistorical = function(content, IdDetail)
{
    if(!(IdDetail>0))
        IdDetail=$('#'+content+'_radio_upload_xml').val();
    
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Historical.php",
    data: "IdDetail="+IdDetail+'&IdUser='+EnvironmentData.IdUser+'&content='+content+'&option=Download&UserName='+EnvironmentData.UserName, 
    success:  function(xml)
    {   
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            return 0;
        });        
        console.log(xml);
        var zip= $(xml).find('Package').text();
        console.log(zip);
        $('#iframeDownload').remove();
        $('body').append('<iframe id="iframeDownload" src="php/Seleccion_archivos.php?opcion=descarga_zip&zip='+zip+'&usuario='+EnvironmentData.UserName+'"> </iframe>');    
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
};


/*  Se descarga un paquete con el historial de modificaciones del CFDI  */
function proveedor_descarga_historico()
{
    var id_detalle=$('#proveedor_radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=proveedor&opcion=descarga_historico&nombre_usuario='+nombre_usuario);    
    ajax.onreadystatechange=function() 
    {
        
     if (ajax.readyState==4 && ajax.status==200) {
//        $('#proveedor_historico_xml').append(ajax.responseText);
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
                ventana.close;
            }       
        }       
    }
    };
}

/* Construcción de la tabla que muestra el historial de modificaciones de un CFDI */
function tabla_historial(xml,content)
{
    var contenedor='';
    if(content=='cliente')
    {
        contenedor='cliente_historico_xml';
    }
    
    if(content=='proveedor')
    {
        contenedor='proveedor_historico_xml';
    }
    if(content=='nomina')
    {
        contenedor='nomina_historico_xml';
    }
    
    
    
    var root=xml.getElementsByTagName("historico");        
    var tabla_historial=document.createElement('table');    
    var tr1=document.createElement('tr');    
    var th1=document.createElement('th');
    var th2=document.createElement('th');
    var th3=document.createElement('th');
    var th4=document.createElement('th');
    var th5=document.createElement('th');

        
    th1.innerHTML='Usuario que<br>Modificó';
    th2.innerHTML='Tipo de<br>Archivo';
    th3.innerHTML='PDF';;
    th4.innerHTML='Fecha de<br>Modificación';
    th5.innerHTML='Acuse de Validación';

    
    tr1.appendChild(th1);
    tr1.appendChild(th2);
    tr1.appendChild(th3);
    tr1.appendChild(th4);
    tr1.appendChild(th5);
    
    tabla_historial.appendChild(tr1);
    
    var td1=document.createElement('td');
    var td2=document.createElement('td');
    var td3=document.createElement('td');
    var td4=document.createElement('td');
    var td5=document.createElement('td');

    /* Sino contiene un histórico se oculta la pestaña que muestra el Histórico*/
    if(root.length==0) 
    {
        $('#'+content+'_contenedor_documentos').tabs( "option", "disabled", [1] );
    }
    else
    {
        $('#'+content+'_contenedor_documentos').tabs("enable", 1 );
    }
    
    for(cont=0; cont<root.length; cont++)
    {
        tr1=document.createElement('tr');    
        td1=document.createElement('td');
        td2=document.createElement('td');
        td3=document.createElement('td');
        td4=document.createElement('td');
        td5=document.createElement('td');
        
        var usuario =root[cont].getElementsByTagName("usuario")[0].childNodes[0].nodeValue;
        var fecha =root[cont].getElementsByTagName("fecha")[0].childNodes[0].nodeValue;
        var tipo_archivo =root[cont].getElementsByTagName("tipo_archivo")[0].childNodes[0].nodeValue;
        var ruta_acuse=root[cont].getElementsByTagName("ruta_validacion")[0].childNodes[0].nodeValue;
        var id_acuse=root[cont].getElementsByTagName("id_validacion")[0].childNodes[0].nodeValue;
        var ruta_xml=root[cont].getElementsByTagName("ruta_xml")[0].childNodes[0].nodeValue;
        var ruta_pdf=root[cont].getElementsByTagName("ruta_pdf")[0].childNodes[0].nodeValue;
                
        td1.innerHTML=usuario;
        td2.innerHTML=tipo_archivo;
        td4.innerHTML=fecha;               
        
         var imagen =document.createElement("img");
         imagen.setAttribute("src", "img/folder_xml.png");
         imagen.setAttribute("width", 38);
         imagen.setAttribute("height", 24);
         imagen.style.cursor="pointer";   
         var funcion='obtener_copia_cfdi(\''+content+'\',\''+ruta_xml+'\')';
         
         imagen.setAttribute('onclick', funcion);      
         
         td2.appendChild(imagen);
        
        //icono xml en div listado
         imagen =document.createElement("img");
         imagen.setAttribute("src", "img/acuse.png");
         imagen.setAttribute("width", 30);
         imagen.setAttribute("height", 30);
         var funcion='get_acuse(\''+content+'\',\''+id_acuse+'\')';
         imagen.setAttribute('onclick', funcion);
         imagen.style.cursor="pointer";
         
        td5.appendChild(imagen);
        
        
         var imagen_pdf =document.createElement("img");
         imagen_pdf.setAttribute("src", "img/pdf_icon.png");
         imagen_pdf.setAttribute("width", 38);
         imagen_pdf.setAttribute("height", 24); 
         var funcion_pdf="vista_revia_pdf_historico('"+ruta_pdf+"')";
         imagen_pdf.setAttribute('onclick', funcion_pdf);
         imagen_pdf.style.cursor="pointer";       
         if(ruta_pdf!='S/PDF'){td3.appendChild(imagen_pdf);}
         else{ td3.innerHTML='S/PDF';}
         
         
        
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        tr1.appendChild(td3);     
        tr1.appendChild(td4);
        tr1.appendChild(td5);
        
        tabla_historial.appendChild(tr1);
                
    } 
    
    $('#'+contenedor).append(tabla_historial);
}

//Muestra el historial de Actualizaciones realizadas a este documento
function cliente_get_historico()
{
    
    
    if($('#cliente_radio_upload_xml').length==0)
    {
        $('#cliente_historico_xml').empty();
        $('#cliente_historico_xml').append('<center><img src="img/caution.png" title="carga xml" id="proveedor_icon_caution" width ="10%" heigth="10%"><center>');
        $( "#cliente_historico_xml" ).append("<center>Seleccione una Factura antes de intentar consulta el historial de un CFDI</center>"); 
        $( "#cliente_historico_xml" ).dialog(
        {
            height: 180,width:400,modal: true, closeOnEscape:false,title:'Atención',effect: "blind",
            duration: 1000, buttons: { "Aceptar": function (){$(this).dialog("close");} }
        }        
        );    
        return;
    }
    var id_detalle=$('#cliente_radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=cliente&opcion=historico');    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                   
//           alert(ajax.responseText);
            var xml=ajax.responseXML;
            tabla_historial(xml,'cliente');
//           $( "#cliente_historico_xml" ).dialog(
//               {
//                    height: 400,width:500,modal: true, closeOnEscape:false, title:'Historial de Modificaciones CFDI',
//                    buttons: {                        
//                            "Descargar": function (){ cliente_descarga_historico();},"Cerrar": function (){ $(this).dialog("close");}
//                             }
//               });                                              
       }              
    }    
}

/*  Se descarga un paquete con el historial de modificaciones del CFDI  */
function cliente_descarga_historico()
{
    var id_detalle=$('#cliente_radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=cliente&opcion=descarga_historico&nombre_usuario='+nombre_usuario);    
    ajax.onreadystatechange=function() 
    {
//        $('#cliente_historico_xml').append(ajax.responseText);
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
                    ventana.close;
                }       
            }           
        }
    }
}

function nomina_get_historico()
{
    if($('#radio_upload_xml').length==0)
    {
        $('#nomina_historico_xml').empty();
        $('#nomina_historico_xml').append('<center><img src="img/caution.png" title="carga xml" id="proveedor_icon_caution" width ="10%" heigth="10%"><center>');
        $( "#nomina_historico_xml" ).append("<center>Seleccione un Recibo de Nómina antes de intentar consulta el historial de un CFDI</center>"); 
        $( "#nomina_historico_xml" ).dialog(
        {
            height: 180,width:400,modal: true, closeOnEscape:false,title:'Atención',effect: "blind",
            duration: 1000, buttons: { "Aceptar": function (){$(this).dialog("close");} }
        }        
        );    
        return;
    }
    
    var id_detalle=$('#radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=nomina&opcion=historico');    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                   
//           alert(ajax.responseText);
            var xml=ajax.responseXML;
            tabla_historial(xml,'nomina');
//           $( "#nomina_historico_xml" ).dialog(
//               {
//                    height: 400,width:500,modal: true, closeOnEscape:false, title:'Historial de Modificaciones CFDI',
//                    buttons: {                        
//                            "Descargar": function (){ nomina_descarga_historico();},"Cerrar": function (){ $(this).dialog("close");}
//                             }
//               });                                              
       }              
    }    
}

/*  Se descarga un paquete con el historial de modificaciones del CFDI  */
function nomina_descarga_historico()
{
    var id_detalle=$('#radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+'&id_login='+id_usuario_sistema+'&content=nomina&opcion=descarga_historico&nombre_usuario='+nombre_usuario);    
    ajax.onreadystatechange=function() 
    {
//        $('#proveedor_historico_xml').append(ajax.responseText);
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




/*
 * 
 * @param {type} ruta_xml
 * @returns {undefined}
 * Nos devuelve un Objeto XML de la copia del CFDI que se quiere mostrar
 */
function obtener_copia_cfdi(content,ruta_xml)
{
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send('id_login='+id_usuario_sistema+'&opcion=get_objeto_xml&nombre_usuario='+nombre_usuario+'&ruta_xml='+ruta_xml);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4 && ajax.status==200) 
        {
            var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("Comprobante");       
            if(root.length==0)
             {              
                 dialog_information();
                 var mensaje='Ocurrió un error durante la consulta del Acuse de Recíbo.';
                 $('#dialog_information').html('');
                 $('#dialog_information').dialog('option', 'title', 'Ocurrió un error durante la consulta en el Historial');  
                 $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
             }    
            else
            {
                $('#div_cfdi_copia_historico').empty();                
                crear_content_cfdi_copia_historico(content);            
                if(content=='proveedor'){proveedor_display_xml('copia_',xml);}
                if(content=='cliente'){cliente_display_xml('copia_',xml);}
                if(content=='nomina'){display_xml('copia_',xml);}
                $('#div_cfdi_copia_historico').dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor de CFDI (Histórico)' });
                /* Botón imprimir en vista previa de CFDI */
                $('#'+content+'_imprimir_cfdi_historial').click(function(){
                    $('#copia_'+content+'_div_boton_imprimir').css({'display':'none'});
                    $('#div_cfdi_copia_historico').printArea();
                    $('#copia_'+content+'_div_boton_imprimir').css({'display':''});
                });
//                alert(xml);
            }
        }
    }    
}

/* Devuelve el acuse de validacion en formato  XML  */
function get_archivo_validacion(ruta_xml)
{
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send('id_login='+id_usuario_sistema+'&opcion=get_objeto_xml&nombre_usuario='+nombre_usuario+'&ruta_xml='+ruta_xml);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4 && ajax.status==200) 
        {
            var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("RespuestaSAT");       
            if(root.length==0)
             {              
                 dialog_information();
                 var mensaje='Ocurrió un error durante la consulta del Acuse de Recíbo.';
                 $('#dialog_information').html('');
                 $('#dialog_information').dialog('option', 'title', 'Ocurrió un error durante la consulta del Acuse');  
                 $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
             }    
            else
            {
                mostrar_acuse(xml);                
            }
        }
    }
}
/* Devuelve el XML del Acuse */
function get_acuse(content,id_acuse)
{
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_validacion="+id_acuse+'&id_login='+id_usuario_sistema+'&content='+content+'&opcion=get_acuse&nombre_usuario='+nombre_usuario);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4 && ajax.status==200) 
        {
            var xml=ajax.responseXML;

           var root=xml.getElementsByTagName("RespuestaSAT");
       
            if(root.length==0)
             {              
                 dialog_information();
                 var mensaje='Ocurrió un error durante la consulta del Acuse de Recíbo.';
                 $('#dialog_information').html('');
                 $('#dialog_information').dialog('option', 'title', 'Ocurrió un error durante la consulta del Acuse');  
                 $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
             }    
            else
            {
                mostrar_acuse(xml);                
            }
        }                      
   }
       
}

/* Muestra el acuse en pantalla para vista previa */
function mostrar_acuse(xml)
{
    $('#contenedor_acuse').html('');
    $('#contenedor_acuse').append('<div id="barra_opciones_acuse" class="opciones_acuse"><input type="button" value="Imprimir Acuse" id="boton_imprimir_acuse"></div>');     
    $('#contenedor_acuse').append('<div class="titulo_acuse" id="div_titulo_acuse">Acuse de Recibo CFDI</div>');
    $('#contenedor_acuse').append('<div id="contenido_acuse" class="contenido_acuse"></div>');
    $('#boton_imprimir_acuse').button();  
    
    var tabla_acuse=document.createElement('table');     
    var tr1=document.createElement('tr');     
    
    var root=xml.getElementsByTagName("RespuestaSAT");
    for(cont=0; cont<root.length; cont++)
    {
        var td1=document.createElement('td');
        var td2=document.createElement('td'); 
        
         var webservice =root[cont].getElementsByTagName("WebService")[0].childNodes[0].nodeValue;
         var EmisorRfc=root[cont].getElementsByTagName("EmisorRfc")[0].childNodes[0].nodeValue;
         var ReceptorRFC=root[cont].getElementsByTagName("ReceptorRFC")[0].childNodes[0].nodeValue;  
         var FechaHoraEnvio=root[cont].getElementsByTagName("FechaHoraEnvio")[0].childNodes[0].nodeValue;  
         var FechaHoraRespuesta=root[cont].getElementsByTagName("FechaHoraRespuesta")[0].childNodes[0].nodeValue;  
         var TotalFactura=root[cont].getElementsByTagName("TotalFactura")[0].childNodes[0].nodeValue;  
         var UUID=root[cont].getElementsByTagName("UUID")[0].childNodes[0].nodeValue;
         var CodigoEstatus=root[cont].getElementsByTagName("CodigoEstatus")[0].childNodes[0].nodeValue;            
         var Estado=root[cont].getElementsByTagName("Estado")[0].childNodes[0].nodeValue;
         var AcuseRecibo=root[cont].getElementsByTagName("AcuseRecibo")[0].childNodes[0].nodeValue; 
         
         td1.innerHTML='<b>Servicio SAT<b>';
         td2.innerHTML=webservice;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');  
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Fecha Hora<br>de Consulta</b>';
         td2.innerHTML=FechaHoraEnvio;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);      
         
         
         td1.innerHTML='<b>Emisor RFC</b>';
         td2.innerHTML=EmisorRfc;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td');
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Receptor RFC</b>';
         td2.innerHTML=ReceptorRFC;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);                              
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Total de la Factura</b>';
         td2.innerHTML='$'+TotalFactura;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Folio Fiscal<br>del CFDI</b>';
         td2.innerHTML=UUID;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Respuesta SAT</b>';
         td2.innerHTML=CodigoEstatus;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Estado del CFDI</b>';
         td2.innerHTML=Estado;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Fecha Hora<br>de Respuesta</b>';
         td2.innerHTML=FechaHoraRespuesta;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);
         
         td1=document.createElement('td');
         td2=document.createElement('td'); 
         tr1=document.createElement('tr');     
         
         td1.innerHTML='<b>Folio Fiscal <br>Respuesta</b>';
         td2.innerHTML=AcuseRecibo;
         tr1.appendChild(td1);
         tr1.appendChild(td2);
         tabla_acuse.appendChild(tr1);                           
     }
                                                
    $('#contenido_acuse').append(tabla_acuse);    
    $( "#contenedor_acuse" ).dialog(
    {
        minHeight: 400,minWidth:700,modal: true, closeOnEscape:true,title:"Acuse de Recibo", show:{ effect: "clip"},hide: { effect: "fold"}
    });           
    
    $('#boton_imprimir_acuse').click(function()
    {
        $("#contenedor_acuse").printArea();
    });    
}
/*
 * Muestra la vista previa de un documento PDF perteneciente al listado de histórico
 */
function vista_revia_pdf_historico(ruta_pdf)
{
    $('#vista_previa_pdf_historico').empty();
    $('#vista_previa_pdf_historico').append('<embed src="'+ruta_pdf+'" width="99%" height="99%"></embed>');
    $("#vista_previa_pdf_historico" ).dialog(
    {
//        height: visor_Height,width:visor_Width,,modal: true, closeOnEscape:true,title:"Vista Previa PDF", show:{ effect: "clip"},hide: { effect: "fold"}, buttons: { "Cerrar": function (){ $(this).dialog("close");}}
        height: visor_Height,width:visor_Width,modal: true,    closeOnEscape:false,title:"Cargar un PDF",
            buttons: 
            {  "Cerrar": function () { $(this).dialog("close"); }}
    });           
}