/* global EnvironmentData */

var Receipt = function()
{
    
};

Receipt.prototype.GetXmlValidationReceiptByPath = function(content,IdReceipt, Path)
{        
    var xml = 0;
    
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Receipt.php",
    data:"IdLogin="+EnvironmentData.IdUser+'&content='+content+'&option=GetXmlValidationReceipt&XmlPath='+Path+'&IdReceipt='+IdReceipt, 
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

Receipt.prototype.ShowRecipt = function(xml)
{    
    $('#contenedor_acuse').empty();
    $('#contenedor_acuse').append('<div id="barra_opciones_acuse" class="opciones_acuse"><input type="button" value="Imprimir Acuse" id="boton_imprimir_acuse"></div>');     
    $('#contenedor_acuse').append('<div class="titulo_acuse" id="div_titulo_acuse">Acuse de Recibo CFDI</div>');
    $('#contenedor_acuse').append('<div id="contenido_acuse" class="contenido_acuse"></div>');
    $('#boton_imprimir_acuse').button();  
    
    $('#contenido_acuse').append('<table id = "TableValidationReceipt"></table>');
    
    $(xml).find('RespuestaSAT').each(function()
    {
        var webservice = $(this).find('WebService').text();
         var EmisorRfc = $(this).find('EmisorRfc').text();
         var ReceptorRFC = $(this).find('ReceptorRFC').text();
         var FechaHoraEnvio = $(this).find('FechaHoraEnvio').text();
         var FechaHoraRespuesta = $(this).find('FechaHoraRespuesta').text();
         var TotalFactura = $(this).find('TotalFactura').text(); 
         var UUID = $(this).find('UUID').text(); 
         var CodigoEstatus = $(this).find('CodigoEstatus').text();
         var Estado = $(this).find('Estado').text();
         var AcuseRecibo = $(this).find('AcuseRecibo').text();
         
        $('#TableValidationReceipt').append('<tr><td><b>Servicio SAT<b></td><td>'+webservice+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Fecha Hora<br>de Consulta</b></td><td>'+FechaHoraEnvio+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Emisor RFC</b></td><td>'+EmisorRfc+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Receptor RFC</b></td><td>'+ReceptorRFC+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Total de la Factura</b></td><td>'+TotalFactura+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Folio Fiscal<br>del CFDI</b></td><td>'+UUID+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Respuesta SAT</b></td><td>'+CodigoEstatus+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Estado del CFDI</b></td><td>'+Estado+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Fecha Hora<br>de Respuesta</b></td><td>'+FechaHoraRespuesta+'</td></tr>');
        $('#TableValidationReceipt').append('<tr><td><b>Folio Fiscal <br>Respuesta</b></td><td>'+AcuseRecibo+'</td></tr>');
    });
   
    $( "#contenedor_acuse" ).dialog(
    {
        minHeight: 400,minWidth:700,modal: true, closeOnEscape:true,title:"Acuse de Recibo", show:{ effect: "clip"},hide: { effect: "fold"}
    });           
    
    $('#boton_imprimir_acuse').click(function()
    {
        $("#contenedor_acuse").printArea();
    });    
};

Receipt.prototype.ShowValidationReceipt = function(content, IdReceipt, Path)
{
    var xml = this.GetXmlValidationReceiptByPath(content,IdReceipt, Path);   
    if($.isXMLDoc(xml))
    {
        this.ShowRecipt(xml);
    }
};


Receipt.prototype.GetXmlSatValidationCfdiAnswer = function(content, IdDetail)
{
    var id_usuario_sistema=$('#id_usr').val();    
    
    var xml = 0;
    
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/SATAnswer.php",
    data: "IdDetail="+IdDetail+"&IdLogin="+id_usuario_sistema+'&content='+content+'&option=GetXmlSatValidationCfdiAnswer', 
    success:  function(response)
    {   
        if($.parseXML( response )===null){Error(response); return 0;}else xml=$.parseXML( response );        

        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje=$Error.find("Mensaje").text();
            Error(mensaje);
            return 0;
        });          
        
        return xml;
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown); return 0;}
    });   
    
    return xml;
};