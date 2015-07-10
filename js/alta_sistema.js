/*
 *  Este archivo .js da de alta al administrador por primera ves.
 *  Lanza los dialogs necesarios para el registro, abre las siguientes ventanas
 *  en orden.
 *  
 *  1.- Introducción del serial.
 *  2.- Registro de datos personales.
 *  3.- Configuración del correo.
 *  
 *  Si se tuvo éxito se regresa a la ventana de inicio para que el usuario inicie sesión
 */

/*
 *Texto al inicio invitando al usuario a se registre como administrador
 */
function comprobar_admins()
{
    ajax=objetoAjax();
    ajax.open("POST", 'php/exist_admin.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send();    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4) 
       { 
           var exist_admin=ajax.responseText;
           
           if(exist_admin==0)
               {
                   $('#user-avatar').hide();
                   $('#apple_logo_login2').hide();            
                    setTimeout(
                    function() 
                    {   
                       $('#bienvenida').html('');
                       $('#pageLogin').append('<div id="bienvenida"></div>');
                       $('#bienvenida').append('<center><img src="img/CSDocs.png" id="icon_csdocs_bienvenida" width="50%" heigth="20%"></center>');
                       $('#bienvenida').append('<p>Le damos la más cordial bienvenida a <b>CSDocs CFDI Caja de Seguridad</b></p>\n\
                        \n\
                        <p>Lo invitamos a que siga unos sencillos pasos para registrar el usuario administrador pulse <a href="#" onclick="registro_admin()">aquí</a> para continuar</p>');
                    },9000
                    );
                    $('#icon_csdocs_bienvenida').css({'position':'absolute','left':'50%','top':'50%'                
                    })                          
               }                            
        }
    }    
}

//Se da de alta un administrador por primera vez
function registro_admin()
{
    $('#bienvenida').hide();
    $('#pageLogin').append('<div id="registro_admin"><div id="serial"></div><div id="registro_admin_paso1"></div><div id="confirm_paso1"></div><div id="registro_admin_paso2"></div><div id="confirm_paso2"></div></div>');
    $('#registro_admin').css({'background':'url(img/gradient.png) no-repeat center,url(img/manos_galaxia.jpg)repeat left top #000'})
//    dialog_registro1();
//    dialog_registro2();
serial();
}
function serial()
{
    $('#serial').html('');
    $('#serial').append('<p>Ingrese el serial de su equipo Synology NAS</p>');
    $('#serial').append('<input type="text" id="form_serial">');    
     $('#serial').dialog(
       {
            height: 200,
            width:370,
            title:'Activación del producto',     
            closeOnEscape:false,
            open: function(event, ui) {
            $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();},
            buttons:{
                        "Aceptar": function() {                            
                            getMacAddress();
                        }
                    }
	}        
        );      
}
/*
 * Obtiene la MAC de la PC del usuario para dar de alta la NAS
 */
function getMacAddress()
{    
    ajax=objetoAjax();
    ajax.open("POST", 'php/getMac.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send();    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4) 
       { 
//           alert(ajax.responseText);       
            var mac=ajax.responseText;
            mac=mac.toUpperCase(); 
            ckeck_serial(mac);            
       }      
    }   
}
function ckeck_serial(mac)
{   
var serial= $('#form_serial').val();
//$("#serial").append("Mac="+mac);
jQuery.ajax({
            url: "http://www.cs-docs.com/ActivaApp/Serial.php?serial="+serial+"&mac="+mac,
            data: "ajaxCrossParam=1",
            type: "GET",
            dataType: "jsonp",
            success: function(data)
            {       
//                $("#serial").append("<p>MAC antes de enviar:" +mac + ".</p>");
//                $("#serial").append("<p>Serial:" + data.serial + ".</p>");
//                $("#serial").append("<p>Find serial: " + data.find_serial + ".</p>");
//                $("#serial").append("<p>Find mac: " + data.find_mac + ".</p>");
//                $("#serial").append("<p>Notif Mac: "+data.notif_mac + ".</p>");
//                $("#serial").append("<p>find_mac_notif: " + data.find_mac_notif + ".</p>");

//                $("#serial").append("<p>response_text: " + data.response_text + ".</p>");
//                $("#serial").append("<p>response_value: " + data.response_value + ".</p>");  
                var text=data.response_text;
                var value=data.response_value;
                if(value==1)
                    {
                        $( '#serial' ).dialog( "close" );
                        dialog_registro1();
                    }
                if(value==0)
                    {
                        if($('#label_serial_alert').length==0)
                            {
                                $("#serial").append('<label id="label_serial_alert"><font color="red"><p>'+text+'</p></font></label>');
                            }                        
                    }
            }});
}

//Registro de datos personales
function dialog_registro1()
{
    
    $( "#registro_admin_paso1" ).html("");
    //Dentro de la ventana de registro se crean primero dos divs para separar texto y formularios
    $( "#registro_admin_paso1" ).append('<div width="90%" heigth="80%" id="fra1"></div>');
    
    //Formularios y texto dentro del cuadro de dialogo
//    $('#fra1').css({'position':'absolute','left':'0%','top':'5%','font-size':'16px','font-family':'Verdana,Arial,sans-serif','margin':'.5em 0 0 0'});
//    $('#fra2').css({'position':'absolute','left':'30%','top':'5%'});
    $( "#fra1" ).addClass('fra1');
    $( "#fra1" ).append('<p><h2>Ingrese los datos solicitdos.</h2></p><br>');
    $( "#fra1" ).append('<label>Nombre(s):</label>');
    $( "#fra1" ).append('<input type = "text" id="fra_nombre" class="fra1_nombre">');
    $( "#fra1" ).append('<br><label>Apellido Materno:</label>');
    $( "#fra1" ).append('<input type = "text" id="fra_apellido_p">');
    $( "#fra1" ).append('<br><label>Apellido Paterno:</label>');
    $( "#fra1" ).append('<input type = "text" id="fra_apellido_ma">');
    $( "#fra1" ).append('<br><label>Fecha de Nac:</label>');
    $( "#fra1" ).append('<input type = "date" id="fra_fecha_nac">');
    $( "#fra1" ).append('<br><label>Curp:</label>');
    $( "#fra1" ).append('<input type = "text" id="fra_curp">');
    $( "#fra1" ).append('<p><br><b>Ingrese el nombre de usuario que desee que aparezca en el sistema</b><br></p>');
    $( "#fra1" ).append('<br><label>Nombre de Usuario:</label>');
    $( "#fra1" ).append('<input type = "text" id="fra_usuario" placeholder="p.e. Daniel0313">');
//    $( "#fra1" ).append('<br><label>Correo electrónico:</label>');
//    $( "#fra1" ).append('<input type = "text" id="fra_correo">');
    $( "#fra1" ).append('<br><br><b>Seleccione una constraseña mayor a 6 caracteres (sin utilizar espacios ni caracteres especiales p.e. !"#$%&/()=_-*[]{}+</b><br>');
    $( "#fra1" ).append('<br><label>Contraseña:</label>');
    $( "#fra1" ).append('<input type = "password" id="fra_password1" onkeyup="valid(this)">');
    $( "#fra1" ).append('<br><label>Repita su contraseña:</label>');
    $( "#fra1" ).append('<input type = "password" id="fra_password2" onkeyup="valid(this)">');
//    $( "#fra1" ).append('<img src="img/atras.png" id="fra1_atras" width="30px" height="30px" alt="Siguiente">');
//    $( "#fra1" ).append('<img src="img/adelante.png" id="fra1_adelante" width="30px" height="30px" title="siguiente" onclick="comprobar_paso1();" style="cursor: pointer">');
    $( "#fra1" ).append('<input type="button" id="fra1_btn_fin" value="Finalizar" style="cursor: pointer" onclick="comprobar_paso1();">');

    $( "#registro_admin_paso1" ).dialog(
       {
            height: 500,
            width:500,
            title:'Registro de Administrador',
            open: function(event, ui) {
            $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();},
            closeOnEscape:false
//            modal: true,                  
	}        
        );            
}
/*
 * Se analizan los datos personales introducidos por el susuario
 */
function comprobar_paso1()
{
    var nombre=$('#fra_nombre').val();
    var apellido_paterno=$('#fra_apellido_paterno').val();
    var apellido_materno=$('#fra_apellido_materno').val();
    var fra_fecha_nac=$('#fra_fecha_nac').val(); 
    var fra_curp=$('#fra_curp').val(); 
    var fra_usuario=$('#fra_usuario').val();
//    var fra_correo=$('#fra_correo').val();
    var fra_password1=$('#fra_password1').val();
    var fra_password2=$('#fra_password2').val();
    
    if(nombre=="")
        {
            if($('#p_fra_nombre').length==0)
                {
                    $('<font color="red"><p id="p_fra_nombre">Campo obligatorio</p></font>').insertAfter('#fra_nombre');                    
                }
        }
        else{$('#p_fra_nombre').remove();}            
        if(apellido_paterno=="")
        {
            if($('#p_fra_apellido_paterno').length==0)
                {
                    $('<font color="red"><p id="p_fra_apellido_paterno">Campo obligatorio</p></font>').insertAfter('#fra_apellido_paterno');
                }            
        }
        else{$('#p_fra_apellido_paterno').remove();}    
        if(fra_fecha_nac=="")
        {
            if($('#p_fra_fecha_nac').length==0)
                {
                    $('<font color="red"><p id="p_fra_fecha_nac">Campo obligatorio</p></font>').insertAfter('#fra_fecha_nac');
                }            
        } 
        else{$('#p_fra_fecha_nac').remove();}
        if(fra_curp=="")
        {
            if($('#p_fra_curp').length==0)
                {
                    $('<font color="red"><p id="p_fra_curp">Campo obligatorio</p></font>').insertAfter('#fra_curp');
                }            
        } 
        else{$('#p_fra_curp').remove();}
        if(fra_usuario=="")
        {
            if($('#p_fra_usuario').length==0)
                {
                    $('<font color="red"><p id="p_fra_usuario">Campo obligatorio</p></font>').insertAfter('#fra_usuario');
                }
            
        }
        else{$('#p_fra_usuario').remove();}
//        if(fra_correo=="")
//        {
//            if($('#p_fra_correo').length==0)
//                {
//                    $('<font color="red"><p id="p_fra_correo">Campo obligatorio</p></font>').insertAfter('#fra_correo');
//                }
//            
//        }
//        else{$('#p_fra_correo').remove();}
        if(fra_password1=="")
        {
            if($('#p_fra_password1').length==0)
                {
                    $('<font color="red"><p id="p_fra_password1">Campo obligatorio</p></font>').insertAfter('#fra_password1');
                }            
        } 
        else{$('#p_fra_password1').remove();}
        if(fra_password2=="")
        {
            if($('#p_fra_password2').length==0)
                {
                    $('<font color="red"><p id="p_fra_password2">Campo obligatorio</p></font>').insertAfter('#fra_password2');
                }            
        }
        else{$('#p_fra_password2').remove();}          
        
    if(nombre!="" && apellido_paterno!="" && fra_fecha_nac!="" && fra_curp!="" && fra_usuario!="")
        {
            if(fra_password1==fra_password2 && fra_password1!="" && fra_password2!="" && fra_password1.length>=6 && fra_password2.length>=6)
            {               
                //Datos correctos               
                        $('#p_fra_password1').remove();
                        $('#p_fra_password2').remove();
                        $('#p2').remove();
                        $('#p3').remove();       
                        $('#p1').remove();    
                        confirm_paso1();
            }                             
                        
                    //Cuando las contraseñas son menores a 6 caracteres
            if(fra_password1.length<6 || fra_password1.length<6 && fra_password1==fra_password2)
                {
                    if($('#p2').length==0)
                        {
                            $('<font color="red"><p id="p2">La contraseña debe ser mayor a 6 caracteres</p></font>').insertAfter('#fra_password1');                            
                        }
                }
            else
                {
                        $('#p2').remove();
                }
            if(fra_password1.length<6 || fra_password1.length<6 && fra_password1==fra_password2)
                {
                 if($('#p3').length==0)
                        {                 
                            $('<font color="red"><p id="p3">La contraseña debe ser mayor a 6 caracteres</p></font>').insertAfter('#fra_password2');
                        }
                }
                else
                {
                        $('#p3').remove();
                }

                
            //Cuando las contraseñas no coinciden
            if(fra_password1!=fra_password2)
                {
                    if($('#p1').length==0)
                    {
                        $('<font color="red"><p id="p1">Las contraseñas no coinciden</p></font>').insertAfter('#fra_password1');
                        $( "#fra1" ).append('<font color="red"><p id="p1">Las contraseñas no coinciden</p></font>');
                    }  
                }
                else
                    {
                        $( "#p1" ).remove();
                    }
        }
        
        //Si las contraseñas son menores a 6 caracteres        
        if(fra_password1.length<6)
                {
                    if($('#p2').length==0)
                        {
                            $('<font color="red"><p id="p2">La contraseña debe ser mayor a 6 caracteres</p></font>').insertAfter('#fra_password1');                            
                        }
                }
            else
                {
                        $('#p2').remove();
                }
            if(fra_password1.length<6)
                {
                 if($('#p3').length==0)
                        {                 
                            $('<font color="red"><p id="p3">La contraseña debe ser mayor a 6 caracteres</p></font>').insertAfter('#fra_password2');
                        }
                }
            else
            {
                    $('#p3').remove();
            }
            
}    
//Script para validar los campos de contraseña
    var r={'special':/[\W]/g};
    function valid(o){
        o.value = o.value.replace(r['special'],'');
    }
    
    function confirm_paso1()
    {
        $('#confirm_paso1').html('');
        $('#confirm_paso1').append('<p><h2>Su información esta a punto de ser almacenada, ¿Es correcta?</h2></p>')
        $('#confirm_paso1').dialog(
       {
            height: 150,
            width:300,
            title:'Mensaje de Confirmación',
            closeOnEscape:false,
            modal: true,      
            buttons:{
                        "Si": function() {                                                       
                            $( this ).dialog( "close" );
                            insert_admin(); 
                            $('#registro_admin_paso1').dialog("close");
                        },
                        "Cancelar": function() {
                                $( this ).dialog( "close" );
                        }
                    }
	}        
        );      
    }
   /*
    * Se insertan los datos personales del usuario en la BD (Paso 1)
    * Nos devuelve el id del administrador insertado.
    */         
function insert_admin()
{
    var fra1_nombre=$('#fra_nombre').val();
    var fra_apellido_p=$('#fra_apellido_p').val();
    var fra_apellido_ma=$('#fra_apellido_ma').val();
    var fra_fecha_nac=$('#fra_fecha_nac').val();
    var fra_curp=$('#fra_curp').val();
    var fra_usuario=$('#fra_usuario').val();
    var fra_password1=$('#fra_password1').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/insert_admin.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    ajax.send("nombre="+fra1_nombre+"&apellido_p="+fra_apellido_p+"&apellido_m="+fra_apellido_ma
        +"&fecha_nac="+fra_fecha_nac+"&curp="+fra_curp+"&usuario="+fra_usuario+"&password="+fra_password1);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4) 
       { 
           var id_admin=ajax.responseText;
           dialog_registro2(id_admin);
       }       
    }
}

function dialog_registro2(id_admin)
{    
    $( "#registro_admin_paso2" ).html("");
    $( "#registro_admin_paso2" ).append('<div width="90%" heigth="80%" id="fra2"></div>');
    
    $( "#fra2" ).addClass('fra1');  
   $( "#fra2" ).append('<p><br>Escriba su usuario de correo electrónico p.e. <b>usuario</b>@servidor.com lo que\n\
    debe de ingresar es lo que se encuentra resaltado únicamente</p><br>');

    $( "#fra2" ).append('<br><label>Título que será visto por los destinatarios al recibir sus correos</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_nombre" placeholder="p.e. Ing. Roberto Rios">')
    $( "#fra2" ).append('<br><label id="l_usuario">usuario:</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_usuario" placeholder="usuario">')
    $( "#fra2" ).append('<label id="l_a">@</label>');
    $( "#fra2" ).append('<select onchange="select_correo();" id="fra2_select_correo"> <option value="hotmail">Hotmail</option>\n\
    <option value="yahoo">Yahoo</option>\n\
    <option value="gmail">Gmail</option>\n\
    <option value="live">Live</option>\n\
    <option value="otro">Otro...</option></select>');
    $( "#fra2" ).append('<label id="l_com">.com</label>');
    $( "#fra2" ).append('<br><label>Contraseña:</label>');
    $( "#fra2" ).append('<input type = "password" id="fra2_password1" placeholder="usuario">')
    
    //Configuración de correo SMTP
    $( "#fra2" ).append('<p id="p1_fra2"><br>Ingrese la siguiente información solicitada para configurar su correo POP</p><br>');
    $( "#fra2" ).append('<label id="l1">Correo</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_correo" placeholder="correo@servidor.com">')
    $( "#fra2" ).append('<br><label id="l2">Contraseña</label>');
    $( "#fra2" ).append('<input type = "password" id="fra2_password2" placeholder="password">');
    $( "#fra2" ).append('<br><label id="l3">Host</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_smpt" placeholder="SMTP">');
    $( "#fra2" ).append('<br><label id="l4">Seguridad</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_seguridad" placeholder="p.e. SSL">');
    $( "#fra2" ).append('<br><label id="l5">Puerto</label>');
    $( "#fra2" ).append('<input type = "text" id="fra2_puerto">');
    
    $( "#p1_fra2" ).hide();
   $( "#l1" ).hide();
   $( "#l2" ).hide();
   $( "#l3" ).hide();
   $( "#l4" ).hide();
   $( "#l5" ).hide();
   $( "#fra2_correo" ).hide();
   $( "#fra2_password2" ).hide();
   $( "#fra2_smpt" ).hide();
   $( "#fra2_seguridad" ).hide();
   $( "#fra2_puerto" ).hide(); 
    
//    $( "#fra2" ).append('<img src="img/atras.png" href="#" title="retroceder" id="fra1_atras" style="cursor: pointer">')
    $( "#fra2" ).append('<input type="button" id="fra2_btn_fin" value="Finalizar" style="cursor: pointer" onclick="confirm_paso2('+id_admin+');">');
    
    $( "#registro_admin_paso2" ).dialog(
       {
            height: 500,
            width:500,
            closeOnEscape:false,
            title:'Configuración de Correo',
            open: function(event, ui) {
            $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();},
//            modal: true,                  
	}        
        );      
}
/*
 * Combo select Correo
 */
function select_correo()
{
   var correo=$('#fra2_select_correo').val();
   if(correo=='otro')
       {           
        $('#l_usuario').hide();
        $('#fra2_usuario').hide();
        $('#fra2_password1').hide();
        $( "#p1_fra2" ).show();
        $( "#l1" ).show();
        $( "#l2" ).show();
        $( "#l3" ).show();
        $( "#l4" ).show();
        $( "#l5" ).show();
        $( "#fra2_correo" ).show();
        $( "#fra2_password2" ).show();
        $( "#fra2_smpt" ).show();
        $( "#fra2_seguridad" ).show();
        $( "#fra2_puerto" ).show();                                           
       }
       else
       {
           $('#l_usuario').show();
           $('#fra2_usuario').show();
           $('#fra2_password1').show();
           $( "#p1_fra2" ).hide();
           $( "#l1" ).hide();
           $( "#l2" ).hide();
           $( "#l3" ).hide();
           $( "#l4" ).hide();
           $( "#l5" ).hide();
           $( "#fra2_correo" ).hide();
           $( "#fra2_password2" ).hide();
           $( "#fra2_smpt" ).hide();
           $( "#fra2_seguridad" ).hide();
           $( "#fra2_puerto" ).hide(); 
       }    
}

function confirm_paso2(id_empleado)
    {
        
        $('#confirm_paso1').html('');
        $('#confirm_paso1').append('<p><h2>Su información esta a punto de ser almacenada, ¿Es correcta?</h2></p>')
        $('#confirm_paso1').dialog(
       {
            height: 150,
            width:300,
            title:'Mensaje de Confirmación',
            closeOnEscape:false,
            modal: true,            
            buttons:{
                        "Si": function() {
                            $( this ).dialog( "close" );
                            $('#registro_admin_paso2').append('<center><img src="img/loading.gif" title="Espere por favor" width="50" heigth="50"></center>');
                            comprobar_correo(id_empleado);   
                        
                        },
                        "Cancelar": function() {
                                $( this ).dialog( "close" );
                        }
                    }
	}        
        );      
    }
    
   

// Se muestran los datos introducidos por el usuario durante el registro

function comprobar_correo(id_empleado)
{
    var id=id_empleado;
    var nombre=$('#fra2_nombre').val();
    var usuario=$('#fra2_usuario').val();    
    var correo_comun=$('#fra2_select_correo').val();
    var password_comun=$('#fra2_password1').val();
    var servidor_comun=$('#fra2_correo').val();
    var password_person=$('#fra2_password2').val();
    var smtp=$('#fra2_smpt').val();
    var seguridad=$('#fra2_seguridad').val();
    var puerto=$('#fra2_puerto').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/comprobar_mail.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    ajax.send("nombre="+nombre+"&usuario="+usuario+"&correo_comun="+correo_comun
        +"&password_comun="+password_comun+"&correo_empresa="+servidor_comun
        +"&password_empresa="+password_person+"&smtp="+smtp
        +"&seguridad="+seguridad+"&puerto="+puerto);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4) 
       {            
           var xml=ajax.responseXML;          
           var root=xml.getElementsByTagName("Mail")
           var tipo =root[0].getElementsByTagName("tipo")[0].childNodes[0].nodeValue;
           var mensaje=root[0].getElementsByTagName("mensaje")[0].childNodes[0].nodeValue;
           if(tipo==0)
               {
                   confirm_mail(mensaje,"img/Alert.png");
               }
           if(tipo==1)
               {
                   insert_mail(id);
                   confirm_mail(mensaje,"img/success.png");                   
                   $('#registro_admin_paso2').dialog("close");
                   location.reload();                   
               }           
       }       
    }
}
 function confirm_mail(mensaje,imagen)
    {
        $('#confirm_paso1').html('');
        $('#confirm_paso1').append('<center><img src="'+imagen+'" width="50" heigth="50"></center>')
        $('#confirm_paso1').append('<p><h2>'+mensaje+'</h2></p>')
        $('#confirm_paso1').dialog(
       {
            height: 200,
            width:300,
            title:'Mensaje de Confirmación',
            modal: true,     
            closeOnEscape:false,
            buttons:{                        
                        "Ok": function() {
                                $( this ).dialog( "close" );                                
                        }
                    }
	}        
        );      
    }
    
    /*
     * La información del mail es insertado en la BD después de la comprobación del mismo
     */
    function insert_mail(id_empleado)
    {
        var id=id_empleado;
    var nombre=$('#fra2_nombre').val();
    var usuario=$('#fra2_usuario').val();    
    var correo_comun=$('#fra2_select_correo').val();
    var password_comun=$('#fra2_password1').val();
    var servidor_comun=$('#fra2_correo').val();
    var password_person=$('#fra2_password2').val();
    var smtp=$('#fra2_smpt').val();
    var seguridad=$('#fra2_seguridad').val();
    var puerto=$('#fra2_puerto').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/Insert_mail.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    ajax.send("id="+id+"&nombre="+nombre+"&usuario="+usuario+"&correo_comun="+correo_comun
        +"&password_comun="+password_comun+"&correo_empresa="+servidor_comun
        +"&password_empresa="+password_person+"&smtp="+smtp
        +"&seguridad="+seguridad+"&puerto="+puerto);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState==4) 
       { 
           $( "#registro_admin_paso2" ).append(ajax.responseText);
           
       }       
    }
    }


