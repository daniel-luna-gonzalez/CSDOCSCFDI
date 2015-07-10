/*
 *Inicio de sesión del usuario
 */
/* global EnvironmentData, get_status */

var interval_status;

function login()
{
   var usuario = $('#form_user').val();
   var password = $('#form_password').val();
   var IdEnterprise = $('#SystemEnterprisesForm').val();
   var EnterpriseName = $('#SystemEnterprisesForm option:selected').html();
   
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Login.php",
    data: "option=Login&UserName="+usuario+"&Password="+password+'&IdEnterprise='+IdEnterprise+'&EnterpriseAlias='+EnvironmentData.EnterpriseAlias, 
    success:  function(xml)
    {   
        if($.type( xml )==='object'){Error(xml); return 0;}else xml=$.parseXML( xml );
        
        if($(xml).find('AccessDenied').length>0)
        {
            DeniedSystemStart();
                return 0;
        }
        $(xml).find('Login').each(function()
        {
            var UserName = $(this).find('UserName').text();
            var IdUser = $(this).find('IdUser').text();
            var IdEnterprise = $(this).find('IdEnterprise').text();
            var EnterpriseName = $(this).find('EnterpriseName').text();
            
            $('#id_usr').val(IdUser);            
            if(!(IdUser>0))
            {
                DeniedSystemStart();
                return 0;
            }

            StartSystem();

            $('<li><a href = "#">'+UserName+'</a></li>').insertAfter('#barra_sup_username');

            EnvironmentData.IdUser = IdUser;
            EnvironmentData.UserName = UserName;
            EnvironmentData.IdEnterprise = IdEnterprise;
            EnvironmentData.EnterpriseName = EnterpriseName;

            setTimeout(function() 
            {                        
                $('#dock_').css('display', 'block');
//                show_status_system(); /* Se inicializa la ventana de estado del sistema */
//                setInterval(get_status,8000);
            }, 4000);        
                
        });
        
        $(xml).find("Error").each(function()
        {            
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            DeniedSystemStart();
        });    
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
}

//function stop_interval_status()
//{
//     clearInterval(interval_status); 
//}

function begin_interval_status()
{
    
//    interval_status=setInterval(get_status,5000);
    setInterval(get_status,5000);
}


