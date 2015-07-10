/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global BotonesWindow, EnvironmentData, parseFloat */

$(document).ready(function()
{
    $('#LinkKEnterpriseList').click(function()
    {
        var enterprise = new EnterpriseManager();
        enterprise.ShowListEnterpriseSystem();
    });
    
    $('.LinkDisplayVolumesDetail').click(function()
    {
        var system = new SystemManagement();
        system.DisplayVolumesDetail();
    });
});

var SystemManagement = function()
{
    _DisplayVolumesGraphic = function(pieData)
    {        
        /*----------------------------------------------------------------------
         *                  Gráfica con el volúmen total
         *----------------------------------------------------------------------*/
        var TotalMemory = 0;
        var Data = [];
        
        $('#admin_ventana_trabajo').append('<div id = "DivTotalVolumesDetail" class = "epoch category10"></div>');
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
//            console.log('usado ='+Used+' disponible = '+AvailableMemory+' Total = '+TotalVolume+' ');
            var TotalEnterprises = $(this).find('TotalEnterprises').text();
            var div = VolumeName+'Graphic';
            var table = div+'Table';
            $('#admin_ventana_trabajo').append('<div id = "'+div+'" class = "epoch category10"></div>');
            
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
    };
};

SystemManagement.prototype.DisplayVolumesDetail = function()
{
    var self = this;
    $('#VolumesDetailTable').remove();
    $('#admin_ventana_trabajo').empty();
    $('#admin_ventana_trabajo').append('<div class="titulos_ventanas">Detalle de Volúmenes del Sistema</div><br>');
    $('#admin_ventana_trabajo').append('<div class="Loading" id = "DetailVolumesLoading"><img src="../img/loadinfologin.gif"></div>');

    var VolumesDetail = self.GetVolumesDetail();    
    if($.type(VolumesDetail)!=='object')
    {
        $('#DetailVolumesLoading').remove();
        return;
    }
    
    _DisplayVolumesGraphic(VolumesDetail);    
    
    $('#DetailVolumesLoading').remove();            
};



SystemManagement.prototype.NewEnterprise = function()
{
    var self = this;
    var enterprise = new EnterpriseManager();
    enterprise.NewEnterpriseSystem();
    
};

SystemManagement.prototype.GetSystemVolumes = function()
{
    var xml = 0;
    
    $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/SystemManagement.php",
        data: "option=GetVolumes&IdUser="+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName, 
        success:  function(response)
        {   
            if($.type(response)==='obtect'){Error(response); return 0;}else xml=$.parseXML( response );
            
            if($(xml).find('Volumes').length>0)
                return xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                xml = 0;
                return xml;
            });                            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });
        
        return xml;
};

SystemManagement.prototype.GetVolumesDetail = function()
{
    var xml = 0;
    $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/SystemManagement.php",
        data: "option=GetVolumesDetail&EnterpriseAlias="+EnvironmentData.EnterpriseAlias+"&IdUser="+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName, 
        success:  function(response)
        {   
            if($.type(response)==='object'){Error(response); xml = 0;}else xml=$.parseXML( response );
            
            if($(xml).find('MemoryDetail').length>0)
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

function show_administrador()
{
    $('#admin_ventana_trabajo').empty();    
    
    $("#consola_administracion").dialog({minHeight: 550,minWidth: 1000,   closeOnEscape:false,position:"center",title:'Consola de Administración'}).dialogExtend(BotonesWindow);          
                
    /*  Permite que varios acordeones esten abiertos al mismo tiempo  */    
    $("#accordion > div").accordion({ header: "h3", collapsible: true });
    
     $('#accordion table').on( 'click', 'tr', function ()
    {
        var active = $('#accordion table tr.TableInsideAccordionFocus');                
        $('#accordion table tr').removeClass('TableInsideAccordionFocus');
        $('#accordion table tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#accordion table tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#accordion table tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    if($('#LinkKEnterpriseList').length>0)
        $('#LinkKEnterpriseList').click();            
}