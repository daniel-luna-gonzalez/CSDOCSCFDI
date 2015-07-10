/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global EnvironmentData, OptionsDataTable, BotonesWindow, parseFloat */
var ListEnterprisedT, ListEnterpriseDT;
var EnterpriseManager = function()
{
    var self = this;
    _FormsNewEnterpriseSystem = function()
    {              
        $('DivFormsNewEnterprise').remove();
        $('body').append('<div id = "DivFormsNewEnterprise"></div>');
        $('#DivFormsNewEnterprise').append('<div class="Loading" id = "LoadingPanelNewEnterprise"><img src="../img/loadinfologin.gif"></div>');
        $('#DivFormsNewEnterprise').dialog({title:"Agregar Nueva Empresa", width:600, height:500, minWidth:500, minHeight:400, modal:true, close:function(){$(this).remove();}, buttons:{"Aceptar":{click:function(){_NewEnterpriseSystem();}, text:"Aceptar"},"Cancelar":{click:function(){$(this).dialog('close');}, text:"Cancelar"}}});
        
        var System = new SystemManagement();
        var DetailVolumes = System.GetVolumesDetail();
        
        if(!$.isXMLDoc(DetailVolumes))
        {
            $('#LoadingPanelNewEnterprise').remove();
            Advertencia("No fué posible obtener la memoria total del sistema");
            return;
        }
        
        var TotalMemory = $(DetailVolumes).find('TotalMemory').text();
        
        $('#DivFormsNewEnterprise').append('<table id = "NewEnterpriseTable"></table>');
        $('#NewEnterpriseTable').append('<tr><td>Alias</td><td><input type = "text" id = "NewEnterpriseAliasForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>');
        $('#NewEnterpriseTable').append('<tr><td>Nombre</td><td><input type = "text" id = "NewEnterpriseNameForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "100"></td></tr>');
        $('#NewEnterpriseTable').append('<tr><td>RFC</td><td><input type = "text" id = "NewEnterpriseRfcForm" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "50"></td></tr>');
        $('#NewEnterpriseTable').append('<tr><td><input type = "button" value = "Volúmenes del sistema" id = "ButtonVolumesDetail"></td><td><input type = "text" id = "NewEnterpriseTotalMemory" class = "StandardForm required" FieldType = "VARCHAR" FieldLength = "100" disabled></td></tr>');
        $('#NewEnterpriseTable').append('<tr><td>Almacenamiento en </td><td><select id = "NewEnterpriseVolumesSelect" class = "StandardForm required" FieldType = "Text"></select></td></tr>');                
        $('#NewEnterpriseTable').append('<tr><td>Memoria a reservar (GB)</td><td><input type = "text" id = "NewEnterpriseMemory" value = "20" class = "StandardForm required" FieldType = "Float" FieldLength = ""></td></tr>');                       
        
        $('#ButtonVolumesDetail').button();
        $('#ButtonVolumesDetail').click(function(){   _DisplayVolumesDetail(DetailVolumes);         });
        
        var TotalMemory = 0;
        $(DetailVolumes).find('Volume').each(function()
        {
            var IdVolume = $(this).find('IdVolume').text();
            var Mounted = $(this).find('VolumeName').text();
            var AvailableMemory = $(this).find('Available').text();
            AvailableMemory = parseFloat(AvailableMemory);
            AvailableMemory = AvailableMemory/1024;
            
            var Used = $(this).find('Used').text();
            Used = parseFloat(Used);
            Used = Used/1024;
            
            TotalMemory+=(AvailableMemory+Used);  
            
            AvailableMemory = AvailableMemory.toFixed(3);
            Used = Used.toFixed(3);
            
            console.log("AvailableMemory ="+AvailableMemory + " + Used = "+Used + " TotalMemory = "+TotalMemory);
                      
            $('#NewEnterpriseVolumesSelect').append('<option value = "'+IdVolume+','+Mounted+','+AvailableMemory+'">'+Mounted+' - Libre ('+AvailableMemory+' GB)</option>');
        });       
        TotalMemory = parseFloat(TotalMemory);
        TotalMemory = TotalMemory.toFixed(3);
        
        $('#NewEnterpriseTotalMemory').val(TotalMemory+" GB");
        
        $('#LoadingPanelNewEnterprise').remove();
        
        var validator = new ClassFieldsValidator();
        validator.InspectCharacters($('#NewEnterpriseTable input'));
        
        var buttons = {"Aceptar":{"text":"Aceptar",click:function(){_NewEnterpriseSystem();}}};
        $( "#consola_administracion" ).dialog('option','buttons', buttons);
    };    
    
    _DisplayVolumesDetail = function(pieData)
    {
        $('#DivVolumesDetail').remove();
        $('body').append('<div id = "DivVolumesDetail"></div>');
        $('#DivVolumesDetail').dialog({width:500, height:500, minWidth:500, minHeight:400, title:"Volúmenes del Sistema", closeOnEscape:false, buttons:{cerrar:function(){$(this).remove();}}, close:function(){$(this).remove();}}).dialogExtend(BotonesWindow);
        $('#DivVolumesDetail').append('<div class="titulos_ventanas">Detalle de Volúmenes del Sistema</div><br>');
        $('#DivVolumesDetail').append('<div class="Loading" id = "LoadingVolumesDetailPanel"><img src="../img/loadinfologin.gif"></div>');
        
        /*----------------------------------------------------------------------
         *                  Gráfica con el volúmen total
         *----------------------------------------------------------------------*/
        var TotalMemory = 0;
        var Data = [];
        
        $('#DivVolumesDetail').append('<div id = "DivTotalVolumesDetail" class = "epoch category10"></div>');
        $('#DivTotalVolumesDetail').append('<table id = "GraphicTableVolumesTotal" class = "VolumeGraphicTable"></table>');
        
        $(pieData).find('Volume').each(function(){
            var AvailableMemory = $(this).find('Available').text();
            var VolumeName = $(this).find('VolumeName').text();         
            VolumeName = VolumeName.replace('/','');
            AvailableMemory = parseFloat(AvailableMemory)/1024;
            var Used = $(this).find('Used').text();
            Used = parseFloat(Used)/1024;
            var TotalVolume = parseFloat(AvailableMemory)+parseFloat(Used);
            TotalVolume = TotalVolume.toFixed(3);
            TotalMemory+=parseFloat(AvailableMemory)+parseFloat(Used);
            Data[Data.length]={label:VolumeName, value: TotalVolume};   
            $('#GraphicTableVolumesTotal').append("<tr><td>"+VolumeName+"</td><td>"+TotalVolume+' GB </td></tr>');            
        });                
        
        $('#DivTotalVolumesDetail').epoch({type: 'pie',data: Data,width:250,height:250});
        
        /*----------------------------------------------------------------------
         *          Gráfica por cada volúmen
         *---------------------------------------------------------------------*/
                
        $(pieData).find('Volume').each(function()
        {
            var VolumeName = $(this).find('VolumeName').text();
            VolumeName = VolumeName.replace('/','');
            var AvailableMemory = $(this).find('Available').text();
            AvailableMemory = parseFloat(AvailableMemory);
            AvailableMemory = AvailableMemory/1024;
            AvailableMemory = AvailableMemory.toFixed(3);
            var Used = $(this).find('Used').text();
            Used = parseFloat(Used)/1024;
            Used = Used.toFixed(3);
            var TotalVolume = parseFloat(AvailableMemory)+parseFloat(Used);
            TotalVolume = parseFloat(TotalVolume).toFixed(3);
            var TotalEnterprises = $(this).find('TotalEnterprises').text();
            var div = VolumeName+'Graphic';
            var table = div+'Table';
            $('#DivVolumesDetail').append('<div id = "'+div+'" class = "epoch category10"></div>');
            
            $('#'+div).append('\
                <table id = "'+table+'" class = "VolumeGraphicTable">\n\
                    <tr><td>'+VolumeName+"</td><td>"+TotalVolume+' GB</td></tr>\n\
                    <tr><td>Disponible</td><td>'+AvailableMemory+' GB</td></tr>\n\
                    <tr><td>Ocupado</td><td>'+Used+' GB</td></tr>\n\
                    <tr><td>Total Empresas</td><td>'+TotalEnterprises+'</td></tr>\n\
                </table>');        
            
            if(TotalEnterprises>0)
                $('#'+table).append('<tr><td colspan = "2" style = "border:none"><center>Empresas</center></td></tr>');
            
            $(this).find('Enterprise').each(function()
            {
                var Alias = $(this).find('Alias').text();
                $('#'+table).append('<tr><td style = "border:none" colspan = "2">'+Alias+'</td></tr>');
            });
                            
            var Data = [{label:"Libre", value: AvailableMemory},{label:"Usado", value: Used}];  

            $('#'+div).epoch({type: 'pie',data: Data, width:250, height:250 });
        });
        
        $('#LoadingVolumesDetailPanel').remove();
    };
    
    _NewEnterpriseSystem = function()
    {        
        var validator = new ClassFieldsValidator();
        var Validation = validator.ValidateFields($('#NewEnterpriseTable input:not([type="button"])'));
        
        var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
        var EnterpriseAlias = $('#NewEnterpriseAliasForm').val();
        if(!RegularExpresion.test(EnterpriseAlias))
        {
            Validation = 0;
            validator.AddClassRequiredActive($('#NewEnterpriseAliasForm'));
        }
        else
            validator.RemoveClassRequiredActive($('#NewEnterpriseAliasForm'));
        console.log(Validation);
        if(Validation===0)
            return;                
        
        var NewNameEnterprise = $('#NewEnterpriseNameForm').val();
        var NewRfcEnterprise = $('#NewEnterpriseRfcForm').val();
        var VolumeDetail = $('#NewEnterpriseVolumesSelect').val();
        VolumeDetail = VolumeDetail.split(',');
        var IdVolume = VolumeDetail[0];
        var Volume = VolumeDetail[1];
        var VolumeMemory = parseFloat(VolumeDetail[2])*1024;
        var AssignedMemory = parseFloat($('#NewEnterpriseMemory').val());
        AssignedMemory = AssignedMemory*1024;
        
        if(AssignedMemory>VolumeMemory)
        {
            validator.AddClassRequiredActive($('#NewEnterpriseMemory'));
            $('#NewEnterpriseMemory').attr('title','El espacio de disco asignado supera el espacio disponible');
            return 0;
        }
        else
        {
            validator.RemoveClassRequiredActive($('#NewEnterpriseMemory'));
        }
        
        $('#DivFormsNewEnterprise').append('<div class="Loading" id = "NewEnterprise"><img src="../img/loadinfologin.gif"></div>');
                        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Enterprise.php",
        data: "option=NewEnterpriseSystem&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+'&IdVolume='+IdVolume+'&NewEnterpriseAlias='+EnterpriseAlias+'&NewNameEnterprise='+NewNameEnterprise+'&NewRfcEnterprise='+NewRfcEnterprise+'&Volume='+Volume+'&IdUser='+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&AssignedMemory='+AssignedMemory, 
        success:  function(xml)
        {   
            $('#NewEnterprise').remove();
            if($.parseXML(xml)===null){Error(xml); return 0;}else xml=$.parseXML( xml );
            console.log(xml);
            $(xml).find('NewEnterprise').each(function()
            {
                console.log();
                var Mensaje = $(xml).find('Mensaje').text();
                Notificacion(Mensaje);
                $('#DivFormsNewEnterprise').remove();
                
                var IdEnterprise = $(this).find('IdEnterprise').text();
                console.log(IdEnterprise);
                var EnterpriseAlias = $(this).find('EnterpriseAlias').text();
                var EnterpriseName = $(this).find('EnterpriseName').text();
                var Rfc = $(this).find('RFC').text();
                var TotalMemory = $(this).find('TotalMemory').text();
                TotalMemory = parseFloat(TotalMemory)/1024;
                TotalMemory = parseFloat(TotalMemory);
                TotalMemory = TotalMemory.toFixed(3);
                var OccupiedMemory = $(this).find('OccupiedMemory').text();
                var FreeMemory = $(this).find('FreeMemory').text();
                FreeMemory = parseFloat(FreeMemory)/1024;
                FreeMemory = FreeMemory.toFixed(3);
                var DischargeDate = $(this).find('DischargeDate').text();
                var Volume = $(this).find('Volume').text();
                
                var data = 
                [
                    EnterpriseAlias,
                    EnterpriseName,
                    Rfc,
                    DischargeDate,
                    FreeMemory,
                    OccupiedMemory,
                    TotalMemory,
                    Volume,
                    IdVolume
                ];
                       
                var ai = ListEnterpriseDT.row.add(data).draw();
                var n = ListEnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdEnterprise);             
                
                ListEnterpriseDT.$('tr.selected').removeClass('selected');
                $('#ListEnterpriseTable tr[id="'+IdEnterprise+'"]').addClass('selected');
                
            });
            
            $(xml).find('DuplicatedEnterprise').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
            });
            
            $(xml).find('Warning').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
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
            
    _BuildEnterprisesListTable = function(Enterprises)
    {
        $('#admin_ventana_trabajo').empty();       
        $('#admin_ventana_trabajo').append('<div class="titulos_ventanas">Detalle de Empresas del Sistema</div><br>');
        $('#admin_ventana_trabajo').append('<table id = "ListEnterpriseTable" class = "display hover"></table>');
        $('#ListEnterpriseTable').append('<thead><tr><th>Alias</th><th>Nombre</th><th>RFC</th><th>Fecha Registro</th><th>Memoria Disponible</th><th>Espacio en Uso (GB)</th><th>Capacidad (GB)</th><th>Volúmen</th><th>Código Volúmen</th></tr></thead>');
        
        ListEnterprisedT = $('#ListEnterpriseTable').dataTable(
        {
           "dom": 'lfTrtip',
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Agregar", "fnClick" :function(){_FormsNewEnterpriseSystem();}},
                    {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){_ModifyEnterpriseForms();}},
                    {"sExtends":"text", "sButtonText": "Eliminar", "fnClick" :function(){_ConfirmDeleteEnterprise();}},                    
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
            
        ListEnterpriseDT = new $.fn.dataTable.Api('#ListEnterpriseTable');
        
        
        $(Enterprises).find('Enterprise').each(function()
        {
            var IdEnterprise = $(this).find('IdEnterprise').text();
            var EnterpriseName = $(this).find('EnterpriseName').text();
            var Alias = $(this).find('Alias').text();
            var RFC = $(this).find('RFC').text();
            var DischargeDate = $(this).find('DischargeDate').text();
            var UsedMemory = $(this).find('UsedMemory').text();
            UsedMemory = parseFloat(UsedMemory)/1024;
            UsedMemory = parseFloat(UsedMemory);
            UsedMemory = UsedMemory.toFixed(3);
            var AvailableMemory = $(this).find('AvailableMemory').text();
            AvailableMemory = parseFloat(AvailableMemory);
            AvailableMemory = AvailableMemory/1024;
            AvailableMemory = AvailableMemory.toFixed(3);
            var TotalMemory = $(this).find('TotalMemory').text();
            TotalMemory = parseFloat(TotalMemory);
            TotalMemory = TotalMemory/1024;
            TotalMemory = TotalMemory.toFixed(3);
            
            var IdVolume = $(this).find('IdVolume').text();
            var VolumeName = $(this).find('VolumeName').text();
            
            var Data = 
            [
                /*[0]*/Alias, 
                /*[1]*/EnterpriseName,
                /*[2]*/RFC,
                /*[3]*/DischargeDate,
                /*[4]*/AvailableMemory,
                /*[5]*/UsedMemory,
                /*[6]*/TotalMemory,
                /*[7]*/VolumeName,
                /*[8]*/IdVolume
            ];
            
            var ai = ListEnterpriseDT.row.add(Data).draw();
            var n = ListEnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',IdEnterprise);
            
        });
        
        $('#ListEnterpriseTable tbody').on( 'click', 'tr', function ()
        {
            ListEnterpriseDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdRow = $('#TableUsersGroups tr.selected').attr('id');              
            var position = ListEnterprisedT.fnGetPosition(this); // getting the clicked row position
        } );  
        
        ListEnterprisedT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
    };
    
    _ConfirmDeleteEnterprise = function()
    {
        $('#DeleteEnterpriseDiv').remove();
        var EnterpriseAlias;
        var IdEnterprise = $('#ListEnterpriseTable tr.selected').attr('id');
        
        if(!(IdEnterprise>0))
        {
            Advertencia("Debe seleccionar una empresa");
            return ;
        }
        
        $('#ListEnterpriseTable tr[id='+ IdEnterprise +']').each(function()
        {                
            var position = ListEnterprisedT.fnGetPosition(this); // getting the clicked row position  
            EnterpriseAlias = ListEnterprisedT.fnGetData(position)[0];
        }); 
        
        $('body').append('<div id = "DeleteEnterpriseDiv"></div>');
        
        $('#DeleteEnterpriseDiv').append('<p>¿Realmente desea eliminar la empresa <b>'+EnterpriseAlias+'</b>?<br>Este proceso no puede revertirse y la información será eliminada por completo</p>');
        $('#DeleteEnterpriseDiv').dialog({title:"Mensaje de confirmación", width:350, height:200, minWidth:300, minHeight:200, modal:true, buttons:{
                Aceptar:{click:function(){$(this).dialog('close');_DeleteEnterprise();}, text:"Aceptar"},
                Cancelar:{click:function(){$(this).dialog('close');}, text:'Cancelar'}
        }, close:function(){$(this).remove();}});
    };
    
    _DeleteEnterprise = function()
    {
        var DeleteEnterpriseName, TotalMemory, AvailableMemory, UsedMemory, IdVolume, VolumeName;
        var IdEnterprise = $('#ListEnterpriseTable tr.selected').attr('id');
        
        $('#ListEnterpriseTable tr[id='+ IdEnterprise +']').each(function()
        {                
            var position = ListEnterprisedT.fnGetPosition(this); // getting the clicked row position  
            DeleteEnterpriseName = ListEnterprisedT.fnGetData(position)[0];
            AvailableMemory = ListEnterprisedT.fnGetData(position)[4];
            UsedMemory = ListEnterprisedT.fnGetData(position)[5];         
            TotalMemory = ListEnterprisedT.fnGetData(position)[6];    
            VolumeName = ListEnterprisedT.fnGetData(position)[7];  
            IdVolume = ListEnterprisedT.fnGetData(position)[8];
        }); 
       
       AvailableMemory = parseFloat(AvailableMemory)*1024;
       UsedMemory = parseFloat(UsedMemory)*1024;
       TotalMemory = parseFloat(TotalMemory)*1024;
       
       if(!$.isNumeric(AvailableMemory) || !$.isNumeric(UsedMemory) || !$.isNumeric(TotalMemory))
       {
           console.log("Alguno de los datos de memoria es incongruente");
           return;
       }           
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Enterprise.php",
        data: 'option=DeleteEnterprise&EnterpriseAlias='+EnvironmentData.EnterpriseAlias+'&IdEnterprise='+IdEnterprise+'&AvailableMemory='+AvailableMemory+'&UsedMemory='+UsedMemory+'&TotalMemory='+TotalMemory+'&IdVolume='+IdVolume+'&DeleteEnterpriseName='+DeleteEnterpriseName, 
        success:  function(xml)
        {   
            if($.parseXML(xml)===null){Error(xml); return 0;}else xml=$.parseXML( xml );
            
            $(xml).find('DeleteEnterprise').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                ListEnterpriseDT.row('tr[id='+IdEnterprise+']').remove().draw( false );
                ListEnterprisedT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
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
    
    _ModifyEnterpriseForms = function()
    {
        var IdEnterprise = $('#ListEnterpriseTable tr.selected').attr('id');
        if(!(IdEnterprise>0))
        {
            Advertencia("Debe seleccionar una empresa");
            return ;
        }
        
        _FormsNewEnterpriseSystem();
        
        /* No puede cambiarse el nombre de la instancia ni el volúmende almacenamiento */
        $('#NewEnterpriseAliasForm').prop("disabled", true); 
        $('#NewEnterpriseVolumesSelect').prop('disabled',true);
        
        var EnterpriseXml = _GetSystemEnterprises(IdEnterprise);                
        
        var buttons = {"Modificar":{click:function(){_ModifyEnterprise(EnterpriseXml);}, text:"Modificar"},"Cancelar":{text:"Cancelar",click:function(){$(this).dialog('close');}}};
        
        $('#DivFormsNewEnterprise').dialog('option','buttons', buttons);
        $('#DivFormsNewEnterprise').dialog('option','title', "Editar Empresa");
        
        $(EnterpriseXml).find('Enterprise').each(function()
        {
            var IdEnterprise = $(this).find('IdEnterprise').text();
            var EnterpriseName = $(this).find('EnterpriseName').text();
            var Alias = $(this).find('Alias').text();
            var RFC = $(this).find('RFC').text();
            var DischargeDate = $(this).find('DischargeDate').text();
            var UsedMemory = $(this).find('UsedMemory').text();
            UsedMemory = parseFloat(UsedMemory)/1024;
            var AvailableMemory = $(this).find('AvailableMemory').text();
            AvailableMemory = parseFloat(AvailableMemory)/1024;
            var TotalMemory = $(this).find('TotalMemory').text();
            TotalMemory = parseFloat(TotalMemory)/1024;
            var VolumeName = $(this).find('VolumeName').text();
            
            $('#NewEnterpriseAliasForm').val(Alias);
            $('#NewEnterpriseNameForm').val(EnterpriseName);
            $('#NewEnterpriseRfcForm').val(RFC);
            $('#NewEnterpriseMemory').val(TotalMemory);
                        
        });
    };   
    
    _ModifyEnterprise = function(EnterpriseXml)
    {
        var validator = new ClassFieldsValidator();
        var Validation = validator.ValidateFields($('#NewEnterpriseTable input:not([type="button"])'));                
        console.log(Validation);
        if(Validation===0)
            return;                
        
        var NewNameEnterprise = $('#NewEnterpriseNameForm').val();
        var NewRfcEnterprise = $('#NewEnterpriseRfcForm').val();
        
        var IdEnterprise, EnterpriseNewTotalMemory,EnterpriseCurrentMemory, AddMemory = 0, NewTotalMemory = 0, UsedMemory = 0, AvailableMemory;
        $(EnterpriseXml).find('Enterprise').each(function()
        {
            IdEnterprise = $(this).find('IdEnterprise').text();
            UsedMemory = $(this).find('UsedMemory').text();
            UsedMemory = parseFloat(UsedMemory)/1024;
            AvailableMemory = $(this).find('AvailableMemory').text();
            AvailableMemory = parseFloat(AvailableMemory)/1024;
            var TotalMemory = $(this).find('TotalMemory').text();
            TotalMemory = parseFloat(TotalMemory)/1024;            
            EnterpriseCurrentMemory = TotalMemory;
        });
        
        var VolumeDetail = $('#NewEnterpriseVolumesSelect').val();
        VolumeDetail = VolumeDetail.split(',');
        var IdVolume = VolumeDetail[0], Volume = VolumeDetail[1], VolumeMemory = parseFloat(VolumeDetail[2]);
                        
        EnterpriseNewTotalMemory = $('#NewEnterpriseMemory').val();
        EnterpriseNewTotalMemory = parseFloat(EnterpriseNewTotalMemory);
        
        AddMemory = EnterpriseNewTotalMemory - EnterpriseCurrentMemory;        
        
        /* Sí se aumenta la memoria de la empresa */
        if(AddMemory>VolumeMemory)
        {
            validator.AddClassRequiredActive($('#NewEnterpriseMemory'));
            $('#NewEnterpriseMemory').attr('title','El espacio de disco asignado supera el espacio disponible');
            return 0;
        }
        else
            validator.RemoveClassRequiredActive($('#NewEnterpriseMemory'));
        
        /* Sí se disminuye la memoria de la empresa */
        if(EnterpriseNewTotalMemory<EnterpriseCurrentMemory)
        {
            $('#NewEnterpriseMemory').val(EnterpriseCurrentMemory);
            Advertencia("La memoria no puede ser reducida");
            return 0;
        }                     
               
        /* La memoria a agregar se convierte en MB */       
        NewTotalMemory = (AddMemory + EnterpriseCurrentMemory)*1024;
        AvailableMemory = (AvailableMemory +AddMemory)*1024;
        AddMemory = AddMemory*1024;               
               
        $.ajax({
            async:false, 
            cache:false,
            dataType:"html", 
            type: 'POST',   
            url: "php/Enterprise.php",
            data: 'option=ModifyEnterprise&EnterpriseAlias='+EnvironmentData.EnterpriseAlias+'&IdEnterprise='+IdEnterprise+'&IdUser='+EnvironmentData.IdUser+ '&UserName='+EnvironmentData.UserName+'&NewNameEnterprise='+NewNameEnterprise+'&NewRfcEnterprise='+NewRfcEnterprise+'&AddMemory='+AddMemory+'&NewTotalMemory='+NewTotalMemory+'&UsedMemory='+UsedMemory+'&AvailableMemory='+AvailableMemory, 
            success:  function(xml)
            {   
                if($.parseXML(xml)===null){Error(xml); return 0;}else xml=$.parseXML( xml );
                console.log(xml);
                $(xml).find('ModifyEnterprise').each(function(){
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);
                    $('#DivFormsNewEnterprise').dialog('close');      
                    
                    var IdEnterprise = $(this).find('IdEnterprise').text();
                    var EnterpriseName = $(this).find('EnterpriseName').text();
                    var Rfc = $(this).find('RFC').text();
                    var NewTotalMemory = $(this).find('NewTotalMemory').text();
                    NewTotalMemory = parseFloat(NewTotalMemory)/1024;
                    var UsedMemory = $(this).find('UsedMemory').text();
                    UsedMemory = parseFloat(UsedMemory)/1024;
                    var AvailableMemory = $(this).find('AvailableMemory').text();
                    AvailableMemory = parseFloat(AvailableMemory)/1024;
                    
                    ListEnterprisedT.$('tr[id="'+IdEnterprise+'"]').each(function()
                    {
                        var position = ListEnterprisedT.fnGetPosition(this); // getting the clicked row position
                        ListEnterprisedT.fnUpdate([EnterpriseName],position,1,false);
                        ListEnterprisedT.fnUpdate([Rfc],position,2,false);
                        ListEnterprisedT.fnUpdate([AvailableMemory],position,4,false);
                        ListEnterprisedT.fnUpdate([UsedMemory],position,5,false);
                        ListEnterprisedT.fnUpdate([NewTotalMemory],position,6,false);
                    });
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
            error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });
    };
    
    _GetSystemEnterprises = function(IdEnterprise)
    {
        var xml = 0;
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Enterprise.php",
        data: 'option=GetSystemEnterprises&EnterpriseAlias='+EnvironmentData.EnterpriseAlias+'&IdEnterprise='+IdEnterprise, 
        success:  function(response)
        {   
            if($.type(response)==='object'){Error(response); return 0;}else xml=$.parseXML( response );
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
                return 0;
            });             
            return xml;
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });

        return xml;
    };
    
};

EnterpriseManager.prototype.GetListEnterprisesXml = function(content) /* Emisores (Facturas) */
{
    var xml = 0;
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Enterprise.php",
    data: 'option=GetListEnterprisesXml&IdUser='+EnvironmentData.IdUser+ '&UserName='+EnvironmentData.UserName+'&content='+content, 
    success:  function(response)
    {   
        if($.parseXML(response)===null){Error(response); return 0;}else xml=$.parseXML( response );
        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            xml = 0;
            return 0;
        });             
        return xml;
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });
    
    return xml;
};

/*------------------------------------------------------------------------------
 * Descripción: Método llamado desde SystemManagement para el registro de una
 *              nueva empresa (Instancia)
 ------------------------------------------------------------------------------*/
EnterpriseManager.prototype.NewEnterpriseSystem = function()
{
    _FormsNewEnterpriseSystem();
};

EnterpriseManager.prototype.ShowListEnterpriseSystem = function()
{
    var self = this;
    $( "#consola_administracion" ).dialog('option','buttons', {});
    $('#admin_ventana_trabajo').empty();
    
    var EnterpriseList = _GetSystemEnterprises(0);    
    if(!$.isXMLDoc(EnterpriseList))
        return 0;
    
    _BuildEnterprisesListTable(EnterpriseList);
};