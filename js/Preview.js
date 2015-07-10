            /*************************************************** 
             *          Content Factura Proveedor                * 
             ***************************************************
             */
/*Llenado de la vista previa del documento XML
 * 
 * @param {type} String     String: define donde se llenará la vista, si viene vacia llena la vista principal, sino llena la vista previa de copia (histórico)
 * @param {type} ObjectXML    
 * @returns {undefined}
 */
  function proveedor_display_xml(tipo,xml)
  {            
      console.log(xml);
      var  Conceptos, Acuse, Impuestos, Complemento;
      var Emisor = $(xml).children().find('cfdiEmisor');
      var Receptor = $(xml).children().find('cfdiReceptor');
      var Conceptos = $(xml).children().find('cfdiConceptos');
      var Impuestos = $(xml).children().find('cfdiImpuestos');
      var Complemento = $(xml).children().find('cfdiComplemento');
      var Comprobante = $(xml).find('cfdiComprobante');
      
      $('#proveedor_div_preview_emisor').empty();
      $('#proveedor_div_preview_emisor').append('<table id = "ProveedorPreviewEmisor" class = "tabla_preview_emisor"></table>');
                       
      var emisor_nombre = $(Emisor).attr('nombre');
      var emisor_rfc = $(Emisor).attr('rfc');

      $(Emisor).find('cfdiDomicilioFiscal').each(function()
      {                
            var DomicilioFiscal = $(this).attr('calle');
            var emisor_colonia = $(this).attr('calle');
            var emisor_colonia = $(this).attr('colonia');
            var emisor_estado = $(this).attr('estado');
            var emisor_pais = $(this).attr('pais');
            var emisor_no_ex = $(this).attr('noExterior');
            var emisor_cp = $(this).attr('codigoPostal');
            
            $('#ProveedorPreviewEmisor').append('<tr><td class = "preview_tabla_celda_emisor" colspan = "2">'+emisor_nombre+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_rfc+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+DomicilioFiscal+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_colonia+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_estado+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_pais+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_no_ex+'</td></tr>');
            $('#ProveedorPreviewEmisor').append('<tr><td colspan = "2">'+emisor_cp+'</td></tr>');            
      });         
     
//*****************************DETALLE DESGLOCE *************************//

    var serie = $(Comprobante).attr('serie');
    var folio = $(Comprobante).attr('folio');
    var fecha = $(Comprobante).attr('fecha');
    var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
    var comprobante='Factura';
    var noCertificado = $(Comprobante).attr('noCertificado');

     $('#proveedor_div_preview_detalle').empty();
     $('#proveedor_div_preview_detalle').append('<table align = "right" id = "ProveedorTableDetalle"></table>');
     $('#ProveedorTableDetalle').append('<tr><td class = "celda_titulo">Serie</td><td class = "celda_titulo">Folio</td></tr>');
     $('#ProveedorTableDetalle').append('<tr><td>'+serie+'</td><td>'+folio+'</td></tr>');
     $('#ProveedorTableDetalle').append('<tr><td class = "celda_titulo">Efecto cfdi</td><td class = "celda_titulo">No. certificado CSD</td></tr>');
     $('#ProveedorTableDetalle').append('<tr><td>'+tipoDeComprobante+'</td><td>'+noCertificado+'</td></tr>');                  
     $('#ProveedorTableDetalle').append('<tr><td class = "celda_titulo">Tipo Comprobante</td><td class = "celda_titulo">Fecha - Hora - Emisión</td></tr>');
     $('#ProveedorTableDetalle').append('<tr><td>'+comprobante+'</td><td>'+fecha+'</td></tr>');          


      /*********************************Receptor ***************************/
      
       $("#proveedor_div_preview_receptor").empty();
       $('#proveedor_div_preview_receptor').append('<table id = "ProveedorTablePreviewReceptor" class = "tabla_preview_receptor"></table>');
       
      
       var receptor_nombre = $(Receptor).attr('nombre');
       var receptor_rfc = $(Receptor).attr('rfc');
       var receptor_calle = $(Receptor).find('cfdiDomicilio').attr('calle');
       var receptor_colonia = $(Receptor).find('cfdiDomicilio').attr('colonia');
       var receptor_no_e = $(Receptor).find('cfdiDomicilio').attr('noExterior');
       var receptor_no_i = $(Receptor).find('cfdiDomicilio').attr('noInterior');
       var receptor_municipio = $(Receptor).find('cfdiDomicilio').attr('municipio');
       var receptor_cp = $(Receptor).find('cfdiDomicilio').attr('codigoPostal');
       var receptor_pais = $(Receptor).find('cfdiDomicilio').attr('pais');      
       
       $('#ProveedorTablePreviewReceptor').append('<tr><td class = "FontTableReceptor">Receptor</td><td>'+receptor_nombre+' '+receptor_rfc+'</td></tr>');         
       $('#ProveedorTablePreviewReceptor').append('<tr><td colspan = "3">'+receptor_calle+', No. interior '+receptor_no_i+', No. exterior '+receptor_no_e+', Col. '+receptor_colonia+','+receptor_municipio+', '+receptor_pais+' C.P.'+receptor_cp+'</td></tr>');
   
    //***************************Conceptos*********************************
    //***********************************************************************
    $('#proveedor_div_preview_conceptos').empty();
    $('#proveedor_div_preview_conceptos').append('<table  id = "ProveedorTableConceptos" class = "tabla_conceptos"></table>');
    $('#ProveedorTableConceptos').append('<thead><tr><th>Cantidad</th><th>Unidad</th><th>No. de Identificación</th><th>Descripción</th><th>Valor Unitario</th><th>Importe</th></tr></thead>');  
       
    $(Conceptos).find('cfdiConcepto').each(function()
    {
        var cantidad = $(this).attr('cantidad');
        var unidad = $(this).attr('unidad');
        var noide = $(this).attr('noIdentificacion');
        var descripcion = $(this).attr('descripcion');
        var valoru = $(this).attr('valorUnitario');
        var importe = $(this).attr('importe');

//        valoru=formato_numero(valoru,2,'.',',');
//        importe=formato_numero(importe,2,'.',',');

        $('#ProveedorTableConceptos').append('<tr><td>'+cantidad+'</td><td>'+unidad+'</td><td>'+noide+'</td><td class = "descripcion">'+descripcion+'</td><td>'+valoru+'</td><td>'+importe+'</td></tr>');

     });
     
      
      /**********************************Totales de Conceptos**********************************/
      $('#proveedor_div_preview_totales_conceptos').empty();
      $('#proveedor_div_preview_totales_conceptos').append('<table id = "ProveedorTableTotalesConceptos" align = "right"></table>');
      var subTotal = $(Comprobante).attr('subTotal');
      subTotal=formato_numero(subTotal,2,'.',',');
      var total = $(Comprobante).attr('total');
      $('#ProveedorTableTotalesConceptos').append('<tr><td><left><b>SUBTOTAL</b></left></td><td>$'+subTotal+'</td></tr>');
      
      subTotal=parseFloat(subTotal);
      var tota_double=parseFloat(total);
      var iva=tota_double-subTotal;
      total=formato_numero(total,2,'.',',');
      
      $('#ProveedorTableTotalesConceptos').append('<tr><td><left><b>IVA</b></left></td><td>$'+iva+'</td></tr>');
      $('#ProveedorTableTotalesConceptos').append('<tr><td><left><b>TOTAL</b></left></td><td>$'+total+'</td></tr>');
      
      /**********************************Descripci�n de Pago**************************************/
      $('#proveedor_div_preview_detalle_pago').empty();
      $('#proveedor_div_preview_detalle_pago').append('<table id = "ProveedorDescripcionPago"></table>');
      
      
      var formaDePago = $(Comprobante).attr('formaDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
//      var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
      var TipoCambio = $(Comprobante).attr('TipoCambio');
      var Moneda = $(Comprobante).attr('Moneda');                
      
      $('#ProveedorDescripcionPago').append('<tr><td>Método de pago</td><td><b>'+metodoDePago+'</b></td>/tr>');
      $('#ProveedorDescripcionPago').append('<tr><td>Forma de pago</td><td><b>'+formaDePago+'</b></td>/tr>');
      $('#ProveedorDescripcionPago').append('<tr><td>Tipo de cambio</td><td><b>'+TipoCambio+'</b></td>/tr>');
      $('#ProveedorDescripcionPago').append('<tr><td>Moneda</td><td><b>'+Moneda+'</b></td>/tr>');
           
      
       //********************************Impuestos*********************************
       //*****************************************************************************   
      
      $('#proveedor_impuestos').empty();
      $('#proveedor_impuestos').append('<table id = "ProveedorTableImpuestos" class = "tabla_conceptos"></table>');
      $('#ProveedorTableImpuestos').append('<thead><tr><th>Impuesto</th><th>Tasa</th><th>Importe</th></tr></thead>');
      
      $(Impuestos).find('cfdiTraslados').each(function()
      {
          $(this).find('cfdiTraslado').each(function()
          {
              var Impuesto = $(this).attr('impuesto');
              var tasa = $(this).attr('tasa');
              var importe = $(this).attr('importe');
              
              $('#ProveedorTableImpuestos').append('<tr><td>'+ importe +'</td><td>'+tasa+'</td><td>'+importe+'</td></tr>');
          });
      });
      var totalImpuestosTrasladados = $(Impuestos).attr('totalImpuestosTrasladados');
      $('#proveedor_impuestos_totales').empty();
      $('#proveedor_impuestos_totales').append('<table id = "ProveedorTableImpuestosTotales" align = "right"></table>');
      $('#ProveedorTableImpuestosTotales').append('<tr><td colspan = "2"><b>Total Impuestos Trasladados </b></td><td> $ '+totalImpuestosTrasladados+'</td></tr>');

      /***************************** Cadena Original y Sello SAT ************************************/
      
      $('#proveedor_div_preview_sello_digital').empty();
      
      var tabla_cadena_original=document.createElement('table');
      tabla_cadena_original.setAttribute('class','tabla_preview_sello_digital');
      var tr = document.createElement('tr');
      var td1=document.createElement('td');     
      
      var cadena_original = $(Comprobante).attr('sello');

      var text_area=document.createElement('textarea');
            
      td1.innerHTML="<center>SELLO DIGITAL DEL CFDI</center>";
      td1.setAttribute("class","celda_titulo");
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      tr = document.createElement('tr');
      td1=document.createElement('td');     
      td1.setAttribute("class","celda_sello_original");
      
      text_area.innerHTML=(cadena_original);
      text_area.setAttribute("class","textarea_sello_original");
      text_area.setAttribute("disabled","disabled");
      td1.appendChild(text_area);
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      $('#proveedor_div_preview_sello_digital').append(tabla_cadena_original);
      
/************************************Complemento de certificaci�n del sat*********************************/

    $('#proveedor_div_preview_tfd').empty();
    $('#proveedor_div_preview_tfd').append();
    $('#proveedor_div_preview_tfd').append('<table id = "ProveedorTableTfd" class = "tabla_complemento_certificacion"></table>');
    
    var version='';
    var folio_fiscal='';
    var fecha_timbrado='';
    var certificado_sat;
    
    $(Complemento).find('tfdTimbreFiscalDigital').each(function()
    {
        version = $(this).attr('version');
        folio_fiscal = $(this).attr('UUID');
        fecha_timbrado = $(this).attr('FechaTimbrado');
        certificado_sat = $(this).attr('noCertificadoSAT');
    });
    
    $('#ProveedorTableTfd').append('<tr><td colspan = "4" class = "celda_titulo">TIMBRE FISCAL DIGITAL - COMPLEMENTO DE CERTIFICACION DEL SAT</td></tr>');
    $('#ProveedorTableTfd').append('<tr><td colspan = "4"><br></td></tr>');
    $('#ProveedorTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">VERSION</td><td>'+version+'</td colspan = "2"></tr>');
    $('#ProveedorTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FOLIO FISCAL - UUID</td><td colspan = "2">'+folio_fiscal+'</td></tr>');
    $('#ProveedorTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FECHA TIMBRADO</td><td colspan = "2">'+fecha_timbrado+'</td></tr>');          
    $('#ProveedorTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">NO. CERTIFICADO SAT</td><td colspan = "2">'+certificado_sat+'</td></tr>');          
                                            
}               

/*------------------------------------------------------------------------------
                          Content Factura Cliente                
------------------------------------------------------------------------------*/
                         
                        
//Llenado de la vista previa del documento XML
  function cliente_display_xml(tipo,xml)
  {            
      var  Conceptos, Acuse, Impuestos, Complemento;
      var Emisor = $(xml).children().find('cfdiEmisor');
      var Receptor = $(xml).children().find('cfdiReceptor');
      var Conceptos = $(xml).children().find('cfdiConceptos');
      var Impuestos = $(xml).children().find('cfdiImpuestos');
      var Complemento = $(xml).children().find('cfdiComplemento');
      var Comprobante = $(xml).find('cfdiComprobante');
      
      
      $('#cliente_div_preview_emisor').empty();      
      $('#cliente_div_preview_emisor').append('<table id = "ClientePreviewEmisor" class = "tabla_preview_emisor"></table>');
      
      var emisor_nombre = $(Emisor).attr('nombre');
      var emisor_rfc = $(Emisor).attr('rfc');

      $(Emisor).find('cfdiDomicilioFiscal').each(function()
      {                
            var DomicilioFiscal = $(this).attr('calle');
            var emisor_colonia = $(this).attr('calle');
            var emisor_colonia = $(this).attr('colonia');
            var emisor_estado = $(this).attr('estado');
            var emisor_pais = $(this).attr('pais');
            var emisor_no_ex = $(this).attr('noExterior');
            var emisor_cp = $(this).attr('codigoPostal');
            
            $('#ClientePreviewEmisor').append('<tr><td class = "preview_tabla_celda_emisor" colspan = "2">'+emisor_nombre+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_rfc+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+DomicilioFiscal+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_colonia+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_estado+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_pais+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_no_ex+'</td></tr>');
            $('#ClientePreviewEmisor').append('<tr><td colspan = "2">'+emisor_cp+'</td></tr>');            
      });         
            
      
//*****************************DETALLE DESGLOCE *************************//
     
    var serie = $(Comprobante).attr('serie');
    var folio = $(Comprobante).attr('folio');
    var fecha = $(Comprobante).attr('fecha');
    var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
    var comprobante='Factura';
    var noCertificado = $(Comprobante).attr('noCertificado');

     $('#cliente_div_preview_detalle').empty();
     $('#cliente_div_preview_detalle').append('<table align = "right" id = "ClienteTableDetalle"></table>');
     $('#ClienteTableDetalle').append('<tr><td class = "celda_titulo">Serie</td><td class = "celda_titulo">Folio</td></tr>');
     $('#ClienteTableDetalle').append('<tr><td>'+serie+'</td><td>'+folio+'</td></tr>');
     $('#ClienteTableDetalle').append('<tr><td class = "celda_titulo">Efecto cfdi</td><td class = "celda_titulo">No. certificado CSD</td></tr>');
     $('#ClienteTableDetalle').append('<tr><td>'+tipoDeComprobante+'</td><td>'+noCertificado+'</td></tr>');                  
     $('#ClienteTableDetalle').append('<tr><td class = "celda_titulo">Tipo Comprobante</td><td class = "celda_titulo">Fecha - Hora - Emisión</td></tr>');
     $('#ClienteTableDetalle').append('<tr><td>'+comprobante+'</td><td>'+fecha+'</td></tr>');                                            

      /*********************************Receptor ***************************/
      $("#cliente_div_preview_receptor").empty();
       $('#cliente_div_preview_receptor').append('<table id = "ClienteTablePreviewReceptor" class = "tabla_preview_receptor"></table>');
       
      
       var receptor_nombre = $(Receptor).attr('nombre');
       var receptor_rfc = $(Receptor).attr('rfc');
       var receptor_calle = $(Receptor).find('cfdiDomicilio').attr('calle');
       var receptor_colonia = $(Receptor).find('cfdiDomicilio').attr('colonia');
       var receptor_no_e = $(Receptor).find('cfdiDomicilio').attr('noExterior');
       var receptor_no_i = $(Receptor).find('cfdiDomicilio').attr('noInterior');
       var receptor_municipio = $(Receptor).find('cfdiDomicilio').attr('municipio');
       var receptor_cp = $(Receptor).find('cfdiDomicilio').attr('codigoPostal');
       var receptor_pais = $(Receptor).find('cfdiDomicilio').attr('pais');      
       
       $('#ClienteTablePreviewReceptor').append('<tr><td class = "FontTableReceptor">Receptor</td><td>'+receptor_nombre+' '+receptor_rfc+'</td></tr>');         
       $('#ClienteTablePreviewReceptor').append('<tr><td colspan = "3">'+receptor_calle+', No. interior '+receptor_no_i+', No. exterior '+receptor_no_e+', Col. '+receptor_colonia+','+receptor_municipio+', '+receptor_pais+' C.P.'+receptor_cp+'</td></tr>');
               
    //***************************Conceptos*********************************
    //***********************************************************************
    
    $('#cliente_div_preview_conceptos').empty();
    $('#cliente_div_preview_conceptos').append('<table  id = "ClienteTableConceptos" class = "tabla_conceptos"></table>');
    $('#ClienteTableConceptos').append('<thead><tr><th>Cantidad</th><th>Unidad</th><th>No. de Identificación</th><th>Descripción</th><th>Valor Unitario</th><th>Importe</th></tr></thead>');  
       
    $(Conceptos).find('cfdiConcepto').each(function()
    {
        var cantidad = $(this).attr('cantidad');
        var unidad = $(this).attr('unidad');
        var noide = $(this).attr('noIdentificacion');
        var descripcion = $(this).attr('descripcion');
        var valoru = $(this).attr('valorUnitario');
        var importe = $(this).attr('importe');

        valoru=formato_numero(valoru,2,'.',',');
        importe=formato_numero(importe,2,'.',',');

        $('#ClienteTableConceptos').append('<tr><td>'+cantidad+'</td><td>'+unidad+'</td><td>'+noide+'</td><td class = "descripcion">'+descripcion+'</td><td>'+valoru+'</td><td>'+importe+'</td></tr>');

     });
     
      /**********************************Totales de Conceptos**********************************/
      $('#cliente_div_preview_totales_conceptos').empty();
      $('#cliente_div_preview_totales_conceptos').append('<table id = "ClienteTableTotalesConceptos" align = "right"></table>');
      var subTotal = $(Comprobante).attr('subTotal');
      subTotal=formato_numero(subTotal,2,'.',',');
      var total = $(Comprobante).attr('total');
      $('#ClienteTableTotalesConceptos').append('<tr><td><left><b>SUBTOTAL</b></left></td><td>$'+subTotal+'</td></tr>');
      
      subTotal=parseFloat(subTotal);
      var tota_double=parseFloat(total);
      var iva=tota_double-subTotal;
      total=formato_numero(total,2,'.',',');
      
      $('#ClienteTableTotalesConceptos').append('<tr><td><left><b>IVA</b></left></td><td>$'+iva+'</td></tr>');
      $('#ClienteTableTotalesConceptos').append('<tr><td><left><b>TOTAL</b></left></td><td>$'+total+'</td></tr>');                  
      
      /**********************************Descripci�n de Pago**************************************/
      $('#cliente_div_preview_detalle_pago').empty();
      $('#cliente_div_preview_detalle_pago').append('<table id = "ClienteTableDescripcionPago"></table>');
      
      
      var formaDePago = $(Comprobante).attr('formaDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
//      var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
      var TipoCambio = $(Comprobante).attr('TipoCambio');
      var Moneda = $(Comprobante).attr('Moneda');                
      
      $('#ClienteTableDescripcionPago').append('<tr><td>Método de pago</td><td><b>'+metodoDePago+'</b></td>/tr>');
      $('#ClienteTableDescripcionPago').append('<tr><td>Forma de pago</td><td><b>'+formaDePago+'</b></td>/tr>');
      $('#ClienteTableDescripcionPago').append('<tr><td>Tipo de cambio</td><td><b>'+TipoCambio+'</b></td>/tr>');
      $('#ClienteTableDescripcionPago').append('<tr><td>Moneda</td><td><b>'+Moneda+'</b></td>/tr>');
                        
       //********************************Impuestos*********************************
       //*****************************************************************************   
      $('#cliente_impuestos').empty();
      $('#cliente_impuestos').append('<table id = "ClienteTableImpuestos" class = "tabla_conceptos"></table>');
      $('#ClienteTableImpuestos').append('<thead><tr><th>Impuesto</th><th>Tasa</th><th>Importe</th></tr></thead>');
      
      $(Impuestos).find('cfdiTraslados').each(function()
      {
          $(this).find('cfdiTraslado').each(function()
          {
              var Impuesto = $(this).attr('impuesto');
              var tasa = $(this).attr('tasa');
              var importe = $(this).attr('importe');
              
              $('#ClienteTableImpuestos').append('<tr><td>'+ importe +'</td><td>'+tasa+'</td><td>'+importe+'</td></tr>');
          });
      });
      
      var totalImpuestosTrasladados = $(Impuestos).attr('totalImpuestosTrasladados');
      $('#cliente_impuestos_totales').empty();
      $('#cliente_impuestos_totales').append('<table id = "ClienteTableImpuestosTotales" align = "right"></table>');
      $('#ClienteTableImpuestosTotales').append('<tr><td colspan = "2"><b>Total Impuestos Trasladados </b></td><td> $ '+totalImpuestosTrasladados+'</td></tr>');   
   
   
      /***************************** Cadena Original y Sello SAT ************************************/
      
      $('#cliente_div_preview_sello_digital').empty();
      
      var tabla_cadena_original=document.createElement('table');
      tabla_cadena_original.setAttribute('class','tabla_preview_sello_digital');
      var tr = document.createElement('tr');
      var td1=document.createElement('td');     
      
      var cadena_original = $(Comprobante).attr('sello');

      var text_area=document.createElement('textarea');
            
      td1.innerHTML="<center>SELLO DIGITAL DEL CFDI</center>";
      td1.setAttribute("class","celda_titulo");
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      tr = document.createElement('tr');
      td1=document.createElement('td');     
      td1.setAttribute("class","celda_sello_original");
      
      text_area.innerHTML=(cadena_original);
      text_area.setAttribute("class","textarea_sello_original");
      text_area.setAttribute("disabled","disabled");
      td1.appendChild(text_area);
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      $('#'+tipo+'cliente_div_preview_sello_digital').append(tabla_cadena_original);
      
/************************************Complemento de certificaci�n del sat*********************************/
    $('#cliente_div_preview_tfd').empty();
    $('#cliente_div_preview_tfd').append('<table id = "ClienteTableTfd" class = "tabla_complemento_certificacion"></table>');
    
    var version='';
    var folio_fiscal='';
    var fecha_timbrado='';
    var certificado_sat;
    
    $(Complemento).find('tfdTimbreFiscalDigital').each(function()
    {
        version = $(this).attr('version');
        folio_fiscal = $(this).attr('UUID');
        fecha_timbrado = $(this).attr('FechaTimbrado');
        certificado_sat = $(this).attr('noCertificadoSAT');
    });
    
    $('#ClienteTableTfd').append('<tr><td colspan = "4" class = "celda_titulo">TIMBRE FISCAL DIGITAL - COMPLEMENTO DE CERTIFICACION DEL SAT</td></tr>');
    $('#ClienteTableTfd').append('<tr><td colspan = "4"><br></td></tr>');
    $('#ClienteTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">VERSION</td><td>'+version+'</td colspan = "2"></tr>');
    $('#ClienteTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FOLIO FISCAL - UUID</td><td colspan = "2">'+folio_fiscal+'</td></tr>');
    $('#ClienteTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FECHA TIMBRADO</td><td colspan = "2">'+fecha_timbrado+'</td></tr>');          
    $('#ClienteTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">NO. CERTIFICADO SAT</td><td colspan = "2">'+certificado_sat+'</td></tr>');          

  }
            /*************************************************** 
             *          Content Recibos de Nómina              * 
             ***************************************************
             */

//Llenado de la vista previa del documento XML
  function display_xml(tipo,xml)
  {      
      //Se limpian los divs antes de comenzar a introducir información
      $('#'+tipo+'nomina_div_preview_emisor').empty();
                  
      var tabla =document.createElement("table");
       tabla.setAttribute("class", "tabla_preview_emisor");
       
       var tbBody = document.createElement("tbody");
        var tr1 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");  

      tabla.appendChild(tbBody);
      
      var emisor_nombre=xml.getElementsByTagName("Emisor")[0].getAttribute("nombre");   
      var emisor_rfc=xml.getElementsByTagName("Emisor")[0].getAttribute("rfc"); 
      var DomicilioFiscal=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("calle");
      var emisor_colonia=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("colonia");
      var emisor_estado=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("estado"); 
      var emisor_pais=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("pais");
      var emisor_no_ex=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("noExterior");
      var emisor_cp=xml.getElementsByTagName("DomicilioFiscal")[0].getAttribute("codigoPostal");
         
      var LugarExpedicion=xml.getElementsByTagName("Comprobante")[0].getAttribute("LugarExpedicion");  
         
      
         td1.innerHTML = emisor_nombre;
         td1.setAttribute("colspan","2");
         td1.setAttribute("class","preview_tabla_celda_emisor");
         tr1.appendChild(td1);	
         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>RFC:</font>";
         td1.innerHTML = emisor_rfc;
         
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>Calle:</font>";
         td1.innerHTML = DomicilioFiscal;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>Colonia:</font>";
         td1.innerHTML = emisor_colonia;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>Estado:</font>";
         td1.innerHTML = emisor_estado;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");

//         td1.innerHTML = "<font color =#464663>Pais:</font>";
         td1.setAttribute("colspan","2");
         td1.innerHTML = emisor_pais;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>No. exterior:</font>";
         td1.innerHTML ='No. exterior '+ emisor_no_ex;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>C.P.:</font>";
         td1.innerHTML ='C.P. '+ emisor_cp;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);

         
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td1.setAttribute("colspan","2");
//         td1.innerHTML = "<font color =#464663>LUGAR DE EXPEDICIÓN:</font>";
         td1.innerHTML = LugarExpedicion;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);
                           
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);
         
         $('#'+tipo+'nomina_div_preview_emisor').append(tabla);
      
      //*****************************************Detalle Desgloce ******************************************//
      
      $('#'+tipo+'nomina_div_preview_detalle').empty();            
      
      var tabla_detalle =document.createElement("table");
      tabla_detalle.setAttribute("align","right");

       tr1 = document.createElement("tr");
       td1 = document.createElement("td");
       td2 = document.createElement("td");  
       var td3 = document.createElement("td");      
              
      var fecha=xml.getElementsByTagName("Comprobante")[0].getAttribute("fecha");  
      var tipoDeComprobante=xml.getElementsByTagName("Comprobante")[0].getAttribute("tipoDeComprobante"); 
      var comprobante='Recibo de Nómina';
      var noCertificado=xml.getElementsByTagName("Comprobante")[0].getAttribute("noCertificado");            
       
         td1.innerHTML = "TIPO <br>COMPROBANTE";
         td2.innerHTML = "EFECTO CFDI";
         
         td1.setAttribute("class","celda_titulo");
         td2.setAttribute("class","celda_titulo");
         
         td2.setAttribute('colspan','2');
                  
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         
         tabla_detalle.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         
         td1.innerHTML = tipoDeComprobante;
         td2.innerHTML=comprobante;

         tr1.appendChild(td1);	
         tr1.appendChild(td2);
        
         tabla_detalle.appendChild(tr1);
         
                  
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         
         td1.innerHTML = "FECHA - HORA EMISION";
         
         td1.setAttribute("class","celda_titulo");
         td1.setAttribute('colspan','3');
         tr1.appendChild(td1);	
         
         tabla_detalle.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         
         td1.innerHTML = fecha;
         
         td1.setAttribute('colspan','3');
         tr1.appendChild(td1);	
         
         tabla_detalle.appendChild(tr1);                                                         
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         
         td1.innerHTML = "NO. CERTIFICADO CSD";
         td1.setAttribute("colspan","3");
         
         td1.setAttribute("class","celda_titulo");
         
         tr1.appendChild(td1);	
         
         tabla_detalle.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         
         td1.innerHTML ='<center>'+noCertificado+'</center>' ;
         td1.setAttribute("colspan","3");
      
         tr1.appendChild(td1);	

         
         tabla_detalle.appendChild(tr1);
                                                                      
         
      $('#'+tipo+'nomina_div_preview_detalle').append(tabla_detalle);
      
      //*************************************Receptor*******************************************/
      $('#nomina_div_preview_receptor').empty();
      var tabla_receptor=document.createElement('table');
       tabla_receptor.setAttribute("class", "tabla_preview_receptor");
//       th=document.createElement("th");
//       th.setAttribute("colspan", 4);
//       th.innerHTML="<font color =#464663>Detalle</font>";

       tbBody = document.createElement("tbody");
       tr1 = document.createElement("tr");
       td1 = document.createElement("td");
       td2 = document.createElement("td");  
       td3 = document.createElement("td");
       td4 = document.createElement("td");  
      
      
      var receptor_nombre=xml.getElementsByTagName("Receptor")[0].getAttribute("nombre");
      var receptor_rfc=xml.getElementsByTagName("Receptor")[0].getAttribute("rfc");
      var receptor_calle=xml.getElementsByTagName("Domicilio")[0].getAttribute("calle");
      var receptor_colonia=xml.getElementsByTagName("Domicilio")[0].getAttribute("colonia");   
      var receptor_no_e=xml.getElementsByTagName("Domicilio")[0].getAttribute("noExterior");
      var receptor_no_i=xml.getElementsByTagName("Domicilio")[0].getAttribute("noInterior");
      var receptor_municipio=xml.getElementsByTagName("Domicilio")[0].getAttribute("municipio");
      var receptor_cp=xml.getElementsByTagName("Domicilio")[0].getAttribute("codigoPostal");
      var receptor_pais=xml.getElementsByTagName("Domicilio")[0].getAttribute("pais");    
      
 
     tr1 = document.createElement("tr");
     td1 = document.createElement("td");

     td1.innerHTML = "<font color =#464663>Receptor </font> "+receptor_nombre+" <font color =#464663>RFC </font> "+receptor_rfc;

     tr1.appendChild(td1);	

     tbBody.appendChild(tr1);
     tabla_receptor.appendChild(tbBody);


     tr1 = document.createElement("tr");
     td1 = document.createElement("td");

     td1.innerHTML = receptor_calle+', No. interior '+receptor_no_i+', No. exterior '+receptor_no_e+', Col. '+receptor_colonia+','+receptor_municipio+', '+receptor_pais+' C.P.'+receptor_cp;

     tr1.appendChild(td1);	

     tbBody.appendChild(tr1);
     tabla_receptor.appendChild(tbBody);
     
     $('#'+tipo+'nomina_div_preview_receptor').append(tabla_receptor);
      
      
      
      //****************************EXPEDIDO EN *********************//  

//       tabla =document.createElement("table");
//       tabla.setAttribute("id", "tabla_preview_expedido");
//       th=document.createElement("th");
//       th.setAttribute("colspan", 2);
//       th.innerHTML="<font color =#464663>Expedido</font>";
//
//       tbBody = document.createElement("tbody");
//       tr1 = document.createElement("tr");
//       td1 = document.createElement("td");
//       td2 = document.createElement("td");  
//       td3 = document.createElement("td");
//       td4 = document.createElement("td");  
//      
//      tbBody.appendChild(th);
//      tabla.appendChild(tbBody);
//
//      
//      
//      var expedido_en=expe_calle=xml.getElementsByTagName("ExpedidoEn");
//      var expe_calle;
//      var expe_col;
//      var expe_no_ex;
//      var expe_cp;
//      var expe_estado;
//      var expe_pais;
//      for(cont=0;cont<expedido_en.length;cont++)
//          {             
//             expe_calle=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("calle");
//             expe_col=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("colonia");
//             expe_no_ex=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("noExterior");
//             expe_cp=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("codigoPostal");
//             expe_estado=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("estado");
//             expe_pais=xml.getElementsByTagName("ExpedidoEn")[cont].getAttribute("pais");
//             
//             td1.innerHTML = "<font color =#464663>Calle</font>";
//            td2.innerHTML = expe_calle;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);
//
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td1.innerHTML = "<font color =#464663>Colonia</font>";
//            td2.innerHTML = expe_col;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);
//
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td1.innerHTML = "<font color =#464663>No. exterior</font>";
//            td2.innerHTML = expe_no_ex;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);
//
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td1.innerHTML = "<font color =#464663>C.P.</font>";
//            td2.innerHTML = expe_cp;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);
//
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td1.innerHTML = "<font color =#464663>Estado</font>";
//            td2.innerHTML = expe_estado;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);
//
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td1.innerHTML = "<font color =#464663>Pais</font>";
//            td2.innerHTML = expe_pais;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2); 
//
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);   
//            $('#expedido').append(tabla);
//          }
      
      
         
       
     //*****************************DETALLE DESGLOCE *************************//
       
      $('#'+tipo+'nomina_div_preview_detalle_receptor').empty();
      
      var tabla_detalle_receptor1 =document.createElement("table");

       tr1 = document.createElement("tr");
       td1 = document.createElement("td");
       td2 = document.createElement("td");  
       td3 = document.createElement("td");
       var td4 = document.createElement("td");  
       var td5 = document.createElement("td");  
       var td6 = document.createElement("td");  
                    
      var RegistroPatronal=xml.getElementsByTagName("Nomina")[0].getAttribute("RegistroPatronal");
      var NumEmpleado=xml.getElementsByTagName("Nomina")[0].getAttribute("NumEmpleado");
      var curp=xml.getElementsByTagName("Nomina")[0].getAttribute("CURP");
      var TipoRegimen=xml.getElementsByTagName("Nomina")[0].getAttribute("TipoRegimen");
      var FechaPago=xml.getElementsByTagName("Nomina")[0].getAttribute("FechaPago");
      var FechaInicialPago=xml.getElementsByTagName("Nomina")[0].getAttribute("FechaInicialPago");
      var FechaFinalPago=xml.getElementsByTagName("Nomina")[0].getAttribute("FechaFinalPago");
      var NumDiasPagados=xml.getElementsByTagName("Nomina")[0].getAttribute("NumDiasPagados");
      var Departamento=xml.getElementsByTagName("Nomina")[0].getAttribute("Departamento");
      var CLABE=xml.getElementsByTagName("Nomina")[0].getAttribute("CLABE");
      
      var Banco=xml.getElementsByTagName("Nomina")[0].getAttribute("Banco");
      var FechaInicioRelLaboral=xml.getElementsByTagName("Nomina")[0].getAttribute("FechaInicioRelLaboral");
      var Antiguedad=xml.getElementsByTagName("Nomina")[0].getAttribute("Antiguedad");
      var Puesto=xml.getElementsByTagName("Nomina")[0].getAttribute("Puesto");
      var TipoContrato=xml.getElementsByTagName("Nomina")[0].getAttribute("TipoContrato");
      var TipoJornada=xml.getElementsByTagName("Nomina")[0].getAttribute("TipoJornada");
      var PeriodicidadPago=xml.getElementsByTagName("Nomina")[0].getAttribute("PeriodicidadPago");
      var SalarioBaseCotApor=xml.getElementsByTagName("Nomina")[0].getAttribute("SalarioBaseCotApor");
      SalarioBaseCotApor=formato_numero(SalarioBaseCotApor,2,'.',',');
      var RiesgoPuesto=xml.getElementsByTagName("Nomina")[0].getAttribute("RiesgoPuesto");
      var SalarioDiarioIntegrado=xml.getElementsByTagName("Nomina")[0].getAttribute("SalarioDiarioIntegrado");
      SalarioDiarioIntegrado=formato_numero(SalarioDiarioIntegrado,2,'.',',');
      
       
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");
         td6 = document.createElement("td");
         td1.innerHTML = "<font color =#464663>REGISTRO PATRONAL</font>";
         td2.innerHTML = RegistroPatronal;
         td3.innerHTML = "<font color =#464663>NO. DE EMPLEADO</font>";
         td4.innerHTML = NumEmpleado;
         td5.innerHTML = "<font color =#464663>BANCO</font>";
         td6.innerHTML = Banco;
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4); 
         tr1.appendChild(td5); 
         tr1.appendChild(td6); 
         tabla_detalle_receptor1.appendChild(tr1);

         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");
         td6 = document.createElement("td");
         td1.innerHTML = "<font color =#464663>CURP</font>";
         td2.innerHTML = curp;
         td3.innerHTML = "<font color =#464663>TIPO DE REGIMEN</font>";
         td4.innerHTML = TipoRegimen;
         td5.innerHTML = "<font color =#464663>FECHA INICIO REL. LABORAL</font>";
         td6.innerHTML = FechaInicioRelLaboral;
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4);  
         tr1.appendChild(td5);
         tr1.appendChild(td6);
         tabla_detalle_receptor1.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");
         td6 = document.createElement("td");
         
         td1.innerHTML = "<font color =#464663>FECHA PAGO</font>";
         td2.innerHTML = FechaPago;
         td3.innerHTML = "<font color =#464663>FECHA INICIAL PAGO</font>";
         td4.innerHTML = FechaInicialPago;
         td5.innerHTML = "<font color =#464663>ANTIGUEDAD</font>";
         td6.innerHTML = Antiguedad;
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4);
         tr1.appendChild(td5);
         tr1.appendChild(td6);
         tabla_detalle_receptor1.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");
         td6 = document.createElement("td");
         
         td1.innerHTML = "<font color =#464663>FECHA FINAL PAGO</font>";
         td2.innerHTML = FechaFinalPago;
         td3.innerHTML = "<font color =#464663>NO. DIAS PAGADOS</font>";
         td4.innerHTML = NumDiasPagados;
         td5.innerHTML = "<font color =#464663>PUESTO</font>";
         td6.innerHTML = Puesto;
         
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4);         
         tr1.appendChild(td5);         
         tr1.appendChild(td6);         
         tabla_detalle_receptor1.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td1.innerHTML = "<font color =#464663>DEPARTAMENTO</font>";
         td2.innerHTML = Departamento;
         td3.innerHTML = "<font color =#464663>CLABE</font>";
         td4.innerHTML = CLABE;
         td5.innerHTML = "<font color =#464663>TIPO DE CONTRATO</font>";
         td6.innerHTML = TipoContrato;
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4);         
         tr1.appendChild(td5);         
         tr1.appendChild(td6);         
         tabla_detalle_receptor1.appendChild(tr1);
         
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");
         td6 = document.createElement("td");
         td1.innerHTML = "<font color =#464663>TIPO DE JORNADA</font>";
         td2.innerHTML = TipoJornada;
         td3.innerHTML = "<font color =#464663>PERIODICIDAD</font>";
         td4.innerHTML = PeriodicidadPago;
         td5.innerHTML = "<font color =#464663>SALARIO BASE COT. APOR.</font>";
         td6.innerHTML = SalarioBaseCotApor;
         tr1.appendChild(td1);	
         tr1.appendChild(td2);
         tr1.appendChild(td3);	
         tr1.appendChild(td4);         
         tr1.appendChild(td5);         
         tr1.appendChild(td6);         
         tabla_detalle_receptor1.appendChild(tr1);                                                                
      
        tr1 = document.createElement("tr");
        td1 = document.createElement("td");
        td2 = document.createElement("td");
        td3 = document.createElement("td");
        td4 = document.createElement("td");
        td5 = document.createElement("td");
        td6 = document.createElement("td");
        
        td1.innerHTML = "<font color =#464663>RIESGO PUESTO</font>";
        td2.innerHTML = RiesgoPuesto;        
        td3.innerHTML = "";
        td4.innerHTML = '';
        td5.innerHTML = "<font color =#464663>SALARIO DIARIO INTEGRADO</font>";
        td6.innerHTML = SalarioDiarioIntegrado;
        tr1.appendChild(td1);	
        tr1.appendChild(td2);
        tr1.appendChild(td3);	
        tr1.appendChild(td4);   
        tr1.appendChild(td5);         
        tr1.appendChild(td6);  
        tabla_detalle_receptor1.appendChild(tr1);
      
      $('#'+tipo+'nomina_div_preview_detalle_receptor').append(tabla_detalle_receptor1);
      
//
//    //***************************PERCEPCIONES*********************************
//    //***********************************************************************
//    
//    
//    
      $('#'+tipo+'nomina_div_preview_percepciones_deducciones').empty();

       tabla =document.createElement("table");
//       tabla.setAttribute('align','center');
       tabla.setAttribute('class','tabla_conceptos');
      tr1=document.createElement('tr');
      
      var th1=document.createElement('th');
      var th2=document.createElement('th');
      var th3=document.createElement('th');
      var th4=document.createElement('th');
      var th5=document.createElement('th');
      
      th1.innerHTML='TIPO';
      th2.innerHTML='CLAVE';
      th3.innerHTML='DESCRIPCION';
      th4.innerHTML='PERCEPCION';
      th5.innerHTML='DEDUCCION';
      
      tr1.appendChild(th1);
      tr1.appendChild(th2);
      tr1.appendChild(th3);
      tr1.appendChild(th4);
      tr1.appendChild(th5);
      
      tabla.appendChild(tr1);
     
      
      
       tbBody = document.createElement("tbody");                             
       
       var root=xml.getElementsByTagName("Percepcion");
     for (i=0;i<root.length;i++) 
     {          
         tr1 = document.createElement("tr");
         td1 = document.createElement("td");
         td2 = document.createElement("td");
         td3 = document.createElement("td");
         td4 = document.createElement("td");
         td5 = document.createElement("td");        
        
         var percepcion_tipo=xml.getElementsByTagName("Percepcion")[i].getAttribute("TipoPercepcion"); 
         var Clave=xml.getElementsByTagName("Percepcion")[i].getAttribute("Clave");
         var Concepto=xml.getElementsByTagName("Percepcion")[i].getAttribute("Concepto");
         var ImporteGravado=xml.getElementsByTagName("Percepcion")[i].getAttribute("ImporteGravado");
         ImporteGravado=formato_numero(ImporteGravado,2,'.',',');
         var ImporteExento=xml.getElementsByTagName("Percepcion")[i].getAttribute("ImporteExento");
         ImporteExento=formato_numero(ImporteExento,2,'.',',');
         
         td1.innerHTML = percepcion_tipo;
         td2.innerHTML = Clave;
         td3.innerHTML = Concepto;
         td4.innerHTML = "$ "+ImporteGravado;
//         td5.innerHTML = "$ "+ImporteExento;
        td5.innerHTML = '';
         
         td3.setAttribute('class','descripcion');
         
         
         tr1.appendChild(td1);	
         tr1.appendChild(td2);	
         tr1.appendChild(td3);
         tr1.appendChild(td4);	
//         tr1.appendChild(td5);
         tr1.appendChild(td5);
         tbBody.appendChild(tr1);
         tabla.appendChild(tbBody);  
     }                                               
      
//      
//       //********************************DEDUCCIONES*********************************
//       //*****************************************************************************
    
      var tabla_deducciones =document.createElement("table");
      tabla_deducciones.setAttribute("id", "tabla_percepciones");
      
      var deducc_tbBody = document.createElement("tbody");     

                     
       var root_deducc=xml.getElementsByTagName("Deduccion");
     for (i=0;i<root_deducc.length;i++) 
     {          
        var deducc_tr = document.createElement("tr");
        var deducc_td1 = document.createElement("td");
        var deducc_td2 = document.createElement("td");
        var deducc_td3 = document.createElement("td");
        var deducc_td4 = document.createElement("td");
        var deducc_td5 = document.createElement("td");
        
        
         var deducc_tipo=xml.getElementsByTagName("Deduccion")[i].getAttribute("TipoDeduccion"); 
         var deducc_Clave=xml.getElementsByTagName("Deduccion")[i].getAttribute("Clave");
         var deducc_Concepto=xml.getElementsByTagName("Deduccion")[i].getAttribute("Concepto");
         var deducc_ImporteGravado=xml.getElementsByTagName("Deduccion")[i].getAttribute("ImporteGravado");
         deducc_ImporteGravado=formato_numero(deducc_ImporteGravado,2,'.',',');
         var deducc_ImporteExento=xml.getElementsByTagName("Deduccion")[i].getAttribute("ImporteExento");
         deducc_ImporteExento=formato_numero(deducc_ImporteExento,2,'.',',');

         deducc_td1.innerHTML = deducc_tipo;
         deducc_td2.innerHTML = deducc_Clave;
         deducc_td3.innerHTML = deducc_Concepto;
//         deducc_td4.innerHTML = "$"+deducc_ImporteGravado;
//         deducc_td5.innerHTML = "$"+deducc_ImporteExento;  
        deducc_td4.innerHTML = "";
        deducc_td5.innerHTML = "$"+deducc_ImporteGravado;
        
        deducc_td3.setAttribute('class','descripcion');
         
         deducc_tr.appendChild(deducc_td1);	
         deducc_tr.appendChild(deducc_td2);	
         deducc_tr.appendChild(deducc_td3);
         deducc_tr.appendChild(deducc_td4);	
         deducc_tr.appendChild(deducc_td5);
         deducc_tbBody.appendChild(deducc_tr);
         tabla.appendChild(deducc_tbBody);  
     }           
     
     
     
      $('#'+tipo+'nomina_div_preview_percepciones_deducciones').append(tabla);
      
      /*        Totales de las deducciones y precepciones */
      $('#'+tipo+'nomina_div_preview_totales_conceptos').empty();
      
      
      
      
      var percep_TotalGravado=xml.getElementsByTagName("Percepciones")[0].getAttribute("TotalGravado");
      percep_TotalGravado=formato_numero(percep_TotalGravado,2,'.',',');
      var percep_TotalExento=xml.getElementsByTagName("Percepciones")[0].getAttribute("TotalExento");
      percep_TotalExento=formato_numero(percep_TotalExento,2,'.',',');
      
      var deducc_TotalGravado=xml.getElementsByTagName("Deducciones")[0].getAttribute("TotalGravado"); 
      deducc_TotalGravado=formato_numero(deducc_TotalGravado,2,'.',',');
      var deducc_TotalExento=xml.getElementsByTagName("Percepciones")[0].getAttribute("TotalExento");
      deducc_TotalExento=formato_numero(deducc_TotalExento,2,'.',',');
      
      var impuestos=xml.getElementsByTagName("Impuestos")[0].getAttribute("totalImpuestosRetenidos");
      impuestos=formato_numero(impuestos,2,'.',',');
      
      var neto_recibido=xml.getElementsByTagName("Comprobante")[0].getAttribute("total");
      neto_recibido=formato_numero(neto_recibido,2,'.',',');
      
      
      
      
      
      var tabla_totales_nomina=document.createElement('table');
      tabla_totales_nomina.setAttribute("align","right");
      
      tr1=document.createElement('tr');
      td1=document.createElement('td');
      td2=document.createElement('td');
      
      td1.innerHTML='<b>PERCEPCIONES</b>';
      td2.innerHTML='$'+percep_TotalGravado;
      
      tr1.appendChild(td1);
      tr1.appendChild(td2);
      
      tabla_totales_nomina.appendChild(tr1);
      
      tr1=document.createElement('tr');
      td1=document.createElement('td');
      td2=document.createElement('td');
      
      td1.innerHTML='<b>DEDUCCIONES</b>';
      td2.innerHTML='$'+deducc_TotalGravado;
      
      tr1.appendChild(td1);
      tr1.appendChild(td2);
      
      tabla_totales_nomina.appendChild(tr1);
      
      tr1=document.createElement('tr');
      td1=document.createElement('td');
      td2=document.createElement('td');
      
      td1.innerHTML='<b>-IMPUESTOS RETENIDOS</b>';
      td2.innerHTML='$'+impuestos;
      
      tr1.appendChild(td1);
      tr1.appendChild(td2);
      
      tabla_totales_nomina.appendChild(tr1);
      
      tr1=document.createElement('tr');
      td1=document.createElement('td');
      td2=document.createElement('td');
      
      td1.innerHTML='<b>NETO RECIBIDO</b>';
      td2.innerHTML='$'+neto_recibido;
      
      tr1.appendChild(td1);
      tr1.appendChild(td2);
      
      tabla_totales_nomina.appendChild(tr1);
      
      $('#'+tipo+'nomina_div_preview_totales_conceptos').append(tabla_totales_nomina);
      
      /*                            Detalle de Pago                         */
      
      $('#'+tipo+'nomina_div_preview_detalle_pago').empty();
      
      var formaDePago=xml.getElementsByTagName("Comprobante")[0].getAttribute("formaDePago");  
      var metodoDePago=xml.getElementsByTagName("Comprobante")[0].getAttribute("metodoDePago");  
      var tipoDeComprobante=xml.getElementsByTagName("Comprobante")[0].getAttribute("tipoDeComprobante");  
      var Moneda=xml.getElementsByTagName("Comprobante")[0].getAttribute("Moneda");  
      var cuenta_bancaria=xml.getElementsByTagName("Comprobante")[0].getAttribute("NumCtaPago");  
      
      
      var tabla_nomina_descripcion_pago=document.createElement('table');
      var tr=document.createElement('tr');
      var td1=document.createElement('td');
      var td2=document.createElement('td');
      
      td1.innerHTML="<left>METODO DE PAGO:</left>";
      td2.innerHTML='<b>'+metodoDePago+'</b>';
      tr.appendChild(td1);
      tr.appendChild(td2);
      tabla_nomina_descripcion_pago.appendChild(tr);
      
      
      tr=document.createElement('tr');
      td1=document.createElement('td');
      td2=document.createElement('td');
      
      td1.innerHTML="<left>FORMA DE PAGO:</left>";
      td2.innerHTML='<b>'+formaDePago+'</b>';
      tr.appendChild(td1);
      tr.appendChild(td2);
      tabla_nomina_descripcion_pago.appendChild(tr);            
      
      var tr=document.createElement('tr');
      var td1=document.createElement('td');
      var td2=document.createElement('td');
      
      td1.innerHTML="<left>MONEDA</left>";
      td2.innerHTML='<b>'+Moneda+'<b>';
      tr.appendChild(td1);
      tr.appendChild(td2);
      tabla_nomina_descripcion_pago.appendChild(tr);
      
      var tr=document.createElement('tr');
      var td1=document.createElement('td');
      var td2=document.createElement('td');
      
      td1.innerHTML="<left>CUENTA BANCARIA</left>";
      td2.innerHTML='<b>'+cuenta_bancaria+'<b>';
      tr.appendChild(td1);
      tr.appendChild(td2);
      tabla_nomina_descripcion_pago.appendChild(tr);
      
      $('#'+tipo+'nomina_div_preview_detalle_pago').append(tabla_nomina_descripcion_pago);
      
       /***************************** Cadena Original y Sello SAT ************************************/
      
      $('#'+tipo+'nomina_div_preview_sello_digital').empty();
      
      var tabla_cadena_original=document.createElement('table');
      tabla_cadena_original.setAttribute('class','tabla_preview_sello_digital');
      var tr = document.createElement('tr');
      var td1=document.createElement('td');     
      
      var cadena_original = xml.getElementsByTagName("Comprobante")[0].getAttribute("sello");

      var text_area=document.createElement('textarea');
      
      
      td1.innerHTML="<center>SELLO DIGITAL DEL CFDI</center>";
      td1.setAttribute("class","celda_titulo");
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      tr = document.createElement('tr');
      td1=document.createElement('td');     
      td1.setAttribute("class","celda_sello_original");
      
      text_area.innerHTML=(cadena_original);
      text_area.setAttribute("class","textarea_sello_original");
      text_area.setAttribute("disabled","disabled");
      td1.appendChild(text_area);
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      $('#'+tipo+'nomina_div_preview_sello_digital').append(tabla_cadena_original);
      
/************************************Complemento de certificaci�n del sat*********************************/

    $('#'+tipo+'nomina_div_preview_complemento_certificacion').empty();
    var tabla_complemento_certificacion=document.createElement('table');
    tabla_complemento_certificacion.setAttribute('class','tabla_complemento_certificacion');
    var version='';
    var folio_fiscal='';
    var fecha_timbrado='';
    var certificado_sat;
    if( xml.getElementsByTagName('TimbreFiscalDigital').length>0)
    {
        version=xml.getElementsByTagName("TimbreFiscalDigital")[0].getAttribute("version");
        folio_fiscal=xml.getElementsByTagName("TimbreFiscalDigital")[0].getAttribute("UUID");
        fecha_timbrado=xml.getElementsByTagName("TimbreFiscalDigital")[0].getAttribute("FechaTimbrado");
        certificado_sat=xml.getElementsByTagName("TimbreFiscalDigital")[0].getAttribute("noCertificadoSAT");
    }
    
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    
    td1.setAttribute("class","celda_titulo");
    td1.innerHTML='TIMBRE FISCAL DIGITAL - COMPLEMENTO DE CERTIFICACION DEL SAT';
    td1.setAttribute('colspan','4');
    tr1.appendChild(td1);
    tabla_complemento_certificacion.appendChild(tr1);
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    td2=document.createElement('td');
    td3=document.createElement('td');
    
    td1.innerHTML='<br>';
    td2.innerHTML='<br>';
    td3.setAttribute('colspan','2');
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    
    tabla_complemento_certificacion.appendChild(tr1);
    
    
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    td2=document.createElement('td');
    td3=document.createElement('td');
    
    
    td1.setAttribute("class","celda_titulo");
    td1.innerHTML='VERSION';
    td2.innerHTML=version;
    td3.setAttribute('colspan','2');
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    
    tabla_complemento_certificacion.appendChild(tr1);
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    td2=document.createElement('td');
    td3=document.createElement('td');
    
    td1.setAttribute("class","celda_titulo");
    td1.innerHTML='FOLIO FISCAL - UUID';
    td2.innerHTML=folio_fiscal;
    td3.setAttribute('colspan','2');
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    
    tabla_complemento_certificacion.appendChild(tr1);
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    td2=document.createElement('td');
    td3=document.createElement('td');
    
    
    td1.setAttribute("class","celda_titulo");
    td1.innerHTML='FECHA TIMBRADO';
    td2.innerHTML=fecha_timbrado;
    td3.setAttribute('colspan','2');
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    
    tabla_complemento_certificacion.appendChild(tr1);
    
    tr1=document.createElement('tr');
    td1=document.createElement('td');
    td2=document.createElement('td');
    td3=document.createElement('td');
    
    td1.setAttribute("class","celda_titulo");
    td1.innerHTML='NO. CERTIFICADO SAT';
    td2.innerHTML=certificado_sat;
    td3.setAttribute('colspan','2');
    
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    
    tabla_complemento_certificacion.appendChild(tr1);
    $('#'+tipo+'nomina_div_preview_complemento_certificacion').append(tabla_complemento_certificacion);
      
      
      
//      
//      //************************INCAPACIDADES***********************
//      
//      
//      
//       tabla =document.createElement("table");
//       tabla.setAttribute("id", "tabla_hrs_inc");
//      
//       tbBody = document.createElement("tbody");
//       tr1 = document.createElement("tr");    
//          th1=document.createElement("th");
//          th2=document.createElement("th");
//          th3=document.createElement("th");
//  
//       th1.innerHTML="<font color =#464663>Dias de Incapacidad</font>";      
//       th2.innerHTML="<font color =#464663>Titpo de Incapacidad</font>";       
//       th3.innerHTML="<font color =#464663>Tipo de Descuento</font>";             
//              
//        tbBody.appendChild(th1);
//        tbBody.appendChild(th2);
//        tbBody.appendChild(th3);
//        tabla.appendChild(tbBody);  
//      
//      
//      var incapacidades=xml.getElementsByTagName("Incapacidad");
//      for(var cont=0; cont<incapacidades.length; cont++)
//          {
//            var DiasIncapacidad=xml.getElementsByTagName("Incapacidad")[cont].getAttribute("Descuento");
//            var TipoIncapacidad=xml.getElementsByTagName("Incapacidad")[cont].getAttribute("DiasIncapacidad");
//            var Descuento=xml.getElementsByTagName("Incapacidad")[cont].getAttribute("TipoIncapacidad");
//               
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td3 = document.createElement("td");         
//            td1.innerHTML = DiasIncapacidad;
//            td2.innerHTML = TipoIncapacidad;
//            td3.innerHTML = "$ "+Descuento;         
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2);
//            tr1.appendChild(td3);	 
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);      
//          }                                                  
//      
//      incapacidad.appendChild(tabla);
//          
//      //************************Horas Extra*********************************
//      
//      
//      tabla =document.createElement("table");
//       tabla.setAttribute("id", "tabla_hrs_inc");
//      
//       tbBody = document.createElement("tbody");
//       tr1 = document.createElement("tr");    
//       th1=document.createElement("th");
//       th2=document.createElement("th");
//       th3=document.createElement("th");
//       th4=document.createElement("th");   
//  
//       th1.innerHTML="<font color =#464663>Dias</font>";      
//       th2.innerHTML="<font color =#464663>Tipo de Horas</font>";       
//       th3.innerHTML="<font color =#464663>Horas Extra</font>"; 
//       th4.innerHTML="<font color =#464663>Importe Pagado</font>";
//              
//        tbBody.appendChild(th1);
//        tbBody.appendChild(th2);
//        tbBody.appendChild(th3);
//        tbBody.appendChild(th4);
//        tabla.appendChild(tbBody);  
//      
//      var horas=xml.getElementsByTagName("HorasExtra");
//      for(cont=0; cont<horas.length; horas++)
//          {
//            var Dias=xml.getElementsByTagName("HorasExtra")[cont].getAttribute("Dias");
//            var TipoHoras=xml.getElementsByTagName("HorasExtra")[cont].getAttribute("TipoHoras");
//            var hrs_extra=xml.getElementsByTagName("HorasExtra")[cont].getAttribute("HorasExtra");
//            var ImportePagado=xml.getElementsByTagName("HorasExtra")[cont].getAttribute("ImportePagado");                       
//       
//            tr1 = document.createElement("tr");
//            td1 = document.createElement("td");
//            td2 = document.createElement("td");
//            td3 = document.createElement("td");  
//            td4 = document.createElement("td");
//            td1.innerHTML = Dias;
//            td2.innerHTML = TipoHoras;
//            td3.innerHTML = hrs_extra;  
//            td4.innerHTML="$ "+ImportePagado;
//            tr1.appendChild(td1);	
//            tr1.appendChild(td2);
//            tr1.appendChild(td3);
//            tr1.appendChild(td4);
//            tbBody.appendChild(tr1);
//            tabla.appendChild(tbBody);       
//          }                           
//            
//      hrs.appendChild(tabla);
  }
  
  
  var Preview = function()
  {
      
  };
  
  Preview.prototype.CfdiPreview = function(tipo, xml)
  {
      var  Conceptos, Acuse, Impuestos, Complemento;
      var Emisor = $(xml).children().find('cfdiEmisor');
      var Receptor = $(xml).children().find('cfdiReceptor');
      var Conceptos = $(xml).children().find('cfdiConceptos');
      var Impuestos = $(xml).children().find('cfdiImpuestos');
      var Complemento = $(xml).children().find('cfdiComplemento');
      var Comprobante = $(xml).find('cfdiComprobante');
      
      $('#PreviewHistorical_emisor').empty();
      $('#PreviewHistorical_emisor').append('<table id = "HistoricalTableEmisor" class = "tabla_preview_emisor"></table>');
                       
      var emisor_nombre = $(Emisor).attr('nombre');
      var emisor_rfc = $(Emisor).attr('rfc');

      $(Emisor).find('cfdiDomicilioFiscal').each(function()
      {                
            var DomicilioFiscal = $(this).attr('calle');
            var emisor_colonia = $(this).attr('calle');
            var emisor_colonia = $(this).attr('colonia');
            var emisor_estado = $(this).attr('estado');
            var emisor_pais = $(this).attr('pais');
            var emisor_no_ex = $(this).attr('noExterior');
            var emisor_cp = $(this).attr('codigoPostal');
            
            $('#HistoricalTableEmisor').append('<tr><td class = "preview_tabla_celda_emisor" colspan = "2">'+emisor_nombre+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_rfc+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+DomicilioFiscal+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_colonia+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_estado+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_pais+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_no_ex+'</td></tr>');
            $('#HistoricalTableEmisor').append('<tr><td colspan = "2">'+emisor_cp+'</td></tr>');            
      });         
     
//*****************************DETALLE DESGLOCE *************************//

    var serie = $(Comprobante).attr('serie');
    var folio = $(Comprobante).attr('folio');
    var fecha = $(Comprobante).attr('fecha');
    var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
    var comprobante='Factura';
    var noCertificado = $(Comprobante).attr('noCertificado');

     $('#PreviewHistorical_detalle').empty();
     $('#PreviewHistorical_detalle').append('<table align = "right" id = "PreviewHistoricalTableDetalle"></table>');
     $('#PreviewHistoricalTableDetalle').append('<tr><td class = "celda_titulo">Serie</td><td class = "celda_titulo">Folio</td></tr>');
     $('#PreviewHistoricalTableDetalle').append('<tr><td>'+serie+'</td><td>'+folio+'</td></tr>');
     $('#PreviewHistoricalTableDetalle').append('<tr><td class = "celda_titulo">Efecto cfdi</td><td class = "celda_titulo">No. certificado CSD</td></tr>');
     $('#PreviewHistoricalTableDetalle').append('<tr><td>'+tipoDeComprobante+'</td><td>'+noCertificado+'</td></tr>');                  
     $('#PreviewHistoricalTableDetalle').append('<tr><td class = "celda_titulo">Tipo Comprobante</td><td class = "celda_titulo">Fecha - Hora - Emisión</td></tr>');
     $('#PreviewHistoricalTableDetalle').append('<tr><td>'+comprobante+'</td><td>'+fecha+'</td></tr>');          


      /*********************************Receptor ***************************/
      
       $("#PreviewHistorical_receptor").empty();
       $('#PreviewHistorical_receptor').append('<table id = "PreviewHistoricalTablePreviewReceptor" class = "tabla_preview_receptor"></table>');
       
      
       var receptor_nombre = $(Receptor).attr('nombre');
       var receptor_rfc = $(Receptor).attr('rfc');
       var receptor_calle = $(Receptor).find('cfdiDomicilio').attr('calle');
       var receptor_colonia = $(Receptor).find('cfdiDomicilio').attr('colonia');
       var receptor_no_e = $(Receptor).find('cfdiDomicilio').attr('noExterior');
       var receptor_no_i = $(Receptor).find('cfdiDomicilio').attr('noInterior');
       var receptor_municipio = $(Receptor).find('cfdiDomicilio').attr('municipio');
       var receptor_cp = $(Receptor).find('cfdiDomicilio').attr('codigoPostal');
       var receptor_pais = $(Receptor).find('cfdiDomicilio').attr('pais');      
       
       $('#PreviewHistoricalTablePreviewReceptor').append('<tr><td class = "FontTableReceptor">Receptor</td><td>'+receptor_nombre+' '+receptor_rfc+'</td></tr>');         
       $('#PreviewHistoricalTablePreviewReceptor').append('<tr><td colspan = "3">'+receptor_calle+', No. interior '+receptor_no_i+', No. exterior '+receptor_no_e+', Col. '+receptor_colonia+','+receptor_municipio+', '+receptor_pais+' C.P.'+receptor_cp+'</td></tr>');
   
    //***************************Conceptos*********************************
    //***********************************************************************
    $('#PreviewHistorical_conceptos').empty();
    $('#PreviewHistorical_conceptos').append('<table  id = "PreviewHistoricalTableConceptos" class = "tabla_conceptos"></table>');
    $('#PreviewHistoricalTableConceptos').append('<thead><tr><th>Cantidad</th><th>Unidad</th><th>No. de Identificación</th><th>Descripción</th><th>Valor Unitario</th><th>Importe</th></tr></thead>');  
       
    $(Conceptos).find('cfdiConcepto').each(function()
    {
        var cantidad = $(this).attr('cantidad');
        var unidad = $(this).attr('unidad');
        var noide = $(this).attr('noIdentificacion');
        var descripcion = $(this).attr('descripcion');
        var valoru = $(this).attr('valorUnitario');
        var importe = $(this).attr('importe');

        valoru=formato_numero(valoru,2,'.',',');
        importe=formato_numero(importe,2,'.',',');

        $('#PreviewHistoricalTableConceptos').append('<tr><td>'+cantidad+'</td><td>'+unidad+'</td><td>'+noide+'</td><td class = "descripcion">'+descripcion+'</td><td>'+valoru+'</td><td>'+importe+'</td></tr>');

     });
     
      
      /**********************************Totales de Conceptos**********************************/
      $('#PreviewHistorical_totales_conceptos').empty();
      $('#PreviewHistorical_totales_conceptos').append('<table id = "PreviewHistoricalTableTotalesConceptos" align = "right"></table>');
      var subTotal = $(Comprobante).attr('subTotal');
      subTotal=formato_numero(subTotal,2,'.',',');
      var total = $(Comprobante).attr('total');
      $('#PreviewHistoricalTableTotalesConceptos').append('<tr><td><left><b>SUBTOTAL</b></left></td><td>$'+subTotal+'</td></tr>');
      
      subTotal=parseFloat(subTotal);
      var tota_double=parseFloat(total);
      var iva=tota_double-subTotal;
      total=formato_numero(total,2,'.',',');
      
      $('#PreviewHistoricalTableTotalesConceptos').append('<tr><td><left><b>IVA</b></left></td><td>$'+iva+'</td></tr>');
      $('#PreviewHistoricalTableTotalesConceptos').append('<tr><td><left><b>TOTAL</b></left></td><td>$'+total+'</td></tr>');
      
      /**********************************Descripci�n de Pago**************************************/
      $('#PreviewHistorical_detalle_pago').empty();
      $('#PreviewHistorical_detalle_pago').append('<table id = "PreviewHistoricalDescripcionPago"></table>');
      
      
      var formaDePago = $(Comprobante).attr('formaDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
      var metodoDePago = $(Comprobante).attr('metodoDePago');
//      var tipoDeComprobante = $(Comprobante).attr('tipoDeComprobante');
      var TipoCambio = $(Comprobante).attr('TipoCambio');
      var Moneda = $(Comprobante).attr('Moneda');                
      
      $('#PreviewHistoricalDescripcionPago').append('<tr><td>Método de pago</td><td><b>'+metodoDePago+'</b></td>/tr>');
      $('#PreviewHistoricalDescripcionPago').append('<tr><td>Forma de pago</td><td><b>'+formaDePago+'</b></td>/tr>');
      $('#PreviewHistoricalDescripcionPago').append('<tr><td>Tipo de cambio</td><td><b>'+TipoCambio+'</b></td>/tr>');
      $('#PreviewHistoricalDescripcionPago').append('<tr><td>Moneda</td><td><b>'+Moneda+'</b></td>/tr>');
           
      
       //********************************Impuestos*********************************
       //*****************************************************************************   
      
      $('#PreviewHistorical_impuestos').empty();
      $('#PreviewHistorical_impuestos').append('<table id = "PreviewHistoricalTableImpuestos" class = "tabla_conceptos"></table>');
      $('#PreviewHistoricalTableImpuestos').append('<thead><tr><th>Impuesto</th><th>Tasa</th><th>Importe</th></tr></thead>');
      
      $(Impuestos).find('cfdiTraslados').each(function()
      {
          $(this).find('cfdiTraslado').each(function()
          {
              var Impuesto = $(this).attr('impuesto');
              var tasa = $(this).attr('tasa');
              var importe = $(this).attr('importe');
              
              $('#PreviewHistoricalTableImpuestos').append('<tr><td>'+ importe +'</td><td>'+tasa+'</td><td>'+importe+'</td></tr>');
          });
      });
      var totalImpuestosTrasladados = $(Impuestos).attr('totalImpuestosTrasladados');
      $('#PreviewHistorical_impuestos_totales').empty();
      $('#PreviewHistorical_impuestos_totales').append('<table id = "PreviewHistoricalTableImpuestosTotales" align = "right"></table>');
      $('#PreviewHistoricalTableImpuestosTotales').append('<tr><td colspan = "2"><b>Total Impuestos Trasladados </b></td><td> $ '+totalImpuestosTrasladados+'</td></tr>');

      /***************************** Cadena Original y Sello SAT ************************************/
      
      $('#PreviewHistorical_sello_digital').empty();
      
      var tabla_cadena_original=document.createElement('table');
      tabla_cadena_original.setAttribute('class','tabla_preview_sello_digital');
      var tr = document.createElement('tr');
      var td1=document.createElement('td');     
      
      var cadena_original = $(Comprobante).attr('sello');

      var text_area=document.createElement('textarea');
            
      td1.innerHTML="<center>SELLO DIGITAL DEL CFDI</center>";
      td1.setAttribute("class","celda_titulo");
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      tr = document.createElement('tr');
      td1=document.createElement('td');     
      td1.setAttribute("class","celda_sello_original");
      
      text_area.innerHTML=(cadena_original);
      text_area.setAttribute("class","textarea_sello_original");
      text_area.setAttribute("disabled","disabled");
      td1.appendChild(text_area);
            
      tr.appendChild(td1);      
      tabla_cadena_original.appendChild(tr);
      
      $('#PreviewHistorical_sello_digital').append(tabla_cadena_original);
      
/************************************Complemento de certificaci�n del sat*********************************/

    $('#PreviewHistorical_tfd').empty();
    $('#PreviewHistorical_tfd').append();
    $('#PreviewHistorical_tfd').append('<table id = "PreviewHistoricalTableTfd" class = "tabla_complemento_certificacion"></table>');
    
    var version='';
    var folio_fiscal='';
    var fecha_timbrado='';
    var certificado_sat;
    
    $(Complemento).find('tfdTimbreFiscalDigital').each(function()
    {
        version = $(this).attr('version');
        folio_fiscal = $(this).attr('UUID');
        fecha_timbrado = $(this).attr('FechaTimbrado');
        certificado_sat = $(this).attr('noCertificadoSAT');
    });
    
    $('#PreviewHistoricalTableTfd').append('<tr><td colspan = "4" class = "celda_titulo">TIMBRE FISCAL DIGITAL - COMPLEMENTO DE CERTIFICACION DEL SAT</td></tr>');
    $('#PreviewHistoricalTableTfd').append('<tr><td colspan = "4"><br></td></tr>');
    $('#PreviewHistoricalTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">VERSION</td><td>'+version+'</td colspan = "2"></tr>');
    $('#PreviewHistoricalTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FOLIO FISCAL - UUID</td><td colspan = "2">'+folio_fiscal+'</td></tr>');
    $('#PreviewHistoricalTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">FECHA TIMBRADO</td><td colspan = "2">'+fecha_timbrado+'</td></tr>');          
    $('#PreviewHistoricalTableTfd').append('<tr><td class = "celda_titulo" colspan = "2">NO. CERTIFICADO SAT</td><td colspan = "2">'+certificado_sat+'</td></tr>');          

  };
  
  
  function formato_numero(numero, decimales, separador_decimal, separador_miles){ // v2007-08-06
    numero=parseFloat(numero);
    if(isNaN(numero)){
        return "";
    }

    if(decimales!==undefined){
        // Redondeamos
        numero=numero.toFixed(decimales);
    }

    // Convertimos el punto en separador_decimal
    numero=numero.toString().replace(".", separador_decimal!==undefined ? separador_decimal : ",");

    if(separador_miles){
        // Añadimos los separadores de miles
        var miles=new RegExp("(-?[0-9]+)([0-9]{3})");
        while(miles.test(numero)) {
            numero=numero.replace(miles, "$1" + separador_miles + "$2");
        }
    }

    return numero;
}