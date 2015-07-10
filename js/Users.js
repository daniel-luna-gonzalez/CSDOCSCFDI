/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global OptionsDataTable, EnvironmentData, DatePicker */
var TableUserListdT, TableUserListDT;

var Users = function()
{
    var self = this;
    
    _NewUserForms = function()
    {
        $('#DivNewUserForms').remove();
        $('body').append('<div id = "DivNewUserForms"></div>');
        $('#DivNewUserForms').append('<div class="Loading" id = "LoadingIconNewUser"><img src="../img/loadinfologin.gif"></div>');
        $('#DivNewUserForms').dialog({title:"Nuevo Usuario", width:500, minWidth:400, Height:500, minHeight:400, modal:true, buttons:{
                Aceptar:{click:function(){_AddNewUser();}, text:"Aceptar"},
                Cancelar:{click:function(){$(this).remove();}, text:"Cancelar"}
        }});
    
        $('#DivNewUserForms').append('<table id = "NewUserTable">\n\
        <tr><td>Nombres</td><td><input type = "text" id = "NewUserNameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
        <tr><td>Apellido Paterno</td><td><input type = "text" id = "NewUserLastNameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
        <tr><td>Apellido Materno</td><td><input type = "text" id = "NewUserMLastNameForm" class = "StandardForm" FieldType = "VARCHAR" FieldLength = "45"> </td></tr>\n\
        <tr><td>Nombre Usuario (Sistema)</td><td><input type = "text" id = "NewUserSystemUsernameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"> </td></tr>\n\
        <tr><td>Password</td><td><input type = "password" id = "NewUserPasswordForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
        </table>');
        $('#LoadingIconNewUser').remove();
        
        var validator = new ClassFieldsValidator();
        validator.InspectCharacters($('#NewUserTable input'));
    };
    
    _AddNewUser = function()
    {
        var validator = new ClassFieldsValidator();
        var Validation = validator.ValidateFields($('#NewUserTable input'));        
        console.log(Validation);
        if(Validation===0)
            return;       
        
        var UserName = $('#NewUserNameForm').val();
        var LastName = $('#NewUserLastNameForm').val();
        var MLastName = $('#NewUserMLastNameForm').val();
        var SystemUsername = $('#NewUserSystemUsernameForm').val();
        var Password = $('#NewUserPasswordForm').val();
        
        if(!(Password.length>4))
        {
            validator.AddClassRequiredActive($('#NewUserPasswordForm'));
            $('#NewUserPasswordForm').attr('title','El Password debe ser mayor a 4 caracteres');
            return;
        }
        else
        {
            validator.RemoveClassRequiredActive($('#NewUserPasswordForm'));
            $('#NewUserPasswordForm').attr('title','');
        }
        
        $('#DivNewUserForms').append('<div class="Loading" id = "LoadingIconNewUser"><img src="../img/loadinfologin.gif"></div>');

        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Users.php",
        data: "option=NewUser&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&NewUsername='+UserName+'&LastName='+LastName+'&MLastName='+MLastName+'&SystemUsername='+SystemUsername+'&Password='+Password, 
        success:  function(xml)
        {   
            $('#LoadingIconNewUser').remove();
            if($.type( xml )==='object'){Error(xml); return 0;}else xml=$.parseXML( xml );
//            console.log(xml);
            $(xml).find('NewUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                $('#DivNewUserForms').remove();
                
                var IdUser = $(this).find('IdUser').text();
                var Username = $(this).find('UserName').text();
                var LastName = $(this).find('LastName').text();
                var MLastName = $(this).find('MLastName').text();
                var SystemUserName = $(this).find('SystemUsername').text();
                var DischargeDate = $(this).find('DischargeDate').text();
                
                var data = 
                [
                    SystemUserName,
                    Username,
                    LastName,
                    MLastName,
                    DischargeDate                    
                ];
                       
                var ai = TableUserListDT.row.add(data).draw();
                var n = TableUserListdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdUser);             
                
                TableUserListDT.$('tr.selected').removeClass('selected');
                $('#TableUserList tr[id="'+IdUser+'"]').addClass('selected');
            });
            
            $(xml).find('RepeatedUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
            });

            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
            });    
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });
    };
    
    _ConfirmDelete = function()
    {
        var IdUser = $('#TableUserList tr.selected').attr('id');
        var UserName = '';
        if(!IdUser>0)
        {
            Advertencia('<p>Debe Seleccionar un Usuario</p>');
            return 0;
        }
        
        $('#TableUserList tr[id='+ IdUser +']').each(function()
        {                
            var position = TableUserListdT.fnGetPosition(this); // getting the clicked row position  
            UserName = TableUserListdT.fnGetData(position)[0];
        });
        
        $('#ConfirmNewUser').remove();
        $( "body" ).append('<div id = "ConfirmNewUser"></div>');
        $( "#ConfirmNewUser" ).append('<p>¿Realmente desea eliminar a  <b>"'+UserName+'</b>"?</p>');
        $( "#ConfirmNewUser" ).dialog({height: 200, width:300,modal: true, closeOnEscape:false,title:'Mensaje de confirmación',
            buttons: {"Aceptar": function (){ $(this).remove(); _DeleteUser(IdUser);},"Cerrar": function (){$(this).remove();}}                          
        });
    };

    _DeleteUser = function(IdUser)
    {
        $('#WorkspaceAdmin').append('<center><img src="img/loading.gif" id="LoadingIconDeleteUser" title="Enviando correos" width="20" heigth="20"><center>');    

        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Users.php",
        data: "option=DeleteUser&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&DeleteIdUser='+IdUser, 
        success:  function(xml)
        {   
            $('#LoadingIconDeleteUser').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find('DeletedUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                TableUserListDT.row('tr[id='+IdUser+']').remove().draw( false );
                TableUserListdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
            });

            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                return 0;
            });    
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });
    };   
    
    _GetUserInfo = function(id)
    {
        
        var xml = 0;
        $.ajax({
        async:false, cache:false,dataType:"html", type: 'POST', url: "php/Users.php",
        data:{option:"GetUserInfo", EnterpriseAlias:EnvironmentData.EnterpriseAlias, IdUser:EnvironmentData.IdUser, EditIdUser:id},
        success:  function(response)
        {   
            if($.parseXML(response)===false){Error(response); return 0;}else xml = $.parseXML(response);

            if($(xml).find('UserInfo').length>0)
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
    
    _EditUser = function()
    {
        var IdUser = $('#TableUserList tr.selected').attr('id');
        if(!IdUser>0)
        {
            Advertencia('<p>Debe Seleccionar un Usuario</p>');
            return 0;
        }
        
        var UserXml = _GetUserInfo(IdUser);
        if($.isXMLDoc(UserXml))
            _DisplayUser(UserXml);
    };
    
    _DisplayUser = function(xml)
    {
        console.log(xml);
        $('#admin_edit_usuario').remove();
        $('body').append('<div id = "admin_edit_usuario"></div>');
        var IdUser = 0;
        $(xml).find('User').each(function()
        {
            IdUser = $(this).find('IdUser').text();
            var UserName = $(this).find('UserName').text();
            var Name = $(this).find('Name').text();
            var LastName = $(this).find('LastName').text();
            var MLastName = $(this).find('MLastName').text();
            var Password = $(this).find('Password').text();

            $( "#admin_edit_usuario" ).append('<div class = "titulos_ventanas">Información del usuario</div>');

            $( "#admin_edit_usuario" ).append('<table id = "EditUserTable">\n\
                <tr><td>Nombre</td><td><input type = "text" id = "EditUserNameForm" value = "'+Name+'" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
                <tr><td>Apellido Paterno</td><td><input type = "text" id = "EditUserLastNameForm" value = "'+ LastName +'" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
                <tr><td>Apellido Materno</td><td><input type = "text" id = "EditUserMLastNameForm" value = "'+MLastName +'" class = "StandardForm" FieldType = "VARCHAR" FieldLength = "45"> </td></tr>\n\
                <tr><td>Nombre Usuario (Sistema)</td><td><input type = "text" id = "EditUserSystemUsernameForm" value = "'+UserName+'" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"> </td></tr>\n\
                <tr><td>Password</td><td><input type = "password" id = "EditUserPasswordForm" value = "'+Password+'" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
            </table>');                                    
        });

        $( "#admin_edit_usuario" ).dialog({height: 400, minHeight:250, width:500, minWidth:400, modal: true,closeOnEscape:false,title:'Modificar Usuario',
            buttons: {"Actualizar": function (){_ConfirmModifyUser(IdUser);}, "Cancelar": function (){ $(this).dialog("close"); }}
        });
    };
       
    _ConfirmModifyUser = function(EditingIdUser)
    {
        $('#admin_confirmacion_modificar').remove();
        $('body').append('<div id = "admin_confirmacion_modificar"></div>');
        $('#admin_confirmacion_modificar').append('<p><h2>¿La información del usuario que va modificar es correcta?</h2></p>');
        $( "#admin_confirmacion_modificar" ).dialog(
            {height: 200,width:300, modal: true, closeOnEscape:false, title:'Mensaje de confirmación', close:function(){$(this).remove();},
                buttons: {"Aceptar": function (){$(this).dialog("close");_ModifyUser(EditingIdUser);},
                    "Cerrar": function (){$(this).dialog("close");}}                          
            });

    };
    /* Manda la nueva información del usuario para ser modificada */

    _ModifyUser = function(EditingIdUser)
    {
        var validator = new ClassFieldsValidator();
        var Validation = validator.ValidateFields($('#NewUserTable input'));        
        console.log(Validation);
        if(Validation===0)
            return;       
        
        var EditUserName = $('#EditUserSystemUsernameForm').val();
        var Name = $('#EditUserNameForm').val();
        var LastName = $('#EditUserLastNameForm').val();
        var MLastName = $('#EditUserMLastNameForm').val();
        var Password = $('#EditUserPasswordForm').val();
        
        if(!(Password.length>4))
        {
            validator.AddClassRequiredActive($('#NewUserPasswordForm'));
            $('#NewUserPasswordForm').attr('title','El Password debe ser mayor a 4 caracteres');
            return;
        }
        else
        {
            validator.RemoveClassRequiredActive($('#NewUserPasswordForm'));
            $('#NewUserPasswordForm').attr('title','');
        }
        
        $('#admin_edit_usuario').append('<div class="Loading" id = "LoadingIconEditUser"><img src="../img/loadinfologin.gif"></div>');
        
        var data = {option: "ModifyUser", EditingIdUser:EditingIdUser, Name:Name, LastName:LastName, MLastName:MLastName, EditUserName:EditUserName, Password:Password, IdUser:EnvironmentData.IdUser ,UserName: EnvironmentData.UserName, EnterpriseAlias: EnvironmentData.EnterpriseAlias };

        $.ajax({async:false, cache:false, dataType:"html", type: 'POST', url: "php/Users.php", data: data, 
        success:  function(xml)
        {   
            $('#LoadingIconEditUser').remove();
            console.log(xml);
            if($.parseXML( xml )===null){Error($.parseHTML(xml)); return 0;}else xml=$.parseXML( xml );

            $(xml).find('ModifyUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                
                TableUserListdT.$('tr.selected').each(function()
                {
                    var position = TableUserListdT.fnGetPosition(this); // getting the clicked row position
                    TableUserListdT.fnUpdate([EditUserName],position,0,false);
                    TableUserListdT.fnUpdate([Name],position,1,false);
                    TableUserListdT.fnUpdate([LastName],position,2,false);
                    TableUserListdT.fnUpdate([MLastName],position,3,false);                    
                });
                
                $('#admin_edit_usuario').remove();
                
            });


            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                return 0;
            });    
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });
    };
};

Users.prototype.DisplayUserList = function()
{
    var self = this;
    
    $('#WorkspaceAdmin').empty();
    $('#WorkspaceAdmin').append('<div class="Loading" id = "UsersLoading"><img src="../img/loadinfologin.gif"></div>');
    $('#WorkspaceAdmin').append('<div id="div_tabla_registros"></div>');

    $('#div_tabla_registros').append('<table id = "TableUserList" class = "display hover"></table>');
    $('#TableUserList').append('<thead><tr><th>Nombre Usuario</th><th>Nombre</th><th>Apellido Paterno</th><th>Apellido Materno</th><th>Fecha Alta</th></tr></thead>');
    
    var UserList = self.GetUserList();

    if($.type(UserList)!=='object')
    {
        $('#UsersLoading').remove();
        return;
    }
    
    TableUserListdT = $('#TableUserList').dataTable({
        "dom": 'lfTrtip',
         "tableTools": {
             "aButtons": [
                 {"sExtends":"text", "sButtonText": "Agregar", "fnClick" :function(){_NewUserForms();}},
                 {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){_EditUser();}},
                 {"sExtends":"text", "sButtonText": "Eliminar", "fnClick" :function(){_ConfirmDelete();}},
                 {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                 {
                     "sExtends":    "collection",
                     "sButtonText": "Guardar como...",
                     "aButtons":    [ "csv", "xls", "pdf" ]
                 }                    
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
        
        TableUserListDT = new $.fn.dataTable.Api('#TableUserList');
    //    TableUserListdT.fnSetColumnVis(0,false);

        $(UserList).find('User').each(function()
        {
            var id_login = $(this).find('IdUser').text();
            var nombre_usuario = $(this).find('UserName').text();
            var nombre = $(this).find('Name').text();
            var apellido_paterno = $(this).find('LastName').text();
            var apellido_materno = $(this).find('MLastName').text();
            var fecha_alta = $(this).find('RegistrationDate').text();

            var EditImg = '<img src = "img/edit_icon.png" style = "cursor:pointer" width = "40px" heigth = "40px" title = "Editar Usuario" onclick = "return_xml_info_admin('+id_login+')">';
            var DeleteImg = '<img src = "img/delete_icon.png" style = "cursor:pointer" width = "40px" heigth = "40px" title = "Elminar Usuario" onclick = "admin_confirmacion_delete('+id_login+',\''+nombre_usuario+'\')">';

            var data = 
           [
                nombre_usuario,
                nombre,
                apellido_paterno,
                apellido_materno,
                fecha_alta
           ];   

            var ai = TableUserListDT.row.add(data).draw();
            var n = TableUserListdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',id_login);                                          
        });

        $('#TableUserList tbody').on( 'click', 'tr', function ()
        {
            TableUserListDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');        
        } ); 
    
    $('#UsersLoading').remove();
    
    TableUserListdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
    
};
Users.prototype.GetUserList = function()
{        
    var xml = 0;
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Users.php",
    data: "option=UserList&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName, 
    success:  function(response)
    {   
        $('#loading_send').remove();
        if($.type( response )==='object'){Error(response); return 0;}else xml=$.parseXML( response );

        if($(xml).find('UserList').length>0)
            return xml;
        
        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            return 0;
        });    
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });
    
    return xml;
};

