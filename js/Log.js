
/********************************************************************************************************
 *                                          LOG                                                         *
 ********************************************************************************************************                                          
 **/
/*
 * Muestra el log completo del día
 */
function show_log_now()
{
    $('#admin_ventana_trabajo').html('');
    $( "#consola_administracion" ).dialog( "option", "buttons", []);
    
    
    $( "#admin_div_loading" ).dialog({closeOnEscape:false,position:"center",open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}});/* Borra [x] botón cerrar */
    $("#admin_div_loading").siblings('div.ui-dialog-titlebar').remove();/* Borra barra de título */
    
    
//    $('#consola_administracion').css( "width","600px" );$('#consola_administracion').css( "height","300px" );/* Tamaño estandar */
//    $('#consola_administracion').css( "height","800px" );
//    $('#consola_administracion').css( "width","1000px" );
    $('#div_loading').append('<center><img src="img/loading.gif" id="admin_loading_send" title="Cargando Registros" width="20" heigth="20"><center>'); 
    ajax=objetoAjax();
    ajax.open("POST", 'php/return_log.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("tipo_log=todo");    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4 && ajax.status==200) 
       {            
           $( "#admin_div_loading" ).dialog("close");
           $('#admin_loading_send').remove();  
           $('#admin_ventana_trabajo').append('<div class="titulos_ventanas">Consulta Registro de Hoy</div><br><br>');
           var xml=ajax.responseXML;
           build_log_table(xml);                                                
       }
    }
    
}


/*
 * Consulta Personalizada de Log
 * Por usuario, tipo de movimiento, fecha, etc
 */
function consulta_personalizada_log()
{
    $('#admin_ventana_trabajo').html('');
//    $('#consola_administracion').css( "width","600px" );$('#consola_administracion').css( "height","300px" );/* Tamaño estandar */
//    $('#consola_administracion').css( "height","800px" );
//    $('#consola_administracion').css( "width","1000px" );    
    
    $('#admin_ventana_trabajo').append('<div class="titulos_ventanas">Consulta Personalizada de Registro</div>');
    $('#admin_ventana_trabajo').append('<br>Usuario: <select id="select_usuarios_admin">\n\
    <option value="0">Todos los usuarios</option></select>');/* Select Usuario*/
    get_usuarios();
    $('#admin_ventana_trabajo').append('Documento: <select id="select_tipo_doc_admin">\n\
    <option value="todos">Todos los documentos</option>\n\
    <option value="Recibo de Nómina">Recibos de Nómina</option>\n\
    <option value="Factura Cliente">Facturas de Cliente</option>\n\
    <option value="Factura Proveedor">Facturas de Proveedor</option></select>');/* Select */    
    $('#admin_ventana_trabajo').append('Fecha de Consulta: <input type="text" id="date_consola_admin" readonly>   '); /* input date */
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
    $('#date_consola_admin').val(today);/* Fecha del input date */
    
    $('#admin_ventana_trabajo').append('<br><input type="checkbox" name="check_todo" id="check_todo" value="1" onchange="check_all()" checked>Seleccionar todo   ');
    $('#admin_ventana_trabajo').append('<br><input type="checkbox" name="check_login" id="check_login" value="1" onchange="check_mark()" checked>Entrada al Sistema   ');
    $('#admin_ventana_trabajo').append('<input type="checkbox" name="check_busqueda" id="check_busquedas" value="1" onchange="check_mark()" checked>Búsquedas   ');
    $('#admin_ventana_trabajo').append('<input type="checkbox" name="check_consulta" id="check_consulta" value="1" onchange="check_mark()" checked>Consultas de Documentos   ');
    $('#admin_ventana_trabajo').append('<input type="checkbox" name="check_mail" id="check_mail" value="1" onchange="check_mark()" checked>Envió de Mails   ');
    $('#admin_ventana_trabajo').append('<br><input type="checkbox" name="check_cargas" id="check_cargas" value="1" onchange="check_mark()" checked>Carga de Documentos   ');
    $('#admin_ventana_trabajo').append('<input type="checkbox" name="check_update" id="check_update" value="1" onchange="check_mark()" checked>Actualización de Documento   ');
        $('#admin_ventana_trabajo').append('<input type="checkbox" name="check_alta_user" id="check_alta_user" value="1" onchange="check_mark()" checked>Acerca de Usuarios   ');
    $('#admin_ventana_trabajo').append('<br><br>');
//    $('#admin_ventana_trabajo').append('<br><center><input type="button" id="consulta_person_consola" class="boton_admin" value="Consultar" style="cursor: pointer" onclick="consulta_personalizada()"></center>');
$( "#consola_administracion" ).dialog( "option", "buttons", [
    {
        text: "Consultar",
        click: function() { consulta_personalizada(); }
    }
] );

    $.datepicker.regional['es'] = {
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
    $.datepicker.setDefaults($.datepicker.regional['es']);
    $('#date_consola_admin').datepicker({
        defaultDate: "+1w",
        dateFormat:'yy/mm/dd',
        navigationAsDateFormat:true,
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 3,
        yearRange: "2000:"+now.getFullYear() 
    })      
}
/* Selección de todos los CheckBox */
function check_all()
{
    var marcado = $('#check_todo:checked').val();

    if(marcado==1)
        {
            $('#check_login').prop('checked', true);
            $('#check_busquedas').prop('checked', true);
            $('#check_consulta').prop('checked', true);
            $('#check_mail').prop('checked', true);
            $('#check_alta_user').prop('checked',true);
            $('#check_cargas').prop('checked', true);
            $('#check_update').prop('checked', true);
        }
    
}
/* Si se desmarca un checkbox, el check todo se desmacar */
function check_mark()
{
//    var marcado = $(check).prop("checked") ? true : false;
    
    var check_login=$('#check_login:checked').val();
    var check_busqueda=$('#check_busquedas:checked').val();
    var check_consulta=$('#check_consulta:checked').val();
    var check_mail=$('#check_mail:checked').val();
    var check_alta_user=$('#check_alta_user').val();
    var check_cargas=$('#check_cargas:checked').val();
    var check_update=$('#check_update:checked').val();
    
    if(check_login==1 && check_busqueda==1 && check_consulta==1
    && check_mail==1 && check_alta_user==1 && check_cargas==1 && check_update==1)
        {
            $('#check_todo').prop('checked', true);
        }
    else
        {
            $("#check_todo").prop("checked", "");
        }
    
   
    
    
    if(!marcado)
        {
            $("#check_todo").prop('checked', true);
        }
}

/* Trae consigo el resultado de la búsqueda personalizada por el usuario */
function consulta_personalizada()
{
    $( "#admin_div_loading" ).dialog({closeOnEscape:false,position:"center",open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}});
    $("#admin_div_loading").siblings('div.ui-dialog-titlebar').remove();/* Borra barra de título */
    
        
    var usuario=$('#select_usuarios_admin').val();
    var documento=$('#select_tipo_doc_admin').val();
    var fecha=$('#date_consola_admin').val();
    var check_login=$('#check_login:checked').val();
    var check_busqueda=$('#check_busquedas:checked').val();
    var check_consulta=$('#check_consulta:checked').val();
    var check_mail=$('#check_mail:checked').val();
    var check_alta_user=$('#check_alta_user').val();
    var check_cargas=$('#check_cargas:checked').val();
    var check_update=$('#check_update:checked').val();
    
    ajax=objetoAjax();
    ajax.open("POST", 'php/return_log.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send('tipo_log=avanzado'+'&id_login='+usuario+'&documento='+documento+'&fecha='+fecha+'&check_busqueda='+check_busqueda+'&check_consulta='+check_consulta+'&check_mail='+check_mail+'&check_cargas='+check_cargas+'&check_login='+check_login+'&check_update='+check_update+'&check_alta_user='+check_alta_user);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState===4 && ajax.status===200) 
       {      
           /* Se cierra dialog loading  */
           $( "#admin_div_loading" ).dialog("close");   
           var xml=ajax.responseXML;
           var root=xml.getElementsByTagName("Error");
           if(root.length>0)
           {
               dialog_information();
               $('#dialog_information').html('');
             for(cont=0; cont<root.length; cont++)
             {                 
                 var mensaje=root[cont].getElementsByTagName("error")[0].childNodes[0].nodeValue;          
                 $('#dialog_information').dialog('option', 'title', 'Error al actualizar datos de usuario');  
                 $('#dialog_information').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<br><p>'+mensaje+'</p>');                                              
                 ('#div_tabla_registros').remove();
             } 
           }
           else
           {
                build_log_table(xml);     
           }           
       }
    }
}

/*
 * Regresa y llena el select_usuarios_admin de la función consulta_personalizada()
 */
function get_usuarios()
{
    ajax=objetoAjax();
    ajax.open("POST", 'php/return_log.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("get_users=1");    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState===4 && ajax.status===200) 
       {      
           var xml=ajax.responseXML;          
           var root=xml.getElementsByTagName("Usuario")       
             for (i=0;i<root.length;i++) 
             { 
                 var id_login =root[i].getElementsByTagName("id_login")[0].childNodes[0].nodeValue;
                 var nombre_usuario=root[i].getElementsByTagName("nombre_usuario")[0].childNodes[0].nodeValue;             
                 var nombre=root[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
                 var apellido_paterno=root[i].getElementsByTagName("apellido_paterno")[0].childNodes[0].nodeValue;             
                 var apellido_materno=root[i].getElementsByTagName("apellido_materno")[0].childNodes[0].nodeValue;
                 document.getElementById('select_usuarios_admin').options[i+1]=new Option('('+nombre_usuario+') '+nombre+' '+apellido_paterno+' '+apellido_materno, id_login);
             }      
       }
    }
}

/*
 * Construcción de la tabla que contiene el listado de registros del día de hoy
 */
function build_log_table(xml)
{       
    $('#div_tabla_registros').remove();
    $('#admin_ventana_trabajo').append('<div id="div_tabla_registros"></div>');
    
      var tabla =document.createElement("table");
       tabla.setAttribute("id", "tabla_log");
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
       th1.innerHTML="Nombre de Usuario";
       tr.appendChild(th1);
       th2.innerHTML="Empresa";
       tr.appendChild(th2);
       th3.innerHTML="Movimiento";
       tr.appendChild(th3);
       th4.innerHTML="Documento";
       tr.appendChild(th4);    
       th5.innerHTML="Tipo de Documento";
       tr.appendChild(th5); 
       th6.innerHTML="Descripción";
       tr.appendChild(th6);
       th7.innerHTML="Fecha y Hora";
       tr.appendChild(th7);
       
       thead.appendChild(tr);       
       tabla.appendChild(thead);
       
      var root=xml.getElementsByTagName("Registro")    
     for (i=0;i<root.length;i++) 
     {                 
        var tr1 = document.createElement("tr");
//        
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        var td6 = document.createElement("td");
        var td7 = document.createElement("td");
        
        
         var clave=root[i].getElementsByTagName("clave")[0].childNodes[0].nodeValue;
         var id_login =root[i].getElementsByTagName("id_login")[0].childNodes[0].nodeValue;                  
         var nombre_usuario=root[i].getElementsByTagName("nombre_usuario")[0].childNodes[0].nodeValue;    
         var nombre_empresa=root[i].getElementsByTagName("nombre_empresa")[0].childNodes[0].nodeValue;   
         var accion=root[i].getElementsByTagName("accion")[0].childNodes[0].nodeValue;
         var nombre_archivo=root[i].getElementsByTagName("nombre_archivo")[0].childNodes[0].nodeValue;
         var tipo_comprobante=root[i].getElementsByTagName("tipo_comprobante")[0].childNodes[0].nodeValue;
         var descripcion=root[i].getElementsByTagName("descripcion")[0].childNodes[0].nodeValue;              
         var fecha=root[i].getElementsByTagName("fecha")[0].childNodes[0].nodeValue;                  
         
         
         td1.innerHTML = nombre_usuario;
         td2.innerHTML = nombre_empresa;
         td3.innerHTML = accion;
         td4.innerHTML=nombre_archivo;
         td5.innerHTML=tipo_comprobante;  
         td6.innerHTML=descripcion; 
         td7.innerHTML=fecha;                
         
         tr1.appendChild(td1);	        
         tr1.appendChild(td2);	
         tr1.appendChild(td3);
         tr1.appendChild(td4);
         tr1.appendChild(td5);
         tr1.appendChild(td6);	
         tr1.appendChild(td7);
         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);  
         
     }        

      $('#div_tabla_registros').append(tabla);    
      
      formato_tabla_registro(tabla);
}

/* Formato de Tabla Jquery con Páginado */
function formato_tabla_registro(tabla)
{
    $(tabla).DataTable( 
        {            
//            "bJQueryUI": true,
		"sPaginationType": "full_numbers",
                "oLanguage": {
			"sLengthMenu": "Mostrar _MENU_ registros por página",
			"sZeroRecords": "No se encontraron resultados",
			"sInfo": "Mostrados _START_ de _END_ de _TOTAL_ registro(s)",
			"sInfoEmpty": "Mostrados 0 de 0 of 0 registros",
			"sInfoFiltered": "(Filtrando desde _MAX_ total registros)"
                            }
        } );
}