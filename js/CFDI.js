/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global visor_Width, visor_Height, EnvironmentData, OptionsDataTable */

var ProviderTabledT, ProviderTableDT, ClientTabledT, ClientTableDT, PayRollTabledT, PayRollTableDT;
$(document).ready(function()
{
    $('.ButtonUpdateCfdi').click(function()
    {
        var content = $(this).attr('content');        
        var cfdi = new CFDI();
        var IdCfdi = cfdi.GetActiveCfdiId(content);
        if(!IdCfdi>0)
        {
            Advertencia('Seleccione un documento');
            return;
        }
        $('#'+content+'UpdateCfdi').remove();
        $('body').append('<div id = "'+content+'UpdateCfdi"></div>');
        $('#'+content+'UpdateCfdi').append('<center><img src="img/upload.png" title="carga xml" id="img_upload_xml" width="170px" heigth="170px"><center>');
        $('#'+content+'UpdateCfdi').append('<p>Seleccione la nueva Factura de Cliente</p>');
        $('#'+content+'UpdateCfdi').append('<input id="'+content+'XmlFile" type="file" accept="text/xml"/>');                    
        $('#'+content+'UpdateCfdi').append('<br><p>Seleccione su PDF (Opcional)</p>'); 
        $('#'+content+'UpdateCfdi').append('<input id="'+content+'PdfFile" type="file" accept="application/pdf"/>');
        $('#'+content+'UpdateCfdi').dialog({height: 450,width:350,modal: true,closeOnEscape:false, title:'Actualizar un CFDI', minWidth:300, minHegiht:400, buttons:{
                "Actualizar":{click:function(){cfdi.UpdateCfdi(content, IdCfdi);}, text:"Actualizar"},
                "Cancelar":{click:function(){$(this).dialog('destroy');}, text:'Cancelar'}
        }});
    });
    
});

var CFDI = function()
{    
    var self = this;
    
    _ShowPdfAbsolutPath = function(content, Path)
    {
        var pdf = new Pdf();
        pdf.ShowPdfAbsolutPath(Path);
    };
    
    _ShowXml = function(content, IdCfdi, Path)
    {
        var historical = new Historical();
        var xml = self.GetXmlStructureByPath(content,Path);       
        
        $('#'+content+'_div_boton_get_acuse').empty();
        $('#'+content+'_div_boton_get_acuse').append('<input type="button" value="Mostrar Acuse de Validación" id="'+content+'ButtonShowAcuse">');
        $('#'+content+'ButtonShowAcuse').button();
        if(content==='proveedor')
            proveedor_display_xml('',xml);
        if(content==='cliente')
            cliente_display_xml('',xml);
        $('#'+content+'Documents').dialog({minWidth:500,height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Visor CFDI',buttons: {"Descargar Histórico": function (){ historical.DownloadHistorical('content', IdCfdi);}, "Cerrar": function() { $(this).dialog("destroy"); } } });
        $('#'+content+'_contenedor_documentos').tabs();
        $( '#'+content+'_contenedor_documentos li').removeClass( "ui-corner-top" );   

        $('#'+content+'ButtonShowAcuse').click(function()
        {
//            var SatAnswer = new SATAnswer();
            var receipt = new Receipt();
            var XmlSatAnswer = receipt.GetXmlSatValidationCfdiAnswer(content, IdCfdi); /* Id detalle */
            if($.isXMLDoc(XmlSatAnswer))
                mostrar_acuse(XmlSatAnswer);
        });
        var historic = new Historical();
        historic.GetHistoric(content, IdCfdi);
    };
    
    _ShowValidationReceipt = function(content, IdReceipt, Path)
    {
        var receipt = new Receipt();
        receipt.ShowValidationReceipt(content, IdReceipt, Path);
    };
    
    _BuildCfdiTable = function(content, xml)
    {
        var self = this;
        
        var TabledT, TableDT;
        var div = "";
        if(content==='Provider')
            div = "proveedor";
        if(content==='Client')
            div = 'cliente';
        if(content==='PayRoll')
            div='';
        
        $('#'+div+'_tabla_detalle').empty();
        
        $('#'+div+'_tabla_detalle').append('<table id = "'+content+'CfdiTable" class = "display hover"><thead><tr><th></th><th></th><th>Fecha</th><th>Folio</th><th>Subtotal</th><th>Iva</th><th>Total</th><th>Acuse</th><th>Xml</th><th>Pdf</th><th>Tipo</th></tr></thead></table>');
        TabledT = $('#'+content+'CfdiTable').dataTable(OptionsDataTable);    
        TableDT = new $.fn.dataTable.Api('#'+content+'CfdiTable');
        TabledT.fnSetColumnVis(0,false);
        TabledT.fnSetColumnVis(1,false);

        $(xml).find('File').each(function()
        {
            var IdCfdi = $(this).find('IdCfdi').text();
            var Date = $(this).find('Date').text();
            var Folio = $(this).find('Folio').text();
            var Subtotal = $(this).find('subTotal').text();
            var Total = $(this).find('Total').text();
            var XmlPath = $(this).find('XmlPath').text();
            var PdfPath = $(this).find('PdfPath').text();
            var FileState = $(this).find('StateCfdi').text();
            var IdReceiptValidation = $(this).find('IdValidationReceipt').text();
            var ReceiptPath = $(this).find('ReceiptValidationPath').text();
            var PdfImage;
            if(XmlPath.length>0)
                PdfImage = '<img src = "img/pdf_icon.png" onclick = "_ShowPdfAbsolutPath(\''+ content +'\',\''+PdfPath+'\')" title = "Ver vista previa del pdf" style = "cursor:pointer">';
            
            var tota_double=parseFloat(Total);
            var Iva=tota_double-parseFloat(Subtotal);
            var data = 
           [
                XmlPath,
                PdfPath,
                Date,
                Folio,
                Subtotal,                
                Iva,
                Total,
                '<img src = "img/acuse.png" onclick = "_ShowValidationReceipt(\''+div+'\',\''+IdReceiptValidation+'\', \''+ReceiptPath+'\')" title = "Ver acuse" style = "cursor:pointer">',
                '<img src = "img/folder_xml.png" onclick = "_ShowXml(\''+div+'\', \''+IdCfdi+'\' ,\''+XmlPath+'\')" title = "Ver docoumento xml" style = "cursor:pointer">',
                PdfImage,
                FileState
           ];   
           
            var ai = TableDT.row.add(data).draw();
            var n = TabledT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',IdCfdi);                                          
        });
        
        
        $('#'+content+'CfdiTable tbody').on( 'click', 'tr', function ()
            {
                TableDT.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');        
            } ); 
        
        if(content==='Provider')
        {
            ProviderTabledT = TabledT;
            ProviderTableDT = TableDT;
        }
        if(content==='Client')
        {
            ClientTabledT = TabledT;
            ClientTableDT = TableDT;
        } 
        if(content==='PayRoll')
        {
            PayRollTabledT = TabledT;
            PayRollTableDT = TableDT;
        }
    };
};
/* contiene  */

CFDI.prototype.ShowPdfAbsolutPath = function()
{
    
};

CFDI.prototype.ShowFile = function(FileRoute)
{
    var self = this;
    $('#'+self.content+'ShowingFile').remove();
    $('body').append('<div id = "'+self.content+'ShowingFile"></div>');
    $('#'+self.content+'ShowingFile').append('<embed src="'+FileRoute+'" width="99%" height="99%"></embed>');
    $('#'+self.content+'ShowingFile').dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Vista Previa de Documento' });
};

CFDI.prototype.GetXmlStructureByPath = function(content,Path)
{
    var id_usuario_sistema=$('#id_usr').val();/* Log */    
    var xml = 0;
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/CFDI.php",
    data:"IdLogin="+id_usuario_sistema+'&content='+content+'&option=GetXmlStructure&XmlPath='+Path, 
    success:  function(response)
    {   
        if($.parseXML( response )===null){Error(response); return 0;}else xml=$.parseXML( response );

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

CFDI.prototype.GetXmlStructureById = function(IdDetail)
{
    
};

CFDI.prototype.GetFiles = function(content, IdReceiver)
{
    var self = this;
    
    var IdEnterprise = $('#'+content+'Enterprise').val();
    var StartDate = $('#'+content+'StartDateForm').val();
    var EndDate = $('#'+content+'EndDateForm').val();
    var SearchWord = $('#'+content+'SearchForm').val();
    
    var xml = 0;
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/CFDI.php",
    data:"IdUser="+EnvironmentData.IdUser+'&UserName='+EnvironmentData.UserName+'&content='+content+'&option=GetFiles'+'&IdReceiver='+IdReceiver+'&IdTransmiter='+IdEnterprise+'&StartDate='+StartDate+'&EndDate='+EndDate+'&SearchWord='+SearchWord, 
    success:  function(response)
    {   
        if($.parseXML( response )===null){Error(response); return 0;}else xml=$.parseXML( response );

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
            xml = 0;
            return 0;
        });         
        
        _BuildCfdiTable(content, xml);
        
        return xml;
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
};

CFDI.prototype.UpdateCfdi = function(content, IdCfdi)
{
    var TabledT, PdfPath, XmlPath, FileState;
    if(content === 'Provider')
        TabledT = ProviderTabledT;
    if(content === 'Client')
        TabledT = ClientTabledT;
    if(content === 'PayRoll')
        TabledT = PayRollTabledT;
    $('#'+content+'CfdiTable tr[id='+ IdCfdi +']').each(function()
   {                
       var position = TabledT.fnGetPosition(this); // getting the clicked row position  
//       _IdFile = $('#table_DetailResult tr.selected').attr('id');
       XmlPath = TabledT.fnGetData(position)[0];
       PdfPath = TabledT.fnGetData(position)[1]; 
       FileState = TabledT.fnGetData(position)[10];              
   }); 
                          

  var archivos = document.getElementById(content+'XmlFile');  
  var archivo_pdf = document.getElementById(content+'PdfFile');
  if(archivos.files.length===0){
      Advertencia('Debe seleccionar el nuevo CFDI');
    return;
  }
  
  var archivo = archivos.files; //Obtenemos el valor del input (los arcchivos) en modo de arreglo
  var pdf = archivo_pdf.files;
  var data = new FormData();

  for(var i=0; i<archivo.length; i++){
    data.append('xml',archivo[i]);
    data.append('pdf',pdf[i]);
    data.append('IdCfdi',IdCfdi);
    data.append('IdUser',EnvironmentData.IdUser);
    data.append('UserName',EnvironmentData.UserName);
    data.append('option','UpdateCfdi');
    data.append('content',content);    
    data.append('XmlPath',XmlPath);
    data.append('PdfPath',PdfPath);
    data.append('FileState', FileState);
  }    
    
    
    $.ajax({
    async:false, 
    cache:false,
    processData: false,
    contentType: false,
    dataType:"html", 
    type: 'POST',   
    url: "php/CFDI.php",
    data:data, 
    success:  function(xml)
    {   
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        $(xml).find("Error").each(function()
        {
            var mensaje = $(this).find("Mensaje").text();
            Error(mensaje);
        });   
        
        $(xml).find('Update').each(function()
        {
            var Mensaje = $(this).find('Mensaje').text();
            Notificacion(Mensaje);
            
            var Fecha = $(this).find('Fecha').text();
            var Folio = $(this).find('Folio').text();
            var SubTotal = $(this).find('subTotal').text();
            var Total = $(this).find('Total').text();
            var tota_double=parseFloat(Total);
            var Iva=tota_double-parseFloat(SubTotal);
            
            TabledT.$('tr.selected').each(function()
            {
                var position = TabledT.fnGetPosition(this); // getting the clicked row position
                TabledT.fnUpdate([Fecha],position,2,false);
                TabledT.fnUpdate([Folio],position,3,false);     
                TabledT.fnUpdate([SubTotal],position,4,false);   
                TabledT.fnUpdate([Iva],position,5,false);     
                TabledT.fnUpdate([Total],position,6,false);     
            });
            
            $('#'+content+'UpdateCfdi').dialog('destroy');
        });
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });  
};
//ProviderTabledT, ProviderTableDT, ClientTabledT, ClientTableDT, PayRollTabledT, PayRollTableDT
CFDI.prototype.GetActiveCfdiId = function(content)
{
    var id = 0;
    if(content === 'Provider')
        id = ProviderTableDT.$('tr.selected').attr('id');
    if(content === 'Client')
        id = ClientTableDT.$('tr.selected').attr('id');
    if(content === 'PayRoll')
        id = PayRollTableDT.$('tr.selected').attr('id');
    return id;
};
