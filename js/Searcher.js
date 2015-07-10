/* global ClassTree, EnvironmentData */

$('document').ready(function()
{
    $('.SearchButton').click(function()
    {
        var content = $(this).attr('content');
        var IdEnterprise = $('#'+content+'Enterprise').val();
        var StartDate = $('#'+content+'StartDateForm').val();
        var EndDate = $('#'+content+'EndDateForm').val();
        var SearchWord = $('#'+content+'SearchForm').val();
        var search = new Searcher();        
        search.Begin(content,IdEnterprise, StartDate, EndDate, SearchWord);                
    });
});

var Searcher = function()
{
    var self = this;
    this.content = undefined;
    
};

Searcher.prototype.Begin = function(content,IdEnterprise, StartDate, EndDate, SearchWord)
{
    var self = this;
//    console.log(IdEnterprise + ' '+StartDate+' '+EndDate+' '+SearchWord);
    var Tree = new ClassTree();
    Tree.RemoveTree(content);
    
    var data = {option:"Begin", EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName, content:content, IdEnterprise:IdEnterprise, StartDate:StartDate, EndDate:EndDate, SearchWord:SearchWord};
    
    $.ajax({
    async:true, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Searcher.php",
    data:data, 
    success:  function(xml)
    {   
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            return 0;
        });    
        
        $(xml).find('Search').each(function()
        {
            $('#SM_Permissions').append('<div id = "TreeRepositoriesUserGroups"><ul><li id = "0_MSR" data = "icon: \'Catalogo.png\'" class = "folder"> Repositorios <ul id = "MSR_0"></ul></ul></div>');
            $('#'+content+'Tree').append('<ul><li id = "_Root'+content+'Tree"  class = "folder"> CFDI <ul id = "Root'+content+'Tree"></ul></ul>');
            $(this).find('Result').each(function()
            {
                var IdTransmiter = $(this).find('IdTransmiter').text();
                var TransmiterName = $(this).find('TransmiterName').text();
                var TransmiterRfc = $(this).find('TransmiterRfc').text();
                var IdReceiver = $(this).find('IdReceiver').text();
                var ReceiverName = $(this).find('ReceiverName').text();
                var ReceiverRfc = $(this).find('ReceiverRfc').text();
                $('#Root'+content+'Tree').append('<li id="Folder_'+IdTransmiter+'" class="folder">'+TransmiterName+'<ul id="'+content+'Dir'+IdTransmiter+'"></ul>');
                $('#'+content+'Dir'+IdTransmiter).append('<li id="CFDI'+IdReceiver+'" data = "icon: \'folder_docs.gif\'" class="folder">'+ReceiverName+'<ul id="'+content+'Cfdi'+IdReceiver+'"></ul>');
            });     
            Tree.InitTree(content);
        });

    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });
};

//ARCHIVO QUE REALIZA LAS BUSQUEDAS AL PRESIONAR EL BOTON BUSQUEDA
        /*************************************************** 
         *          Content Factura Proveedor                * 
         ***************************************************
         */
function proveedor_list_empresas()
{
//    divResultado = document.getElementById('resultado');
    ajax=objetoAjax();
    ajax.open("GET", 'php/proveedor_list_empresas.php');
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {            
           //Obtenemos el XML del listado de empresas que viene de proveedor_list_empresas.php y llenamos el combo
            var xml=ajax.responseXML;          
            var miselect=$("#proveedor_select_empresa");
            miselect.find('option').remove().end().append('').val('');
            $("#proveedor_select_empresa").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
            $(xml).find("Empresa").each(function()
            {
               var $Empresa=$(this);
               var id=$Empresa.find("id").text();
               var rfc=$Empresa.find("rfc").text();
               var nombre = $Empresa.find("nombre").text();  
               $("#proveedor_select_empresa").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
            });

       }              
    };
        ajax.send(null);
}
function proveedor_clean_contents()
{
          /* Se limpia el arbol, la tabla de facturas y preview */
    $('#proveedor_tabla_detalle').html('');
    $('#proveedor_radio_upload_xml').remove();
    $('#proveedor_detalle').html('');
    $('#proveedor_expedido').html('');
    $('#proveedor_detalle_desgloce').html('');
    $('#proveedor_conceptos').html('');
    $('#proveedor_impuestos').html('');   
    
    var node=$("#proveedor_tree").dynatree("getActiveNode");
    if(node===null)return;
    if(node.data.key>0)
        {
            var parent=node.getParent();
            var id=parent.data.key;
            if(id>0)
            {
                var id_receptor=node.data.key;
 
                log_fechas('proveedor');/* LOg */
                proveedor_busqueda_xml_pdf(id,id_receptor); /* listado de facturas por proveedor */  
            } 
        }
     
}
//Función que envia los datos de la lista de empresa, palabra a buscar, rango de fechas
 function proveedor_llenar_arbol()
  {    
      var id_usuario_sistema=$('#id_usr').val();   /* Log */
      /* Se limpia el arbol, la tabla de facturas y preview */
    
    var id_emisor=document.getElementById('proveedor_select_empresa').value;
    var buscar=document.getElementById('proveedor_form_buscar').value;
    var fecha1=document.getElementById('proveedor_fecha1').value;
    var fecha2=document.getElementById('proveedor_fecha2').value;
//    divResultado = document.getElementById('salida');
    ajax=objetoAjax();
    ajax.open("POST", 'php/proveedor_list_arbol.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
//Comprobamos si tuvo éxito la consulta
       if (ajax.readyState===4 && ajax.status===200) 
       {   
//            $('#proveedor_tree').html('');
//            $('#proveedor_salida').append(ajax.responseText);    
            var array_arbol=JSON.parse(ajax.responseText);            
           proveedor_arbol(array_arbol);        
           proveedor_clean_contents();
       }              
    };    
  }  
            /* ******* Arbol ********/
function proveedor_arbol(array)
    {                  
//        $('#proveedor_tree').empty();
        $("#proveedor_tree").dynatree(
        {
            imagePath: "media/css/skin-custom/",
            onClick: function(node)
            {  
                var parent=node.getParent();
                var id=parent.data.key;
                if(id>0)
                    proveedor_busqueda_xml_pdf(id,node.data.key); /* listado de facturas por proveedor */  
                else
                    node.sortChildren(ClassTree.cmp, false);
            },
          children:array,
          expand: true, minExpandLevel: 2
        });      
        
        $("#proveedor_tree").dynatree("getTree").reload();
        var tree = $("#proveedor_tree").dynatree("getTree");
        var node = tree.getNodeByKey("Proveedor_");
        if(node)
            node.sortChildren(ClassTree.cmp, false);
    } 

//Ajax manda a llamar el php que hace la consulta para regresar los comprobantes
//que le corresponden a un empleado
function proveedor_busqueda_xml_pdf(id_emisor,id_receptor)
  {      
      
      var id_usuario_sistema=$('#id_usr').val();   /* Log */
      var buscar=document.getElementById('proveedor_form_buscar').value;
      var fecha1=document.getElementById('proveedor_fecha1').value;
      var fecha2=document.getElementById('proveedor_fecha2').value;
     ajax=objetoAjax();
    ajax.open("POST", 'php/proveedor_list_facturas.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&id_receptor="+id_receptor+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {                        
            var xml=ajax.responseXML; 
            proveedor_list_detalle_empleado(xml);                           
       }              
    };
  }
  
  
  /* Al cambiar los rangos de fecha después de una búsqueda se registra el movimiento */
  function log_fechas(content)
  {
    var id_emisor;
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var buscar;
    var fecha1;
    var fecha2;
    if(content=='cliente')
        {
            id_emisor=document.getElementById('cliente_select_empresa').value;
            buscar=document.getElementById('cliente_form_buscar').value;
            fecha1=document.getElementById('cliente_fecha1').value;
            fecha2=document.getElementById('cliente_fecha2').value;
        }
    if(content=='proveedor')
        {
            id_emisor=document.getElementById('proveedor_select_empresa').value;
            buscar=document.getElementById('proveedor_form_buscar').value;
            fecha1=document.getElementById('proveedor_fecha1').value;
            fecha2=document.getElementById('proveedor_fecha2').value;
        }
    if(content=='nomina')
        {
            id_emisor=document.getElementById('select_empresa').value;
            buscar=document.getElementById('form_buscar').value;
            fecha1=document.getElementById('fecha1').value;
            fecha2=document.getElementById('fecha2').value;
        }
    
    ajax=objetoAjax();
//    divResultado = document.getElementById('salida');
    ajax.open("POST", 'php/log_registro_fechas.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema+"&content="+content);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState==4) 
       {                   
         
       }              
    }
  }



        /*************************************************** 
         *          Content Factura Cliente                * 
         ***************************************************
         */
function cliente_list_empresas()
{
    divResultado = document.getElementById('resultado');
    ajax=objetoAjax();
    ajax.open("GET", 'php/cliente_list_empresas.php');
    ajax.onreadystatechange=function() 
    {
//Comprobamos si tuvo éxito la consulta
       if (ajax.readyState===4 && ajax.status===200) 
       {            
           //Obtenemos el XML del listado de empresas que viene de cliente_list_empresas.php y llenamos el combo
  
        var xml=ajax.responseXML;          
        var miselect=$("#cliente_select_empresa");
        miselect.find('option').remove().end().append('').val('');
        $("#cliente_select_empresa").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
        $(xml).find("Empresa").each(function()
        {
            var $Empresa=$(this);
            var id=$Empresa.find("id").text();
            var rfc=$Empresa.find("rfc").text();
            var nombre = $Empresa.find("nombre").text();  
            $("#cliente_select_empresa").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
        });
       }              
    }
        ajax.send(null);
}

function cliente_clean_contents()
{
          /* Se limpia el arbol, la tabla de facturas y preview */
    if($('#cliente_tabla_detalle').length==1){$('#cliente_tabla_detalle').html('');}
    if($('#cliente_radio_upload_xml').length==1){$('#cliente_radio_upload_xml').remove();}
    if($('#cliente_detalle').length==1){$('#cliente_detalle').html('');}
    if($('#cliente_expedido').length==1){$('#cliente_expedido').html('');}
    if($('#cliente_detalle_desgloce').length==1){$('#cliente_detalle_desgloce').html('');}
    if($('#cliente_conceptos').length==1){$('#cliente_conceptos').html('');}
    if($('#cliente_impuestos').length==1){$('#cliente_impuestos').html(''); }  
    
    /* Se Simula un click sobre un cliente para mostrar el lista de facturas */
    var node=$("#cliente_tree").dynatree("getActiveNode");
    if(node.data.key>0)
        {
            var parent=node.getParent();
            var id=parent.data.key;
            if(id>0)
            {
                log_fechas('cliente');/* LOg */
                cliente_busqueda_xml_pdf(id,node.data.key); /* listado de facturas por proveedor */                  
            } 
        }
     
}

//Función que envia los datos de la lista de empresa, palabra a buscar, rango de fechas
 function cliente_llenar_arbol()
  {       
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var id_emisor=document.getElementById('cliente_select_empresa').value;
    var buscar=document.getElementById('cliente_form_buscar').value;
    var fecha1=document.getElementById('cliente_fecha1').value;
    var fecha2=document.getElementById('cliente_fecha2').value;
//    divResultado = document.getElementById('salida');
    ajax=objetoAjax();
    ajax.open("POST", 'php/cliente_list_arbol.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
//Comprobamos si tuvo éxito la consulta
       if (ajax.readyState===4 && ajax.status===200) 
       {          
//            $('#cliente_salida').append(ajax.responseText);
           var array_arbol=JSON.parse(ajax.responseText);   
           cliente_arbol(array_arbol);              
           cliente_clean_contents(); 
       }              
    }    
  }  
            /* ******* Arbol ********/
function cliente_arbol(array)
    {             
        $("#cliente_tree").dynatree(
        {
            imagePath: "media/css/skin-custom/",
        onClick: function(node)
            {  
                var parent=node.getParent();
                var id=parent.data.key;
                if(id>0)
                    cliente_busqueda_xml_pdf(id,node.data.key); /* listado de facturas por proveedor */                    
            },
          children:array,
          expand: true, minExpandLevel: 2
        });      
        
        $("#cliente_tree").dynatree("getTree").reload();
        var tree = $("#cliente_tree").dynatree("getTree");
        var node = tree.getNodeByKey("Cliente_");
        if(node)
            node.sortChildren(ClassTree.cmp, false);
    }   

//Ajax manda a llamar el php que hace la consulta para regresar los comprobantes
//que le corresponden a un empleado
function cliente_busqueda_xml_pdf(id_emisor,id_receptor)
  {      
      var id_usuario_sistema=$('#id_usr').val();   /* Log */
      var fecha1=document.getElementById('cliente_fecha1').value;
      var fecha2=document.getElementById('cliente_fecha2').value;
      var buscar=document.getElementById('cliente_form_buscar').value;
     ajax=objetoAjax();
     divResultado = document.getElementById('salida');
    ajax.open("POST", 'php/cliente_list_facturas.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&id_receptor="+id_receptor+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {                 
//           divResultado.innerHTML=ajax.responseText;
            var xml=ajax.responseXML; 
//            $(this).tablas(); 
            cliente_list_detalle_empleado(xml);   
            
       }              
    }
  }

        /*************************************************** 
         *          Content Recibos de Nómina              * 
         ***************************************************
         */


/* Llenado de arbol */

function arbol(array)
    {  
        $("#tree").dynatree(
        {
            imagePath: "media/css/skin-custom/",  
            onClick: function(node)
            {  
                var parent=node.getParent();
                var id=parent.data.key;
                if(id>0)
                {
                    busqueda_xml_pdf(id,node.data.key); /* listado de facturas por proveedor */                    
                } 
            },
          children:array
        });      
        
        $("#tree").dynatree("getTree").reload();
    }
  

// Se carga el listado de empresas 
function List_empresas()
{  
    divResultado = document.getElementById('resultado');
    ajax=objetoAjax();
    ajax.open("GET", 'php/list_empresas.php');
    ajax.onreadystatechange=function() 
    {
//Comprobamos si tuvo éxito la consulta
       if (ajax.readyState===4 && ajax.status===200) 
       {            
           //Obtenemos el XML del listado de empresas que viene de Consultas_busqueda.php y llenamos el combo
//            var xml=ajax.responseXML;     
//            var root=xml.getElementsByTagName("Empresa")
//       
//             for (i=0;i<root.length;i++) 
//             { 
//                 var id =root[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
//                 var rfc=root[i].getElementsByTagName("rfc")[0].childNodes[0].nodeValue;             
//                 var nombre=root[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
//                 document.getElementById('select_empresa').options[i+1]=new Option(nombre, id);
//             }    
        var xml=ajax.responseXML;          
        var miselect=$("#select_empresa");
        miselect.find('option').remove().end().append('').val('');
        $("#select_empresa").append("<option value=\""+0+"\">Seleccione una Empresa</option>");
        $(xml).find("Empresa").each(function()
        {
            var $Empresa=$(this);
            var id=$Empresa.find("id").text();
            var rfc=$Empresa.find("rfc").text();
            var nombre = $Empresa.find("nombre").text();  
            $("#select_empresa").append("<option value=\""+id+"\">"+nombre+" ("+rfc+")</option>");
        });
       }                          
    }
        ajax.send(null);
}
/*
 *Función que envia los datos de la lista de empresa, palabra a buscar, rango de fechas
 */

 function llenar_arbol()
  {
    var id_usuario_sistema=$('#id_usr').val();   /* Log */    
    var id_emisor=document.getElementById('select_empresa').value;
    var buscar=document.getElementById('form_buscar').value;
    var fecha1=document.getElementById('fecha1').value;
    var fecha2=document.getElementById('fecha2').value;
    divResultado = document.getElementById('salida');
    var tree=document.getElementById('tree');
    ajax=objetoAjax();
    ajax.open("POST", 'php/list_arbol.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
//Comprobamos si tuvo éxito la consulta
       if (ajax.readyState==4) 
       {            
//           divResultado.innerHTML =ajax.responseText;
        var array_arbol=JSON.parse(ajax.responseText);   
           arbol(array_arbol);        
           nomina_clean_contents();            
       }              
    }    
  }  
  
function nomina_clean_contents()
{
          /* Se limpia el arbol, la tabla de facturas y preview */
    $('#tabla_detalle').html('');
    $('#radio_upload_xml').remove();
    $('#detalle').html('');
    $('#expedido').html('');
    $('#detalle_desgloce').html('');
    $('#percepciones').html('');
    $('#deducciones').html('');  
    $('#incapacidades').html(''); 
    $('#hrs_extra').html('');   
    
    var node=$("#tree").dynatree("getActiveNode");
    if(node.data.key>0)
        {
            var parent=node.getParent();
            var id=parent.data.key;
            if(id>0)
            {
                log_fechas('nomina');/* LOg */
                busqueda_xml_pdf(id,node.data.key); /* listado de facturas por proveedor */   
                
            } 
        }     
}
  
//Ajax manda a llamar el php que hace la consulta para regresar los comprobantes
//que le corresponden a un empleado
function busqueda_xml_pdf(id_emisor,id_receptor)
  {      
      var id_usuario_sistema=$('#id_usr').val();   /* Log */
      var fecha1=document.getElementById('fecha1').value;
      var fecha2=document.getElementById('fecha2').value;
      var buscar=document.getElementById('form_buscar').value;
     ajax=objetoAjax();
     divResultado = document.getElementById('salida');
    ajax.open("POST", 'php/busca_xml_pdf.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("id_emisor="+id_emisor+"&buscar="+buscar+"&id_receptor="+id_receptor+"&fecha1="+fecha1+"&fecha2="+fecha2+"&id_login="+id_usuario_sistema);    
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {   
           var xml=ajax.responseXML;
            list_detalle_empleado(xml);   
            
       }              
    }
  }
  
  

                                                   