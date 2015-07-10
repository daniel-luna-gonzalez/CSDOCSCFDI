/* global visor_Width, visor_Height */

//ARCHIVO QUE CONTIENE LA FUNCIÓN PARA EL LLENADO DE LA LISTA DE XML Y PDF POR EMPLEADO
//CON EL FORMATO DE TABLA DEL PLUG IN DATATABLE, SE MUESTRA EN EL DIV LISTADO POR ARRIBA DE
//LA BARRA DE OPCIONES (ICONOS PARTE CENTRAL)

/*
 * 
 * Content de selección para descarga y envio de correos
 */

/* Nos devuelve el título del nodo que se encuentra activo */

$(document).ready(function(){

               
});

/*
 * 
 * Vista previa de un CFDI que se encuentra en el historial
 * Se crear el contenedor para la vista, es independiente de la vista que se genera
 * cuando se quiere visualizar un XML desde la tabla de listado de XML y PDF
 * al seleccionar un cliente o recibo de nómina
 */

function crear_content_cfdi_copia_historico(content)
{
    if(content=='proveedor' || content=='cliente')
    {
        $('#div_cfdi_copia_historico').append('<div class="boton_get_acuse" id="copia_'+content+'_div_boton_imprimir"></div>');
        $('#div_cfdi_copia_historico').append('<div class="division1_preview_emisor_detalle"><div id="copia_'+content+'_div_preview_emisor" class="div_preview_emisor"></div><div id="copia_'+content+'_div_preview_detalle" class="div_preview_detalle"></div></div>');
        $('#div_cfdi_copia_historico').append('<hr>');
        $('#div_cfdi_copia_historico').append('<div class="division2_preview_receptor"><div id="copia_'+content+'_div_preview_receptor" class="div_preview_receptor"></div></div>');
        $('#div_cfdi_copia_historico').append('<hr>');
        $('#div_cfdi_copia_historico').append('<div class="division3_preview_conceptos"><div id="copia_'+content+'_div_preview_conceptos" class="div_preview_conceptos"> </div></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_totales_conceptos" class="division4_preview_totales_conceptos"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_detalle_pago" class="division5_preview_detalle_pago"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_sello_digital" class="division6_preview_sello_digital"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_complemento_certificacion" class="division7_preview_complemento_certificacion"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_expedido" ></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_impuestos" class="div_preview_deducciones"></div> ');
        $('#copia_'+content+'_div_boton_imprimir').append('<input type="button" value="Imprimir" id="'+content+'_imprimir_cfdi_historial">');
    }
    if(content=='nomina')
    {                   
               
     $('#div_cfdi_copia_historico').append('<div class="boton_get_acuse" id="copia_'+content+'_div_boton_imprimir"></div>');
        $('#div_cfdi_copia_historico').append('<div class="division1_preview_emisor_detalle"><div id="copia_'+content+'_div_preview_emisor" class="div_preview_emisor"></div><div id="copia_'+content+'_div_preview_detalle" class="div_preview_detalle"></div></div>');
        $('#div_cfdi_copia_historico').append('<hr>');
        $('#div_cfdi_copia_historico').append('<div class="division2_preview_receptor"><div id="copia_'+content+'_div_preview_receptor" class="div_preview_receptor"></div></div>');
        $('#div_cfdi_copia_historico').append('<hr>');
        $('#div_cfdi_copia_historico').append('<div id="copia_nomina_div_preview_percepciones_deducciones" class="division4_preview_percepciones_deducciones"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_totales_conceptos" class="division4_preview_totales_conceptos"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_detalle_pago" class="division5_preview_detalle_pago"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_sello_digital" class="division6_preview_sello_digital"></div>');
        $('#div_cfdi_copia_historico').append('<div id="copia_'+content+'_div_preview_complemento_certificacion" class="division7_preview_complemento_certificacion"></div>');
        $('#copia_'+content+'_div_boton_imprimir').append('<input type="button" value="Imprimir" id="'+content+'_imprimir_cfdi_historial">');
    }
        $('#'+content+'_imprimir_cfdi_historial').button();
}





            /*************************************************** 
             *          Content Factura Proveedor              * 
             ***************************************************
             */
 var proveedor_oTable;            
function proveedor_list_detalle_empleado(xml)
  {      
      var div=document.getElementById('proveedor_tabla_detalle');
      div.innerHTML="";
      var tabla =document.createElement("table");
//      tabla.setAttribute("align", "center");
       tabla.setAttribute("id", "proveedor_listado");
      tabla.setAttribute("class", "display");       
//       tabla.setAttribute("class", "display");
//      tabla.setAttribute("border", "1");
//      tabla.setAttribute("class", "display");
      var tbBody = document.createElement("tbody");
      var tr = document.createElement("tr");    
      var th1=document.createElement("th");
      var th2=document.createElement("th");
      var th3=document.createElement("th");
      var th4=document.createElement("th");
      var th5=document.createElement("th");
      var th6=document.createElement("th");
      var th7=document.createElement("th");
      var thead=document.createElement("thead");
       th1.innerHTML="Fecha";
       tr.appendChild(th1);
       th2.innerHTML="Folio";
       tr.appendChild(th2);
       th3.innerHTML="Subtotal";
       tr.appendChild(th3);
       th4.innerHTML="Descuento";
       tr.appendChild(th4);    
       th5.innerHTML="Total";
       tr.appendChild(th5); 
       th6.innerHTML="Documentos";
       tr.appendChild(th6);
       th7.innerHTML="Seleccionar";
       tr.appendChild(th7);
       
       thead.appendChild(tr);       
       tabla.appendChild(thead);
       
       var iteracion=0;
      var root=xml.getElementsByTagName("detalle")    
      var fila;
     for (i=0;i<root.length;i++) 
     {                 
        var tr1 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        var td6 = document.createElement("td");
        var td7=document.createElement("td");
        
         var id =root[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
         
         var fecha=root[i].getElementsByTagName("fecha")[0].childNodes[0].nodeValue;           
         var folio=root[i].getElementsByTagName("folio")[0].childNodes[0].nodeValue;
         var subtotal=root[i].getElementsByTagName("subtotal")[0].childNodes[0].nodeValue;
         var descuento=root[i].getElementsByTagName("descuento")[0].childNodes[0].nodeValue;
         var total=root[i].getElementsByTagName("total")[0].childNodes[0].nodeValue;              
         var RutaXml=root[i].getElementsByTagName("RutaXml")[0].childNodes[0].nodeValue;         
         var RutaPdf=root[i].getElementsByTagName("pdf")[0].childNodes[0].nodeValue;   
         var RutaAcuse=root[i].getElementsByTagName("ruta_acuse")[0].childNodes[0].nodeValue;   
//         alert("id"+id+" fecha "+fecha+"SB "+SalarioDiario + "xml "+RutaXml);
         subtotal=formato_numero(subtotal,2,'.',',');
         descuento=formato_numero(descuento,2,'.',',');
         total=formato_numero(total,2,'.',',');

         td1.innerHTML = fecha;
         td2.innerHTML = folio;
         td3.innerHTML = "$"+subtotal;
         td4.innerHTML="$"+descuento;
         td5.innerHTML="$"+total;       
      
         //icono xml 
         var imagen =document.createElement("img");
         imagen.setAttribute("src", "img/folder_xml.png");
         imagen.setAttribute("width", 38);
         imagen.setAttribute("height", 24);
         imagen.style.cursor="pointer";
         imagen.setAttribute('id', 'proveedor_img_xml_'+id);
         tr1.setAttribute('id', 'fila_'+id);         
         var funcion='proveedor_llama_xml('+id+')';
         
         imagen.setAttribute('onclick', funcion);      
         

         //icono pdf
         var imagen_pdf =document.createElement("img");
         imagen_pdf.setAttribute("src", "img/pdf_icon.png");
         imagen_pdf.setAttribute("width", 38);
         imagen_pdf.setAttribute("height", 24); 
         var funcion_pdf="proveedor_search_pdf("+id+")";
         imagen_pdf.setAttribute('onclick', funcion_pdf);
         imagen_pdf.style.cursor="pointer";
         imagen_pdf.setAttribute('id', 'proveedor_img_pdf_'+id);
                                    
          //Si no existe pdf asociado se elimina el icono pdf
          if(RutaPdf=="S/PDF")
          {                       
              imagen_pdf.setAttribute('style', 'display:none');              
          }
          td6.appendChild(imagen);
          td6.appendChild(imagen_pdf);
          
          var check=document.createElement('input');
          check.type = 'checkbox';
          check.id="proveedor_check_"+id;
          check.style.cursor="pointer";
          //var funcion_seleccion="lista_seleccion_xml('proveedor',"+id+")";
          var funcion_nombre="content_seleccion('proveedor','"+id+"','"+fecha+"','"+folio+"','"+total+"','"+RutaXml+"','"+RutaPdf+"','"+check.id+"','"+RutaAcuse+"')";
          check.setAttribute("onclick",funcion_nombre);
          
          /* Si existe un elemento en el listado de selección el checkbox se marca */
          if($('#proveedor_'+id).length===1)
          {
              check.setAttribute('checked',' true');
          }
          
          td7.appendChild(check);
          
         
         tr1.appendChild(td1);	        
         tr1.appendChild(td2);	
         tr1.appendChild(td3);
         tr1.appendChild(td4);
         tr1.appendChild(td5);
         tr1.appendChild(td6);	
         tr1.appendChild(td7);
         
         tr1.id=id;/* id de la fila corresponde al id del detalle */
         

         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);  
         
     }        
      div.appendChild(tabla);
      /*
       *Se le da formato a la tabla creada
       */
      proveedor_formato_tabla();
      
  }          
  function proveedor_llama_xml(id)
  {          
        //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
        $('#proveedor_id').html('');
        $('#proveedor_id').append('<input type="radio" name="proveedor_radio_upload_xml" id="proveedor_radio_upload_xml" value="'+id+'">');
        //Se oculta inmediatamente
        $('#proveedor_radio_upload_xml').css('display','none'); 
        var id_usuario_sistema=$('#id_usr').val();       

        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Seleccion_archivos.php",
        data: "id_detalle="+id+"&id_login="+id_usuario_sistema+'&content=proveedor&opcion=get_cfdi', 
        success:  function(xml)
        {   

            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });    
            
            $('#proveedor_div_boton_get_acuse').empty();
            $('#proveedor_div_boton_get_acuse').append('<input type="button" value="Mostrar Acuse de Validación" id="proveedor_boton_mostrar_acuse">');
            $('#proveedor_boton_mostrar_acuse').button();
            proveedor_display_xml('', xml);
            var historical = new Historical();
            $('#ProveedorDocuments').dialog({minWidth:500,height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: {"Descargar Histórico": function (){ historical.DownloadHistorical('proveedor', id);}, "Cerrar": function() { $(this).dialog("destroy"); } } });
            $('#proveedor_contenedor_documentos').tabs();
            $( "#proveedor_contenedor_documentos li" ).removeClass( "ui-corner-top" );   
            
            $('#proveedor_boton_mostrar_acuse').click(function()
            {
                var receipt = new Receipt();
                var XmlSatAnswer = receipt.GetXmlSatValidationCfdiAnswer('proveedor', id);
                if($.isXMLDoc(XmlSatAnswer))
                    mostrar_acuse(XmlSatAnswer);
            });
            var historic = new Historical();
            historic.GetHistoric('proveedor', id);
                       
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });  
  }
  
  /* Se llena el div con la información del XML para Imprimir */
  
  function proveedor_llenar_vista_impresion()
  {          
    var id_detalle=$('#proveedor_radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();       
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+"&id_login="+id_usuario_sistema+'&content=proveedor&opcion=get_cfdi');   
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                        
            var xml=ajax.responseXML;   
           proveedor_display_xml('',xml);    //Archivo preview.js 
           $.fn.tabbedDialog = function () {
            this.tabs({active: 0});
            this.dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: { "Cerrar": function() { $(this).dialog("close"); } } });
            this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
            this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
            this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
            var tabul = this.find('ul:first');
            this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
            this.siblings('.ui-dialog-titlebar').remove();
//            tabul.addClass('ui-dialog-titlebar');
        }
        $('#proveedor_contenedor_documentos').tabbedDialog();
           $("#proveedor_preview").printArea();     
        $('#proveedor_contenedor_documentos').dialog('close');
        
       }              
    };
  }  

function proveedor_formato_tabla()
{
        /* Apply the tooltips */
    /* Add a click handler to the rows - this could be used as a callback */
    $("#proveedor_listado tbody tr").click( function( e ) {
            if (! $(this).hasClass('row_selected') ) {
                proveedor_oTable.$('tr.row_selected').removeClass('row_selected');
                $(this).addClass('row_selected');
                var id=this.id;
                //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
                $('#proveedor_id').html('');
                $('#proveedor_id').append('<input type="radio" name="proveedor_radio_upload_xml" id="proveedor_radio_upload_xml" value="'+id+'">');
                //Se oculta inmediatamente
                 $('#proveedor_radio_upload_xml').css('display','none'); 
//                proveedor_llama_xml(id);
            }
    });

    /* Init the table */
    proveedor_oTable = $('#proveedor_listado').dataTable(OptionsDataTable);
        
        var nodes = proveedor_oTable.fnGetNodes();
        jQuery.each(nodes, function(key, fila){
                if(key==0)
                    {
//                        proveedor_llama_xml($(fila).attr('id'));
                        $(fila).addClass('row_selected');
                        var id=$(fila).attr('id');
                        //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
                        $('#proveedor_id').html('');
                        $('#proveedor_id').append('<input type="radio" name="proveedor_radio_upload_xml" id="proveedor_radio_upload_xml" value="'+id+'">');
                        //Se oculta inmediatamente
                         $('#proveedor_radio_upload_xml').css('display','none'); 
                    }                  
        }
);
}                                


            /*************************************************** 
             *          Content Factura Cliente                * 
             ***************************************************
             */
function cliente_list_detalle_empleado(xml)
  {      
      var div=document.getElementById('cliente_tabla_detalle');
      
      div.innerHTML="";
      var tabla =document.createElement("table");
//      tabla.setAttribute("align", "center");
       tabla.setAttribute("id", "cliente_listado");
//      tabla.setAttribute("border", "1");
      tabla.setAttribute("class", "display");
      var tbBody = document.createElement("tbody");
      var tr = document.createElement("tr");    
      var th1=document.createElement("th");
      var th2=document.createElement("th");
      var th3=document.createElement("th");
      var th4=document.createElement("th");
      var th5=document.createElement("th");
      var th6=document.createElement("th");
      var th7=document.createElement("th");      
      var thead=document.createElement("thead");
       th1.innerHTML="Fecha";
       tr.appendChild(th1);
       th2.innerHTML="Folio";
       tr.appendChild(th2);
       th3.innerHTML="Subtotal";
       tr.appendChild(th3);
       th4.innerHTML="Descuento";
       tr.appendChild(th4);    
       th5.innerHTML="Total";
       tr.appendChild(th5); 
       th6.innerHTML="Documentos";
       tr.appendChild(th6);
       th7.innerHTML="Seleccionar";
       tr.appendChild(th7);
       
       thead.appendChild(tr);       
       tabla.appendChild(thead);
       
      var root=xml.getElementsByTagName("detalle")       
     for (i=0;i<root.length;i++) 
     {                 
        var tr1 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        var td6 = document.createElement("td");
        var td7 = document.createElement("td");
        
        
         var id =root[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
         
         var fecha=root[i].getElementsByTagName("fecha")[0].childNodes[0].nodeValue;           
         var folio=root[i].getElementsByTagName("folio")[0].childNodes[0].nodeValue;
         var subtotal=root[i].getElementsByTagName("subtotal")[0].childNodes[0].nodeValue;
         var descuento=root[i].getElementsByTagName("descuento")[0].childNodes[0].nodeValue;
         var total=root[i].getElementsByTagName("total")[0].childNodes[0].nodeValue;              
         var RutaXml=root[i].getElementsByTagName("RutaXml")[0].childNodes[0].nodeValue;         
         var RutaPdf=root[i].getElementsByTagName("pdf")[0].childNodes[0].nodeValue;
         var RutaAcuse=root[i].getElementsByTagName("ruta_acuse")[0].childNodes[0].nodeValue;
//         alert("id"+id+" fecha "+fecha+"SB "+SalarioDiario + "xml "+RutaXml);
        descuento=formato_numero(descuento,2,'.',',');
        subtotal=formato_numero(subtotal,2,'.',',');
        total=formato_numero(total,2,'.',',');

         td1.innerHTML = fecha;
         td2.innerHTML = folio;
         td3.innerHTML = "$"+subtotal;
         td4.innerHTML="$"+descuento;
         td5.innerHTML="$"+total;
         
      
         //icono xml 
         var imagen =document.createElement("img");
         imagen.setAttribute("src", "img/folder_xml.png");
         imagen.setAttribute("width", 30);
         imagen.setAttribute("height", 30);
         imagen.setAttribute('id', 'cliente_img_xml_'+id);
         var funcion='cliente_llama_xml('+id+')';
         imagen.setAttribute('onclick', funcion);
         imagen.style.cursor="pointer";
         
         //icono pdf
         var imagen_pdf =document.createElement("img");
         imagen_pdf.setAttribute("src", "img/pdf_icon.png");
         imagen_pdf.setAttribute("width", 30);
         imagen_pdf.setAttribute("height", 30);
         var funcion_pdf="cliente_search_pdf("+id+")";
         imagen_pdf.setAttribute('onclick', funcion_pdf);
         
          
          imagen_pdf.id='cliente_img_pdf_'+id;
          imagen_pdf.style.cursor="pointer";
          
          //Si existe un pdf se inserta en la tabla de búsqueda y paginado
          if(RutaPdf=="S/PDF")
          {                       
              imagen_pdf.setAttribute('style', 'display:none');              
          }
                  
          
          td6.appendChild(imagen);
          td6.appendChild(imagen_pdf);
          
          var check=document.createElement('input');
          check.type = 'checkbox';
          check.id="cliente_check_"+id;
          check.style.cursor="pointer";
          //var funcion_seleccion="lista_seleccion_xml('proveedor',"+id+")";
          var funcion_nombre="content_seleccion('cliente','"+id+"','"+fecha+"','"+folio+"','"+total+"','"+RutaXml+"','"+RutaPdf+"','"+check.id+"', '"+RutaAcuse+"')";      
          check.setAttribute("onclick",funcion_nombre);
          
          /* Si existe un elemento en el listado de selección el checkbox se marca */
          if($('#cliente_'+id).length===1)
          {
              check.setAttribute('checked',' true');
          }
          
          td7.appendChild(check);
              
          tr1.appendChild(td1);	        
          tr1.appendChild(td2);	
          tr1.appendChild(td3);
          tr1.appendChild(td4);
          tr1.appendChild(td5);
          tr1.appendChild(td6);	
          tr1.appendChild(td7);	
          
          tr1.id=id;         

          tbBody.appendChild(tr1);
          tabla.appendChild(tbBody);  
         
     }   
      
      div.appendChild(tabla);
      /*
       *Se le da formato a la tabla creada
       */
      cliente_formato_tabla();
      /*Se llama al primer XMl al seleccionar un empleado del árbol
       */
//      cliente_llama_xml(iteracion);
    
  }          
  //Ajax trae de vuelta el xml solicitado
  function cliente_llama_xml(id)
  {                
      //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
        $('#cliente_id').html('');
        $('#cliente_id').append('<input type="radio" name="cliente_radio_upload_xml" id="cliente_radio_upload_xml" value="'+id+'">');
      //Se oculta inmediatamente
        $('#cliente_radio_upload_xml').css('display','none'); 
        var id_usuario_sistema=$('#id_usr').val();    
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Seleccion_archivos.php",
        data: "id_detalle="+id+"&id_login="+id_usuario_sistema+'&content=cliente&opcion=get_cfdi', 
        success:  function(xml)
        {   
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                return 0;
            });    
            
            $('#cliente_div_boton_get_acuse').empty();
            $('#cliente_div_boton_get_acuse').append('<input type="button" value="Mostrar Acuse de Validación" id="cliente_boton_mostrar_acuse">');
            $('#cliente_boton_mostrar_acuse').button();
            cliente_display_xml('', xml);
            var historical = new Historical();            
            $('#ClienteDocuments').dialog({minWidth:500,height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: {"Descargar Histórico": function (){ historical.DownloadHistorical('cliente', id);}, "Cerrar": function() { $(this).dialog("close"); } } });
            $('#cliente_contenedor_documentos').tabs();
            $( "#cliente_contenedor_documentos li" ).removeClass( "ui-corner-top" );   
            
            $('#cliente_boton_mostrar_acuse').click(function()
            {
                var SatAnswer = new SATAnswer();
                var XmlSatAnswer = SatAnswer.GetXmlSatValidationCfdiAnswer('cliente', id);
                if($.isXMLDoc(XmlSatAnswer))
                    mostrar_acuse(XmlSatAnswer);
            }); 
            
            var historic = new Historical();
            historic.GetHistoric('cliente', id);
            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });          
  }
  
  function cliente_llenar_vista_impresion()
  {          
      var emptyTest = $('#cliente_div_preview_emisor').is(':empty');
      var id_detalle=$('#cliente_radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();       
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id_detalle+"&id_login="+id_usuario_sistema+'&content=cliente&opcion=get_cfdi');   
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                        
           var xml=ajax.responseXML; 
           cliente_display_xml('',xml);    //Archivo preview.js   
//           $( "#cliente_preview" ).dialog(
//            {
//                height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visualizar XML'                       
//            });
            $.fn.tabbedDialog = function () {
            this.tabs({active: 0});
            this.dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: { "Cerrar": function() { $(this).dialog("close"); } } });
            this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
            this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
            this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
            var tabul = this.find('ul:first');
            this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
            this.siblings('.ui-dialog-titlebar').remove();
//            tabul.addClass('ui-dialog-titlebar');
        };
        $('#cliente_contenedor_documentos').tabbedDialog();
           $("#cliente_preview").printArea();           
       }              
    };
  }
  
  
  
     var cliente_oTable;
function cliente_formato_tabla()
{    
    /* Add a click handler to the rows - this could be used as a callback */
    $("#cliente_listado tbody tr").click( function( e ) {
            if (! $(this).hasClass('row_selected') ) {
                cliente_oTable.$('tr.row_selected').removeClass('row_selected');
                $(this).addClass('row_selected');
                var id=this.id;
//                cliente_llama_xml(id);
                 //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
                $('#cliente_id').html('');
                $('#cliente_id').append('<input type="radio" name="cliente_radio_upload_xml" id="cliente_radio_upload_xml" value="'+id+'">');
                //Se oculta inmediatamente
                 $('#cliente_radio_upload_xml').css('display','none'); 
            }
    });

    /* Init the table */
    cliente_oTable = $('#cliente_listado').dataTable(OptionsDataTable);
        
        var nodes = cliente_oTable.fnGetNodes();
        var row = null;
        var cont=0;
        jQuery.each(nodes, function(key, fila){
            if(key==0)
                {
    //                        cliente_llama_xml($(fila).attr('id'));
                    $(fila).addClass('row_selected');

                    var id=$(fila).attr('id');
                    $('#cliente_id').html('');
                    $('#cliente_id').append('<input type="radio" name="cliente_radio_upload_xml" id="cliente_radio_upload_xml" value="'+id+'">');
                    //Se oculta inmediatamente
                     $('#cliente_radio_upload_xml').css('display','none');

                    }                  
        });                                          
}        
        
        
        
            /*************************************************** 
             *          Content Recibos de Nómina              * 
             ***************************************************
             */
function list_detalle_empleado(xml)
  {      
      var div=document.getElementById('tabla_detalle');
      div.innerHTML="";
      var tabla =document.createElement("table");
       tabla.setAttribute("id", "listado");
      tabla.setAttribute("class", "display");
      var tbBody = document.createElement("tbody");
      var tr = document.createElement("tr");    
      var th1=document.createElement("th");
      var th2=document.createElement("th");
      var th3=document.createElement("th");
      var th4=document.createElement("th");
      var th5=document.createElement("th");
      var th6=document.createElement("th");
      var th7=document.createElement("th");
      var thead=document.createElement("thead");
       th1.innerHTML="Fecha";
       tr.appendChild(th1);
       th2.innerHTML="Salario Base";
       tr.appendChild(th2);
       th3.innerHTML="Salario Diario";
       tr.appendChild(th3);
       th4.innerHTML="Documentos";
       tr.appendChild(th4); 
       th5.innerHTML="Seleccionar";
       tr.appendChild(th5); 
       
       thead.appendChild(tr);       
       tabla.appendChild(thead);
       
      var root=xml.getElementsByTagName("detalle")       
     for (i=0;i<root.length;i++) 
     {                 
        var tr1 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        
         var id =root[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
         
         var fecha=root[i].getElementsByTagName("fecha")[0].childNodes[0].nodeValue;           
         var SalarioBase=root[i].getElementsByTagName("SalarioBase")[0].childNodes[0].nodeValue;
         var SalarioDiario=root[i].getElementsByTagName("SalarioDiario")[0].childNodes[0].nodeValue;         
         var RutaXml=root[i].getElementsByTagName("RutaXml")[0].childNodes[0].nodeValue;         
         var RutaPdf=root[i].getElementsByTagName("pdf")[0].childNodes[0].nodeValue;   
         var RutaAcuse=root[i].getElementsByTagName("ruta_acuse")[0].childNodes[0].nodeValue;   
//         alert("id"+id+" fecha "+fecha+"SB "+SalarioDiario + "xml "+RutaXml);

         SalarioBase=formato_numero(SalarioBase,2,'.',',');
         SalarioDiario=formato_numero(SalarioDiario,2,'.',',');
         
         td1.innerHTML = fecha;
         td2.innerHTML = '$'+SalarioBase;
         td3.innerHTML = '$'+SalarioDiario;
      
         //icono xml en div listado
         var imagen =document.createElement("img");
         imagen.setAttribute("src", "img/folder_xml.png");
         imagen.setAttribute("width", 30);
         imagen.setAttribute("height", 30);
         var funcion='llama_xml('+id+')';
         imagen.setAttribute('onclick', funcion);
         imagen.style.cursor="pointer";
                 
         //icono pdf
         var imagen_pdf =document.createElement("img");
         imagen_pdf.setAttribute("src", "/img/pdf_icon.png");
         imagen_pdf.setAttribute("width", 30);
         imagen_pdf.setAttribute("height", 30);
         var funcion_pdf="search_pdf("+id+")";
         imagen_pdf.style.cursor="pointer";
         imagen_pdf.setAttribute('onclick', funcion_pdf);      
         imagen_pdf.id='nomina_img_pdf_'+id;
          
          //Si existe un pdf se inserta en la tabla de búsqueda y paginado
          if(RutaPdf=="S/PDF")
          {                       
              imagen_pdf.setAttribute('style', 'display:none');              
          }
         td4.appendChild(imagen);
         td4.appendChild(imagen_pdf);
         
         var check=document.createElement('input');
         check.type = 'checkbox';
         check.id="nomina_check_"+id;
         check.style.cursor="pointer";
         //var funcion_seleccion="lista_seleccion_xml('proveedor',"+id+")";
         var funcion_nombre="content_seleccion('nomina','"+id+"','"+fecha+"','S/f','"+SalarioBase+"','"+RutaXml+"','"+RutaPdf+"','"+check.id+"', '"+RutaAcuse+"')";      
         check.setAttribute("onclick",funcion_nombre);
          
         /* Si existe un elemento en el listado de selección el checkbox se marca */
         if($('#nomina_'+id).length===1)
         {
             check.setAttribute('checked',' true');
         }          
         td5.appendChild(check);
                           
         tr1.appendChild(td1);	        
         tr1.appendChild(td2);	
         tr1.appendChild(td3);
         tr1.appendChild(td4);	
         tr1.appendChild(td5);	

        tr1.id=id; /* id de cada fila para actualizar vista de xml con click sobre una fila */
         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);  
         
     }        
      div.appendChild(tabla);
      /*
       *Se le da formato a la tabla creada
       */
      formato_tabla();
  }          
  //Ajax trae de vuelta el xml solicitado
  function llama_xml(id)
  {      
      //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
      $('#id_empleado').html('');
      $('#id_empleado').append('<input type="radio" name="radio_upload_xml" id="radio_upload_xml" value="'+id+'">');
      //Se oculta inmediatamente
       $('#radio_upload_xml').css('display','none'); 
       
    var id_usuario_sistema=$('#id_usr').val();/* Log */
       
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_detalle="+id+"&id_login="+id_usuario_sistema+'&content=nomina&opcion=get_cfdi');    
 
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4 && ajax.status==200) 
       {      
           var xml=ajax.responseXML;    
           
            var cadCodificadaJSON = JSON.parse(ajax.responseText);
            /* Se agrega el boton que muestra el acuse del CFDI */
            var xml_validacion=cadCodificadaJSON.ruta_validacion;
            $('#nomina_div_boton_get_acuse').empty();
            $('#nomina_div_boton_get_acuse').append('<input type="button" value="Mostrar Acuse de Validación" onclick="get_archivo_validacion(\''+xml_validacion+'\')" id="nomina_boton_mostrar_acuse">')
            $('#nomina_boton_mostrar_acuse').button();
       
           display_xml('',$.parseXML(cadCodificadaJSON.xml_cfdi));    //Archivo preview.js              
           var historical = new Historical();
            $.fn.tabbedDialog = function () {
            this.tabs({active: 0});           
            this.dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: {"Descargar Histórico": function (){ historical.DownloadHistorical('cliente', id);}, "Cerrar": function() { $(this).dialog("close"); } } });
            this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
            this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
            this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
            var tabul = this.find('ul:first');
            this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
            this.siblings('.ui-dialog-titlebar').remove();
//            tabul.addClass('ui-dialog-titlebar');
        }
        $('#nomina_contenedor_documentos').tabbedDialog();
        nomina_get_historico();/* Se llena el historial del CFDI */
       }              
    };
  }
  
  function nomina_llenar_vista_impresion()
  {          
      var id_detalle=$('#radio_upload_xml').val();
    var id_usuario_sistema=$('#id_usr').val();       
    ajax=objetoAjax();
    ajax.open("POST", 'php/Seleccion_archivos.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        ajax.send("id_detalle="+id_detalle+"&id_login="+id_usuario_sistema+'&content=nomina&opcion=get_cfdi');    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4 && ajax.status==200) 
       {                        
           var xml=ajax.responseXML;    
           display_xml('',xml);    //Archivo preview.js   
//           $( "#preview" ).dialog(
//            {
//                height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visualizar XML'                       
//            });
            $.fn.tabbedDialog = function () {
            this.tabs({active: 0});
            this.dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: { "Cerrar": function() { $(this).dialog("close"); } } });
            this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
            this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
            this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
            var tabul = this.find('ul:first');
            this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
            this.siblings('.ui-dialog-titlebar').remove();
//            tabul.addClass('ui-dialog-titlebar');
        }
        $('#nomina_contenedor_documentos').tabbedDialog();
           $("#preview").printArea();           
       }              
    }
  }
  
  
  
var oTable;
function formato_tabla()
{
    
//   $('#listado tbody tr').each( function() {
//		var sTitle;
//		var nTds = $('td', this);
//		var fecha = $(nTds[0]).text();
//                var salariob = $(nTds[1]).text();
//		var salariod = $(nTds[2]).text();
//                var cadena ="Fecha:"+fecha+" Salario:"+salariob+ " Salario Diario:"+salariod;
//		this.setAttribute( 'title', cadena );
//	} );
   
        /* Apply the tooltips */
    /* Add a click handler to the rows - this could be used as a callback */
    $("#listado tbody tr").click( function( e ) {
            if (! $(this).hasClass('row_selected') ) {
                oTable.$('tr.row_selected').removeClass('row_selected');
                $(this).addClass('row_selected');
                var id=this.id;
                //Se crean los elementos ocultos que contienen el id del empleado en la tabla detalle y la ruta del xml
                $('#id_empleado').html('');
                $('#id_empleado').append('<input type="radio" name="radio_upload_xml" id="radio_upload_xml" value="'+id+'">');
                //Se oculta inmediatamente
                 $('#radio_upload_xml').css('display','none'); 
//                llama_xml(id);
            }
    });

    /* Init the table */
    oTable = $('#listado').dataTable( 
        {
            "bJQueryUI": true,
		"sPaginationType": "full_numbers",
                "oLanguage": {
			"sLengthMenu": "Mostrar _MENU_ registros por página",
			"sZeroRecords": "No se encontraron resultados",
			"sInfo": "Mostrados _START_ de _END_ de _TOTAL_ registro(s)",
			"sInfoEmpty": "Mostrados 0 de 0 of 0 registros",
			"sInfoFiltered": "(Filtrando desde _MAX_ total registros)"
                            }
        } );
        
        var nodes = oTable.fnGetNodes();
        var row = null;
        var cont=0;
        jQuery.each(nodes, function(key, fila){
                if(key==0)
                    {
//                        llama_xml($(fila).attr('id'));
                        var id=$(fila).attr('id');
                         $('#id_empleado').html('');
                        $('#id_empleado').append('<input type="radio" name="radio_upload_xml" id="radio_upload_xml" value="'+id+'">');
                        //Se oculta inmediatamente
                         $('#radio_upload_xml').css('display','none'); 
                        $(fila).addClass('row_selected');
                    }                  
        } );  
        
        
}


function formato_numero(numero, decimales, separador_decimal, separador_miles){ // v2007-08-06
    numero=parseFloat(numero);
    if(isNaN(numero)){
        return "";
    }

    if(decimales!==undefined){
        // Redondeamos
        numero=numero.toFixed(decimales);
    }

    // Convertimos el punto en separador_decimal
    numero=numero.toString().replace(".", separador_decimal!==undefined ? separador_decimal : ",");

    if(separador_miles){
        // Añadimos los separadores de miles
        var miles=new RegExp("(-?[0-9]+)([0-9]{3})");
        while(miles.test(numero)) {
            numero=numero.replace(miles, "$1" + separador_miles + "$2");
        }
    }

    return numero;
}

  



