/* global OptionsDataTable, DatePicker, EnvironmentData */
var AdminUsersdT, AdminUsersDT;
$(document).ready(function()
{
    $('.LinkDisplayUsers').click(function()
    {
        var ClassUSersManager = new UsersManager();
        ClassUSersManager.DisplayAdminUsers();
    });
});

var UsersManager = function()
{
    var self = this;
    _DisplayAdminUsers = function()
    {
        $('#admin_ventana_trabajo').append('<div class="Loading" id = "UsersAdminLoading"><img src="../img/loadinfologin.gif"></div>');
        var xml = 0;
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Users.php",
        data: "option=DisplayAdminUsers&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName, 
        success:  function(response)
        {   
            $('#UsersAdminLoading').remove();
            if($.type(xml)==='object'){Error(response); return 0;}else xml=$.parseXML( response );
            
            if($(xml).find('AdminUsers').length>0)
                return xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
                return 0;
            });                            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown); $('#NewEnterprise').remove();}
        });
        
        return xml;
    };
    
    _EditUser = function()
    {
//        var IdEnterprise = $('#TableAdminUsers tr.selected').attr('id');
        var EnterpriseAlias;
        
        if(!($('#TableAdminUsers tr.selected').length>0))
        {
            Advertencia("Debe seleccionar un usuario");
            return ;
        }
        
        $('#TableAdminUsers tr.selected').each(function()
        {                
            var position = AdminUsersdT.fnGetPosition(this); // getting the clicked row position  
            EnterpriseAlias = AdminUsersdT.fnGetData(position)[0];
        }); 
        
        $('#DivEditAdminUser').remove();
        $('body').append('<div id = "DivEditAdminUser"></div>');
        $('#DivEditAdminUser').dialog({title:"Usuario Administrador de "+EnterpriseAlias, width:500, height:300, minHeight:300, minWidth:400, modal:true, close:function(){$(this).remove();}, buttons:{
        Aceptar:{click:function(){_ModifyAdminUser();}, text:"Aceptar"}, Cancelar:{click:function(){$(this).remove();}, text:"Cancelar"}}
        });
        
        var AdminUserInfo = _GetAdminUserInfo(EnterpriseAlias);
//        console.log(AdminUserInfo);
        if($.type(AdminUserInfo)!=='object')
            return;
        
        var Password = $(AdminUserInfo).find('Password').text();
        
        $('#DivEditAdminUser').append('<table>\n\
            <tr><td>Empresa (Alias)</td><td><input type = "text" value = "'+EnterpriseAlias+'" id = "EditAdminEnterpriseAlias" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50" disabled></td></tr>\n\
            <tr><td>Usuario</td><td><input type = "text" value = "admin" id = "EditAdminUserName" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50" disabled></td></tr>\n\
            <tr><td>Password</td><td><input type = "password" value = "'+Password+'" id = "EditAdminPassword" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "45"></td></tr>\n\
        </table>');
        
        var validator = new ClassFieldsValidator();
        validator.InspectCharacters($('#DivEditAdminUser input'));
        
    };
    
    _GetAdminUserInfo = function(UserAdminEnterpriseAlias)
    {
        $('#admin_ventana_trabajo').append('<div class="Loading" id = "UsersAdminLoading"><img src="../img/loadinfologin.gif"></div>');
        
        var xml = 0;
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Users.php",
        data: "option=GetAdminUserInfo&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&UserAdminEnterpriseAlias='+UserAdminEnterpriseAlias, 
        success:  function(response)
        {   
            $('#UsersAdminLoading').remove();
            if($.type(xml)==='object'){Error(response); return 0;}else xml=$.parseXML( response );
            
            if($(xml).find('AdminUsers').length>0)
                return xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
                return 0;
            });                            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown); $('#NewEnterprise').remove();}
        });
        
        return xml;
    };
    
    _ModifyAdminUser = function()
    {
        var validator = new ClassFieldsValidator();
        var Validation = validator.ValidateFields($('#DivEditAdminUser input:not([type="button"])'));
        console.log(Validation);
        if(Validation===0)
            return 0;
        
        var EnterpriseAlias, Password;
        Password = $('#EditAdminPassword').val();
        $('#TableAdminUsers tr.selected').each(function()
        {                
            var position = AdminUsersdT.fnGetPosition(this); // getting the clicked row position  
            EnterpriseAlias = AdminUsersdT.fnGetData(position)[0];
                       
        }); 
        
        if(Password.length<4)
        {
            Advertencia('<p>El password debe ser mayor a 4 caracteres</p>');
            return 0;
        }
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Users.php",
        data: "option=ModifyAdminUser&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&AdminUserEnterprise='+EnterpriseAlias+'&Password='+Password, 
        success:  function(xml)
        {   
            $('#UsersAdminLoading').remove();
            if($.type(xml)==='object'){Error(xml); return 0;}else xml=$.parseXML( xml );
            
            $(xml).find('ModifyAdminUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);                
                $('#DivEditAdminUser').remove();
            });
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
                return 0;
            });                            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown); $('#NewEnterprise').remove();}
        });
        
    };
        
};

UsersManager.prototype.DisplayAdminUsers = function()
{
    var self = this;
    
    $('#admin_ventana_trabajo').empty();
    $('#admin_ventana_trabajo').append('<div class="titulos_ventanas">Usuarios Administradores</div><br>');
    $('#admin_ventana_trabajo').append('<table id = "TableAdminUsers" class = "display hover"></table>');
    $('#TableAdminUsers').append('<thead><tr><th>Alias Empresa</th><th>Usuario</th></tr></thead>');
    
    AdminUsersdT = $('#TableAdminUsers').dataTable(
        {
           "dom": 'lfTrtip',
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){_EditUser();}},
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
            
        AdminUsersDT = new $.fn.dataTable.Api('#TableAdminUsers');        
        
        var AdminUsers = _DisplayAdminUsers();
        if($.type(AdminUsers)!=='object')
            return 0;
        
        $(AdminUsers).find('User').each(function()
        {
            var IdUser = $(this).find('IdEnterprise').text();
            var Alias = $(this).find('Alias').text();
            var Data = 
            [
                /*[0]*/Alias,
                "admin"
            ];
            
            var ai = AdminUsersDT.row.add(Data).draw();
            var n = AdminUsersdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',IdUser);
        });
        
        $('#TableAdminUsers tbody').on( 'click', 'tr', function ()
        {
            AdminUsersDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdRow = $('#TableAdminUsers tr.selected').attr('id');              
            var position = AdminUsersdT.fnGetPosition(this); // getting the clicked row position
        } );  
        
        AdminUsersdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
        
};

UsersManager.prototype.CheckIfExistRoot = function()
{
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/DataBase.php",
    data: 'option=CreateInstanciaCSDOCS&EnterpriseAlias='+EnvironmentData.EnterpriseAlias, 
    success:  function(xml)
    {   
        if($.type( xml )==='object'){Error(xml); return 0;}else xml=$.parseXML( xml );

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
    
    return 1;
};