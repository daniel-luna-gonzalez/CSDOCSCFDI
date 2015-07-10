/*
 * Muestra el resultado de las búsquedas realizadas en cada uno de los correos registrados
 * para extraer sus comprobantes localizados en la bandeja de entrada
 */
/*
 * @parametro: String -> exito, invalido, repetido, desconocido
 * depende del parametro es el listado que devuelve
 */

/* global OptionsDataTable, EnvironmentData, Process */

var ActiveEmailsdT,ActiveEmailsDT;

var TableMCValidosdT, TableMCValidosDT;
var TableMCInvalidosdT, TableMCInvalidosDT;
var TableMCRepetidosdT, TableMCRepetidosDT;

var TableResultExtractiondT, TableResultExtractionDT;

var ventana_resultado={draggable:false,modal:true,maxHeigth:600,heigth:400, width:300,closeOnEscape:false,resizable:false, title:'Mensaje inesperado...', buttons: { "Aceptar": function (){ $(this).dialog("close");  }   }};

  var AnchoPantalla = $(window).width();
  var AnchoDialogMotor = AnchoPantalla * .80;
  var AltoPantalla = $(window).height();
  var AltoDialogMotor = AltoPantalla * 0.80;

$(document).ready(function()
{
   $('#icono_motor_correo') .click(function()
   {
       $('#div_listado_motor_validos').empty();
       $('#div_listado_motor_repetidos').empty();
       $('#div_listado_motor_invalidos').empty();
       mostrar_dialog_motor_correos();
   });
   
   /* Acciones al pulsar sobre las pestañas del dialog para el llenado de las tablas cuando este vacio el div */
   $('#li_div_listado_motor_validos').click(function()
   {
       var emptyTest = $('#div_listado_motor_validos').is(':empty');
       if(emptyTest){get_list_motor_correos('valido');}
   });
   $('#li_div_listado_motor_repetidos').click(function()
   {
       var emptyTest = $('#div_listado_motor_repetidos').is(':empty');
       if(emptyTest){get_list_motor_correos('repetido');}
   });
   $('#li_div_listado_motor_invalidos').click(function()
   {
       var emptyTest = $('#div_listado_motor_invalidos').is(':empty');
       if(emptyTest){get_list_motor_correos('invalido');}
   });
});

function mostrar_dialog_motor_correos()
{
    get_list_motor_correos('valido');
    $.fn.tabbedDialog = function () {
            this.tabs({active: 0});
            this.dialog({height: AltoDialogMotor,width:AnchoDialogMotor, modal: true,closeOnEscape:false,buttons: { "Cerrar": function() { $(this).dialog("close"); } } });
            this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
            this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
            this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
            var tabul = this.find('ul:first');
            this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
            this.siblings('.ui-dialog-titlebar').remove();
//            tabul.addClass('ui-dialog-titlebar');
        };
        $('#div_motor_correos').tabbedDialog();

}

function get_list_motor_correos(opcion_lista_motor)
{
    $( "#admin_div_loading" ).append('<div id="mensaje_div_loading"></div>');
    $('#mensaje_div_loading').append('<p>Comprobando Buzón por favor espere, este proceso podría durar varios minutos</p>');
    $( "#admin_div_loading" ).dialog({modal:true,closeOnEscape:false,position:"center",open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}});
    $("#admin_div_loading").siblings('div.ui-dialog-titlebar').remove();/* Borra barra de título */            

   $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/mail.php",
        data: "opcion=get_list_motor&opcion_lista_motor="+opcion_lista_motor, 
        success:  function(xml)
        {            
            $('#mensaje_div_loading').remove();
            $('#admin_div_loading').dialog('close');    
            $('#ventana_resultado').empty();            

            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );
        
            $('#div_listado_motor_validos').empty();
            crear_tabla_listado_motor_correo(opcion_lista_motor,xml);
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });       
   
}

function crear_tabla_listado_motor_correo(tipo_lista,xml)
{
    var id_tabla='tabla_listado_motor_'+tipo_lista;
    var id_div='';
    if(tipo_lista==='valido'){id_div="#div_listado_motor_validos"; }
    if(tipo_lista==='repetido'){id_div="#div_listado_motor_repetidos";}
    if(tipo_lista==='invalido'){id_div="#div_listado_motor_invalidos";}
    
    $(id_div).empty();
    
    $(id_div).append('<table id = "'+id_tabla+'" class = "display hover"><thead><tr><th>Emisor</th><th>Receptor</th><th>Correo</th><th>Monto Factura</th><th>Folio</th><th>Fecha</th><th>Estatus</th><th>Acciones</th></tr></thead><tbody></tbody></table>');
    
    var TableTd, TableTD;
    
    if(tipo_lista==='valido')
    {
        TableMCValidosdT = $("#"+id_tabla).dataTable(OptionsDataTable);
        TableMCValidosDT = new $.fn.dataTable.Api("#"+id_tabla);
        TableTd = TableMCValidosdT;
        TableTD = TableMCValidosDT;
    }
    if(tipo_lista==='invalido')
    {
        TableMCInvalidosdT = $("#"+id_tabla).dataTable(OptionsDataTable);
        TableMCInvalidosDT = new $.fn.dataTable.Api("#"+id_tabla);
        TableTd = TableMCInvalidosdT;
        TableTD = TableMCInvalidosDT;
    }
    if(tipo_lista==='repetido')
    {
        TableMCRepetidosdT = $("#"+id_tabla).dataTable(OptionsDataTable);        
        TableTD = TableMCRepetidosDT = new $.fn.dataTable.Api("#"+id_tabla);
        TableTd = TableMCRepetidosdT;
        TableTD = TableMCRepetidosDT;
    }
    
    $(xml).find("Listado").each(function()
    {
        var id_motor = $(this).find('id_motor').text();          
         var emisor = $(this).find('emisor').text();          
         var receptor = $(this).find('receptor').text();          
         var emisor_correo = $(this).find('emisor_correo').text();          
         var monto_factura = $(this).find('monto_factura').text();          
         var folio = $(this).find('folio').text();          
         var fecha_factura = $(this).find('fecha_factura').text();          
         var estatus = $(this).find('estatus').text();          
         var ruta_xml = $(this).find('ruta_xml').text();          
         var ruta_pdf = $(this).find('ruta_pdf').text();          
         
        var acciones;
        acciones = '<img src = "img/delete_icon.png" title = "Eliminar Registro" style = "cursor:pointer" width = "30px" height="30px" onclick = "eliminar_registro_motor(\''+id_motor+'\',\''+tipo_lista+'\')">\n\
                    <img src = "img/folder_xml.png" title = "Vista Previa del xml" style = "cursor:pointer" width = "30px" height="30px" onclick = "_ShowXmlPreview(\'proveedor\',\''+ruta_xml+'\')">';
        if(ruta_pdf!='S/PDF')
            acciones+='<img src = "img/pdf_icon.png" title = "Vista Previa PDF" style = "cursor:pointer" width = "30px" height="30px" onclick = "vista_revia_pdf_historico(\''+ruta_pdf+'\')">';
        
        var Data = [emisor,receptor,emisor_correo,monto_factura,folio,fecha_factura,estatus,   acciones
         ];
         
         var ai = TableTD.row.add(Data).draw();
         var n = TableTd.fnSettings().aoData[ ai[0] ].nTr;
         n.setAttribute('id',id_motor);
    });       
}

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

/*
 * Borra una fila del listado de resultado de la extracción de correos
 */


function eliminar_registro_motor(id_motor,tipo_lista)
{   
        
//    var id_tabla='tabla_listado_motor_'+tipo_lista;   

    
    $( "#admin_div_loading" ).append('<div id="mensaje_div_loading"></div>');
    $( "#admin_div_loading" ).dialog({modal:true,closeOnEscape:false,position:"center",open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}});
    $("#admin_div_loading").siblings('div.ui-dialog-titlebar').remove();/* Borra barra de título */ 
    
    
    ajax=objetoAjax();
    ajax.open("POST", 'php/mail.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("opcion=eliminar_registro_motor&id_registro_motor="+id_motor);
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState===4 && ajax.status===200) 
       {
           $('#mensaje_div_loading').remove();
            $('#admin_div_loading').dialog('close');    
            $('#ventana_resultado').empty();
            if(ajax.responseXML==null)
            {$('#ventana_resultado').append(ajax.responseText);$('#ventana_resultado').dialog(ventana_resultado);return;}
            var xml=ajax.responseXML;
            var root=xml.getElementsByTagName("EliminarRegistro");  
//            $('#ventana_resultado').dialog();
            for (i=0;i<root.length;i++) 
            { 
                var estado =root[i].getElementsByTagName("estado")[0].childNodes[0].nodeValue;
                var mensaje=root[i].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
                if(estado==1)
                {
                    efecto_notificacion(mensaje,"Registro Eliminado");
                    
                    var div_listado="div_listado_motor_"+tipo_lista;
                    $(div_listado).empty();
                    get_list_motor_correos(tipo_lista);
//                    $('#ventana_resultado').dialog('option', 'title', 'Registro eliminado con éxito');
//                    $('#ventana_resultado').append('<p><center><img src="img/success.png" title="carga carga pdf" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');

                }   
                else
                {             
                    efecto_notificacion(mensaje,"Error al eliminar el registro");
//                    $('#ventana_resultado').dialog('option', 'title', 'Error al elminar registro');  
//                    $('#ventana_resultado').append('<p><center><img src="img/Alert.png" title="error" width="40" heigth="40"></center></p>'+'<p>'+mensaje+'</p>');
                }                                                
            }
            
       }
   };
}

/*
 * 
 * @param {type} id_correo
 * @param {type} servidor
 * @param {type} host_imap
 * @param {type} puerto
 * @param {type} correo
 * @param {type} password
 * @returns {undefined}
 * 
 * Realiza la descarga de correos y retorna un XML con el detalle de descargas e inserciones realizadas
 */
function motor_correo_descarga(id_correo,servidor,host_imap,puerto,correo,password)
{
    $( "#admin_div_loading" ).dialog({modal:true,position:"center",open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}});
    $("#admin_div_loading").siblings('div.ui-dialog-titlebar').remove();/* Borra barra de título */
    var id_usuario_sistema=$('#id_usr').val();   /* Log */
    var nombre_usuario=$('#form_user').val();
    var parametros="opcion=motor_descarga_correo&id_usuario="+id_usuario_sistema+"&nombre_usuario="+nombre_usuario+"&id_correo="+id_correo+"&servidor="+servidor+"&host="+host_imap+'&puerto='+puerto+'&correo='+correo+'&password='+password;
       
    $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/mail.php",
        data: parametros, 
        success:  function(xml)
        {            
            $('#admin_div_loading').dialog('close');    
            $('#ventana_resultado').empty();

            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );
            
            crear_tabla_resultado_descarga(xml);            
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#admin_div_loading').dialog('close');    Error(textStatus +"<br>"+ errorThrown);}
        });       
}

function crear_tabla_resultado_descarga(xml)
{
    $('#div_resultado_descarga_correo').empty();    
    $('#div_resultado_descarga_correo').append('<div class = "titulos_ventanas">Resultado</div><br><br>');
    $('#div_resultado_descarga_correo').append('<table id = "TableExtractionResult" class = "display hover"><thead><tr><th>Emisor</th><th>Receptor</th><th>Correo</th><th>Monto Factura</th><th>Folio</th><th>Fecha Factura</th><th>Estatus</th><th>Acciones</th></tr></thead></table>');
    
    TableResultExtractiondT = $("#TableExtractionResult").dataTable(OptionsDataTable);
    TableResultExtractionDT = new $.fn.dataTable.Api("#TableExtractionResult");
    
    $(xml).find("DescargaCorreo").each(function()
    {
        var id_motor = $(this).find('id_motor').text();         
        var emisor = $(this).find('nombre_emisor').text();           
        var receptor = $(this).find('nombre_receptor').text();
        var emisor_correo = $(this).find('emisor_correo').text();
        var monto_factura = $(this).find('total_factura').text();
        var folio = $(this).find('folio_factura').text();              
        var fecha_factura = $(this).find('fecha_factura').text();         
        var estatus = $(this).find('estatus').text();
        var ruta_xml = $(this).find('ruta_xml').text();
        var ruta_pdf = $(this).find('ruta_pdf').text();
                   
        var acciones;
        acciones = '\n\
                    <img src = "img/folder_xml.png" title = "Vista Previa del xml" style = "cursor:pointer" width = "30px" height="30px" onclick = "obtener_copia_cfdi(\'proveedor\',\''+ruta_xml+'\')">';
        if(ruta_pdf!='S/PDF')
            acciones+='<img src = "img/pdf_icon.png" title = "Vista Previa PDF" style = "cursor:pointer" width = "30px" height="30px" onclick = "vista_revia_pdf_historico(\''+ruta_pdf+'\')">';               
        
         var Data = [emisor,receptor,emisor_correo,monto_factura,folio,fecha_factura,estatus,acciones];
         
         var ai = TableResultExtractionDT.row.add(Data).draw();
         var n = TableResultExtractiondT.fnSettings().aoData[ ai[0] ].nTr;
         n.setAttribute('id',id_motor);
    });
    
    $('#div_resultado_descarga_correo').dialog({height: AltoDialogMotor,width:AnchoDialogMotor, title:"Resultado de Escaneo de correo electrónico", modal: true,closeOnEscape:false,buttons: { "Cerrar": function() { $(this).dialog("close"); } } });         
       
}

var EmailEngine = function()
{
    var self = this;
    
    _NewCommonEmailForms = function()
    {        
        $('#DivNewEmailForms').empty();
        $('#DivNewEmailForms').append('\
        <table id = "NewCommonEmailTable">\n\
            <tr>\n\
                <td>Nombre de Usuario</td><td><input type = "text" id = "NewCommonEmailNameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td>\n\
                <td>\n\
                    @<select  id="NewCommonEmailServerForm" class = "StandardForm required" FieldType = "Text"> <option value="hotmail">Hotmail</option>\n\
                        <option value="yahoo">yahoo.com</option>\n\
                        <option value="gmail">gmail.com</option>\n\
                        <option value="live">live.com</option>\n\
                        <option value="otro">Otro...</option>\n\
                    </select></p>\n\
                </td>\n\
            </tr>\n\
            <tr><td>Password</td><td><input type = "password" id = "NewEmailPasswordForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>\n\
            <tr><td>Título a mostrar</td><td><input type = "text" id = "NewCommonEmailTitleForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>\n\
        </table>');
        
        $('#NewCommonEmailServerForm').css({width:100});
        $('#NewCommonEmailServerForm').change(function()
        {
            var server = $(this).val();
            if(server==='otro')
                _NewCompanyEmailForms();
        });            
        
        var validator = new ClassFieldsValidator();
        validator.InspectCharacters($('#NewCommonEmailTable input:not([type="checkbox"])'));
    };
    
    _GetCommonEmailData = function(Email)
    {        
        var IdEmail = $(Email).find('Email').find('IdEmail').text();
        var UserNameEmail = $('#NewCommonEmailNameForm').val();
        var EmailServer = $('#NewCommonEmailServerForm').val();
        var Password = $('#NewEmailPasswordForm').val();
        var EmailTitle = $('#NewCommonEmailTitleForm').val();
        var PreviousEmailName = $(Email).find('Email').find('User').text();
        PreviousEmailName = PreviousEmailName.split('@');
        PreviousEmailName = PreviousEmailName[0];
        var data = 
        {
            option:'CheckEmail',EnterpriseAlias:EnvironmentData.EnterpriseAlias, 
            IdEmail:IdEmail, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName,
            EmailType:"CommonEmail", UserNameEmail:UserNameEmail, 
            EmailServer:EmailServer, Password:Password, EmailTitle:EmailTitle
        };
        console.log(PreviousEmailName+"   "+UserNameEmail);
        if(PreviousEmailName!==UserNameEmail)
            data.FlagModifiedEmailName = true;
        else
            data.FlagModifiedEmailName = false;
        
        return data;
    };
    
    _NewCompanyEmailForms = function()
    {
        $('#DivNewEmailForms').empty();
        $('#DivNewEmailForms').append('\
        <p>Correo tipo empresarial <input type = "checkbox" id = "EnterpriseEmailCheck" checked></p>\
        <table id = "NewEnterpriseEmailTable" class = "display hover">\n\
        <tr><td>Nombre de Usuario</td><td><input type = "text" id = "NewCompanyEmailNameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>\n\
        <tr><td>Password</td><td><input type = "password" id = "NewCompanyEmailPasswordForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>\n\
        <tr><td>Título a mostrar</td><td><input type = "text" id = "NewCompanyEmailTitleForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>\n\
        <tr><td>SMTP</td><td><input type = "text" id = "NewCompanyEmailSmtpForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "100"></td></tr>\n\
        <tr><td>Puerto (SMTP)</td><td><input type = "text" id = "NewCompanyEmailSmtpPortForm" value = "26" class = "StandardForm required" FieldType = "INT" FieldLength = ""></td></tr>\n\
        <tr><td>Autenticación</td><td><input type = "checkbox" id = "NewCompanyEmailSmtpAuthForm" checked></td></tr>\n\
        <tr><td>Seguridad SMTP (cifrado)</td>\n\
            <td>\n\
                <select id = "NewCompanyEmailSmtpSecureForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "10">\n\
                <option value = "">Ninguno</option>\n\\n\
                <option value = "ssl">SSL</option>\n\\n\
                <option value = "tls">TLS</option>\n\
                </select>\n\
            </td>\n\
        </tr>\n\
        <tr><td>Imap</td><td><input type = "text" id = "NewCompanyEmailImapForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "100"></td></tr>\n\
        <tr><td>Puerto</td><td><input type = "text" id = "NewCompanyEmailImapPortForm" value = "143" class = "StandardForm required" FieldType = "INT" FieldLength = ""></td></tr>\n\
        <tr>\n\
            <td>Seguridad IMAP (Cifrado)</td>\n\
            <td>\n\
                <select id = "NewEmailImapSecureForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "10">\n\
                <option value = "">Ninguno</option>\n\\n\
                <option value = "ssl">SSL</option>\n\\n\
                <option value = "tls">TLS</option>\n\
                </select>\n\
            </td>\n\
        </tr>\n\
        </table>');
        
        $('#EnterpriseEmailCheck').change(function(){_NewCommonEmailForms();});
        
        var validator = new ClassFieldsValidator();
        validator.InspectCharacters($('#NewEnterpriseEmailTable input:not([type="checkbox"])'));
        
    };
    
    _GetEnterpriseEmailData = function(Email)
    {
        var IdEmail = $(Email).find('Email').find('IdEmail').text();
        var UserNameEmail = $('#NewCompanyEmailNameForm').val();
        var EmailPassword = $('#NewCompanyEmailPasswordForm').val();
        var EmailTitle = $('#NewCompanyEmailTitleForm').val();
        var Smtp = $('#NewCompanyEmailSmtpForm').val();
        var SmtpPort = $('#NewCompanyEmailSmtpPortForm').val();
        var SmtpAuth = $('#NewCompanyEmailSmtpAuthForm').is(':checked');
        var SmtpSecure = $('#NewCompanyEmailSmtpSecureForm').val();
        var Imap = $('#NewCompanyEmailImapForm').val();
        var ImapPort = $('#NewCompanyEmailImapPortForm').val();
        var ImapSecure = $('#NewEmailImapSecureForm').val();
        
        var PreviousEmailName = $(Email).find('Email').find('User').text();                
        
        var data = {
            option:'CheckEmail',EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName,
            IdEmail:IdEmail, UserNameEmail:UserNameEmail, EmailPassword:EmailPassword, Smtp:Smtp, SmtpPort:SmtpPort, 
            SmtpAuth: SmtpAuth, SmtpSecure:SmtpSecure, Imap:Imap, ImapPort:ImapPort, ImapSecure:ImapSecure,
            EmailTitle:EmailTitle, EmailType: "EnterpriseEmail"
        };
        
        if(PreviousEmailName!==UserNameEmail)
            data.FlagModifiedEmailName = true;
        else
            data.FlagModifiedEmailName = false;
                
        return data;
    };
    
    _NewEmailPanel = function()
    {
        $('#DivNewEmailForms').remove();
        $('body').append('<div id = "DivNewEmailForms"></div>');
        
        _NewCommonEmailForms();
        
        $('#DivNewEmailForms').dialog({title:"Agregar nuevo correo", width:500, height:450, minWidth:300, minHeight:250, modal:true, closeOnEscape:false, buttons:{
                Aceptar:{text:"Aceptar", click:function(){_New();}},
                Cancelar:{text:"Cancelar", click:function(){$(this).remove();}}
        }});
    };
    
    _New = function()
    {
        var status = false;
        var xml = 0;
        var data, EmailData;
        
        var validator = new ClassFieldsValidator();
        var Validation;
        if($('#NewEnterpriseEmailTable').length>0)
            Validation = validator.ValidateFields($('#NewEnterpriseEmailTable input:not([type="checkbox"])'));   
        else if($('#NewCommonEmailTable').length>0)
            Validation = validator.ValidateFields($('#NewCommonEmailTable input:not([type="checkbox"])'));   
        
        console.log(Validation);
        if(Validation===0)
            return;       
        
        if($('#NewEnterpriseEmailTable').length>0)
            EmailData = _GetEnterpriseEmailData();
        else if($('#NewCommonEmailTable').length>0)
            EmailData = _GetCommonEmailData();
        
        $('#DivNewEmailForms').append('<div class="Loading" id = "LoadingIconNewEmail"><img src="../img/loadinfologin.gif"></div>');

        data = EmailData;
        
        $.ajax({
        async:false, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",                
        data:data, 
        success:  function(response)
        {           
            $('#LoadingIconNewEmail').remove();
            if($.parseXML( response )===null){Error(response); xml = 0; return 0;}else xml=$.parseXML( response );
            
            $(xml).find('Duplicated').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
            });
            
            $(xml).find('NewEmail').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                var IdEmail = $(this).find('IdEmail').text();
                var UserNameEmail = $(this).find('UserNameEmail').text();
                var Check = '<input type = "checkbox">';
                var array = 
                [
                     UserNameEmail,
                     Check
                ];   

                var ai = ActiveEmailsDT.row.add(array).draw();
                var n = ActiveEmailsdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdEmail);
                
                ActiveEmailsdT.find('tr[id="'+IdEmail+'"]').click();
                
                $('#DivNewEmailForms').remove();
            });
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
            });   
            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
        
        return status;
    };                    
    
    _ConfirmDeleteEmail = function()
    {
        var IdEmail = $('#ActiveEmailsTable tr.selected').attr('id');
        var UserNameEmail = undefined;
        
        if(!(IdEmail)>0)
        {
            Advertencia('<p>Debe seleccionar una cuenta de correo electrónico</p>');
            return;
        }        
        
        $('#ActiveEmailsTable tr.selected').each(function()
        {
            var position = ActiveEmailsdT.fnGetPosition(this); // getting the clicked row position  
            UserNameEmail = ActiveEmailsdT.fnGetData(position)[0];
        });
        
        $('#DivConfirmDeleteEmail').remove();
        $('body').append('<div id = "DivConfirmDeleteEmail"></div>');
        $('#DivConfirmDeleteEmail').append('<p>Esta a punto de eliminar el correo electrónico <b>'+UserNameEmail+'</b>. ¿Desea continuar?</p>');
        $('#DivConfirmDeleteEmail').dialog({title:"Mensaje de Confirmación", width:250, minWidth:200, Height:250, minHeight:200, modal:true, buttons:{
                Cancelar:{text:"Cancelar", click:function(){$(this).remove();}},
                Aceptar: {text:"Aceptar", click:function(){$(this).remove(); _Delete();}}
            }               
        });
    };
    
    _Delete = function()
    {
        var IdEmail = $('#ActiveEmailsTable tr.selected').attr('id');
        var UserNameEmail = undefined;
        
        $('#ActiveEmailsTable tr.selected').each(function()
        {
            var position = ActiveEmailsdT.fnGetPosition(this); // getting the clicked row position  
            UserNameEmail = ActiveEmailsdT.fnGetData(position)[0];
        });
        
        $.ajax({
            async:false, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",
            data:{option:'DeleteEmail',EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName, IdEmail:IdEmail, UserNameEmail:UserNameEmail}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

                $(xml).find('DeletedEmail').each(function()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);
                    ActiveEmailsDT.row('tr[id='+IdEmail+']').remove().draw( false );
                    ActiveEmailsdT.find('tbody tr:eq(0)').click();
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    xml = 0;
                });   

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });  
    };
      
    _GetEmail = function(IdEmail)
    {
        var xml = 0;
        
        $.ajax({
            async:false, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",
            data:{option:'GetEmail',EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName, IdEmail:IdEmail}, 
            success:  function(response)
            {           
                if($.parseXML( response )===null){Error(response); xml = 0; return 0;}else xml=$.parseXML( response );

                if($(xml).find('Email').length>0)
                    return xml;

                $(xml).find("Error").each(function()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    xml = 0;
                });   

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });  
        
        return xml;
    };
    
    _SetCommonEmailValues = function(Email)
    {
        $(Email).find('Email').each(function()
        {           
            var UserNameEmail = $(this).find('User').text();
            var User = UserNameEmail.split('@');
            $('#NewCommonEmailNameForm').val(User[0]);           
            var EmailServerName =  $(this).find('EmailServerName').text();
            $('#NewCommonEmailServerForm option[value="'+EmailServerName+'"]').attr("selected", "selected");
             $('#NewCommonEmailServerForm').prop('disabled', 'disabled');
            var Password = $(this).find('Password').text();
            $('#NewEmailPasswordForm').val(Password);
            var EmailTitle = $(this).find('Title').text();
            $('#NewCommonEmailTitleForm ').val(EmailTitle);
        });
    };
    
    _SetCompanyEmailValues = function(Email)
    {
        $(Email).find('Email').each(function()
        {
            var UserNameEmail = $(this).find('User').text();
            $('#NewCompanyEmailNameForm').val(UserNameEmail);
            var EmailPassword = $(this).find('Password').text();
            $('#NewCompanyEmailPasswordForm').val(EmailPassword);
            var EmailTitle = $(this).find('Title').text();
            $('#NewCompanyEmailTitleForm').val(EmailTitle);
            var Smtp = $(this).find('Smtp').text();
            $('#NewCompanyEmailSmtpForm').val(Smtp);
            var SmtpPort = $(this).find('SmtpPort').text();
            $('#NewCompanyEmailSmtpPortForm').val(SmtpPort);
            var SmtpAuth = $(this).find('SmtpAuth').text();
            if(SmtpAuth==='true' || SmtpAuth === true)
                $('#NewCompanyEmailSmtpAuthForm').prop('checked', true);
            var SmtpSecure = $(this).find('SmtpSecure').text();
            $('#NewCompanyEmailSmtpSecureForm option[value="'+SmtpSecure+'"]').attr("selected", "selected");
            var Imap = $(this).find('Imap').text();
            $('#NewCompanyEmailImapForm').val(Imap);
            var ImapPort = $(this).find('ImapPort').text();
            $('#NewCompanyEmailImapPortForm').val(ImapPort);
            var ImapSecure = $(this).find('ImapSecure').text();
            $('#NewEmailImapSecureForm option[value="'+ImapSecure+'"]').attr("selected", "selected");
        });
    };
    
    _Edit = function()
    {
        var IdEmail = $('#ActiveEmailsTable tr.selected').attr('id');
        var UserNameEmail = undefined;
        
        if(!(IdEmail)>0)
        {
            Advertencia('<p>Debe seleccionar una cuenta de correo electrónico</p>');
            return;
        }   
        
        $('#ActiveEmailsTable tr.selected').each(function()
        {
            var position = ActiveEmailsdT.fnGetPosition(this); // getting the clicked row position  
            UserNameEmail = ActiveEmailsdT.fnGetData(position)[0];
        });
        
        var Email = _GetEmail(IdEmail);
        
        if(!$.isXMLDoc(Email))
            return 0;
                
        _NewEmailPanel(); /* Se utiliza el mismo panel de Agregar nuevo correo */
        
        var EmailType = $(Email).find('EmailInfo').find('Email').find('EmailType').text();
        
        if(EmailType==='Enterprise')
        {
            _NewCompanyEmailForms();
            _SetCompanyEmailValues(Email);
        }
        else if(EmailType==='Common')
        {
            _NewCommonEmailForms();
            _SetCommonEmailValues(Email);
        }            
        else
            return;                
        
        var Buttons = {
            Cancelar:{text:"Cancelar", click:function(){$(this).remove();}},
            Modificar:{text:"Modificar", click:function(){_ModifyEmail(EmailType, Email);}}
        };
        
        $('#DivNewEmailForms').dialog('option', 'buttons', Buttons);
        $('#DivNewEmailForms').dialog('option', 'title', "Editar información");
    };       
    
    _ModifyEmail = function(EmailType, Email)
    {
        var data;
        if(EmailType==='Enterprise')
            data = _GetEnterpriseEmailData(Email);
        else if(EmailType==='Common')
            data = _GetCommonEmailData(Email);
        else
            return;
        
        $('#DivNewEmailForms').append('<div class="Loading" id = "LoadingIconModifyEmail"><img src="../img/loadinfologin.gif"></div>');
       
        data.option = "ModifyEmail";
                
        $.ajax({
            async:false, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",                
            data:data, 
            success:  function(xml)
            {           
                $('#LoadingIconModifyEmail').remove();
                if($.parseXML( xml )===null){Error(xml); xml = 0; return 0;}else xml=$.parseXML( xml );

                $(xml).find('Duplicated').each(function()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);
                });

                $(xml).find('ModifiedEmail').each(function()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);
                    var IdEmail = $(this).find('IdEmail').text();
                    var UserNameEmail = $(this).find('UserNameEmail').text();

                    ActiveEmailsdT.$('tr.selected').each(function()
                    {
                        var position = ActiveEmailsdT.fnGetPosition(this); // getting the clicked row position
                        ActiveEmailsdT.fnUpdate([UserNameEmail],position,0,false);                 
                    });

                    $('#DivNewEmailForms').remove();
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    xml = 0;
                });   

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });  
    };
    
    /* Se construye un xml con los correos a explorar */
    
    _DownloadCFDIs = function()
    {
        var IdEmail = $('#ActiveEmailsTable tr.selected').attr('id');
        var UserNameEmail = undefined;
        var Xml = '<?xml version="1.0" encoding="UTF-8"?><DownloadCFDIs>';
        
        if(!(IdEmail)>0)
        {
            Advertencia('<p>Debe seleccionar una cuenta de correo electrónico</p>');
            return;
        }   
        
        $('#ActiveEmailsTable tr').each(function()
        {
            var position = ActiveEmailsdT.fnGetPosition(this); // getting the clicked row position  
            var IdEmail = $(this).attr('id');
            var UserNameEmail = ActiveEmailsdT.fnGetData(position)[0];
            if((parseInt(IdEmail))>0)
            {
                var check = $(this).find('td input[type="checkbox"]');  /* Sobre cada fila se selecciona solo el checkbox */
                if($(check).is(':checked'))
                {
                    Xml+="<Email>\n\
                            <IdEmail>"+IdEmail+"</IdEmail>\n\
                            <UserNameEmail>"+UserNameEmail+"</UserNameEmail>\n\
                          </Email>";
                }                
            }          
        });
        
        Xml+="</DownloadCFDIs>";
        
        var ObjectXml = $.parseXML(Xml);
        
        if(!($(ObjectXml).find('Email').length>0))
        {
            Advertencia("<p>Debe seleccionar al menos un elemento</p>");
            return;
        }
               
        $('#WorkspaceAdmin').append('<div class="Loading" id = "LoadingIconDownloadingEmail"><img src="../img/loadinfologin.gif"></div>');

        
        var data = {
            option:"DownloadCFDIs", EnterpriseAlias:EnvironmentData.EnterpriseAlias, 
            IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName, Xml:Xml
        };
        
        $.ajax({
            async:true, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",                
            data:data, 
            success:  function(xml)
            {           
                $('#LoadingIconDownloadingEmail').remove();
                if($.parseXML( xml )===null){Error(xml); xml = 0; return 0;}else xml=$.parseXML( xml );

                $(xml).find("DownloadCFDIs").each(function()
                {
                    var Mensaje = $(this).find("Mensaje").text();
                    Notificacion(Mensaje);
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    xml = 0;
                });   
            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });  
    };
        
};

EmailEngine.prototype.GetActiveEmails = function()
{
    var xml = 0;
    
    $.ajax({
        async:false, cache:false, dataType:"html", type: 'POST',url: "php/EmailEngine.php",
        data:{option:'GetActiveEmails',EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, UserName:EnvironmentData.UserName}, 
        success:  function(response)
        {           
            if($.parseXML( response )===null){Error(response); xml = 0; return 0;}else xml=$.parseXML( response );
            
            if($(xml).find('ActiveEmails').length>0)
                return xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
            });   
            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
    
    return xml;
};

EmailEngine.prototype.BuildChartActiveEmails = function()
{
    var self = this;
    $('#WorkspaceAdmin').empty();
    $('#ActiveEmailsTable').remove();
    $('#WorkspaceAdmin').append('<table id = "ActiveEmailsTable" class = "display hover"><thead><tr><th>Correo</th><th></th></tr></thead></table>');
    
    ActiveEmailsdT = $("#ActiveEmailsTable").dataTable({
        "dom": 'lfTrtip',
         "tableTools": {
             "aButtons": [
                 {"sExtends":"text", "sButtonText": "Agregar", "fnClick" :function(){_NewEmailPanel();}},
                 {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){_Edit();}},
                 {"sExtends":"text", "sButtonText": "Eliminar", "fnClick" :function(){_ConfirmDeleteEmail();}},
                 {"sExtends":"text", "sButtonText": "Descarga de CFDI's", "fnClick" :function(){_DownloadCFDIs();}}
//                 {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
//                 {
//                     "sExtends":    "collection",
//                     "sButtonText": "Guardar como...",
//                     "aButtons":    [ "csv", "xls", "pdf" ]
//                 }                    
             ]
         },
         "autoWidth" : false,
         "oLanguage":
         {
             "sLengthMenu": "Mostrar _MENU_ registros por página",
             "sZeroRecords": "No se encontraron resultados",
             "sInfo": "Mostrados _START_ de _END_ de _TOTAL_ registro(s)",
             "sInfoEmpty": "Mostrados 0 de 0 of 0 registros",
             "sInfoFiltered": "(Filtrando desde _MAX_ total registros)"
         }            
    });
    
    $('div.DTTT_container').css({"margin-top":"1em"});
    $('div.DTTT_container').css({"float":"left"});
    
    ActiveEmailsDT = new $.fn.dataTable.Api("#ActiveEmailsTable");
    
    $('#ActiveEmailsTable tbody').on( 'click', 'tr', function ()
    {
        ActiveEmailsDT.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');        
    }); 
    
    var ActiveMails = self.GetActiveEmails();
    
    $(ActiveMails).find('Email').each(function()
    {
        var IdEmail = $(this).find('IdEmail').text();
        var EmailUser = $(this).find('User').text();
        var Check = '<input type = "checkbox">';
        
        var data = 
        [
            EmailUser,
            Check
        ];   

        var ai = ActiveEmailsDT.row.add(data).draw();
        var n = ActiveEmailsdT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',IdEmail);     
    });
    
    ActiveEmailsdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
};