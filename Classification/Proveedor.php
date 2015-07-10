<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Proveedor
 *
 * @author Daniel
 */
class Proveedor {
    public static function GetDetail($XmlPath)
    {
        if(!file_exists($XmlPath))
                 return 0;      
        
        if(($xml = simplexml_load_file($XmlPath))==false)
        {
            return 0;
        }
        $ns = $xml->getNamespaces(true);
        $xml->registerXPathNamespace('c', $ns['cfdi']);
        $xml->registerXPathNamespace('t', $ns['tfd']); 
         
        $encabezado=array();
        
        /*
        * Encabezado XML
        */
    foreach ($xml->xpath('//cfdi:Comprobante') as $cfdiComprobante)
    {         
        $encabezado=array(
            "serie"=>$cfdiComprobante['serie'],
            "folio"=>$cfdiComprobante['folio'],
            "fecha"=>$cfdiComprobante['fecha'],
            "formaDePago"=>$cfdiComprobante['formaDePago'],
            "subTotal"=>$cfdiComprobante['subTotal'],
            "descuento"=>$cfdiComprobante['descuento'],
            "total"=>$cfdiComprobante['total'],
            "metodoDePago"=>$cfdiComprobante['metodoDePago'],
            "tipoDeComprobante"=>$cfdiComprobante['tipoDeComprobante'],
            "TipoCambio"=>$cfdiComprobante['TipoCambio'],
            "Moneda"=>$cfdiComprobante['Moneda'],
            "LugarExpedicion"=>$cfdiComprobante['LugarExpedicion']            
        );

     } 

    $array_Emisor=array();    
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor') as $Emisor)
    { 
        $array_Emisor=array(
            "rfc"=>strtr($Emisor['rfc'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "nombre"=>strtr($Emisor['nombre'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        );
    } 
    
    $array_DomicilioFiscal=array();
    
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor//cfdi:DomicilioFiscal') as $DomicilioFiscal)
    { 
        $array_DomicilioFiscal=array(
            "pais"=>$DomicilioFiscal['pais'],
            "calle"=>$DomicilioFiscal['calle'],
            "estado"=>$DomicilioFiscal['estado'],
            "colonia"=>$DomicilioFiscal['colonia'],
            "municipio"=>$DomicilioFiscal['municipio'],
            "noExterior"=>$DomicilioFiscal['noExterior'], 
            "codigoPostal"=>$DomicilioFiscal['codigoPostal'] 
        );
    }                         
     $array_ExpedidoEn=array();   
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor//cfdi:ExpedidoEn') as $ExpedidoEn)
    { 
        $array_ExpedidoEn=array(
            "expedidopais"=>  strtr($ExpedidoEn['pais'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "expedidocalle"=>  strtr($ExpedidoEn['calle'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "expedidoestado"=>$ExpedidoEn['estado'], 
            "expedidocolonia"=>strtr($ExpedidoEn['colonia'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "expedidolocalidad"=>strtr($ExpedidoEn['localidad'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "expedidomunicipio"=>strtr($ExpedidoEn['municipio'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
            "expedidonoExterior"=>$ExpedidoEn['noExterior'], 
            "expedidocodigoPostal"=>$ExpedidoEn['codigoPostal'], 
         );
    } 
      
    $emisor=array(
        "rfc"=>$Emisor['rfc'],
        "nombre"=>strtr($Emisor['nombre'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "pais"=>$DomicilioFiscal['pais'],
        "calle"=>strtr($DomicilioFiscal['calle'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "estado"=>strtr($DomicilioFiscal['estado'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "colonia"=>strtr($DomicilioFiscal['colonia'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "municipio"=>strtr($DomicilioFiscal['municipio'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "noExterior"=>$DomicilioFiscal['noExterior'], 
        "codigoPostal"=>$DomicilioFiscal['codigoPostal']
//        "expedidopais"=>strtr($ExpedidoEn['pais'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
//        "expedidocalle"=>strtr($ExpedidoEn['calle'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
//        "expedidoestado"=>$ExpedidoEn['estado'], 
//        "expedidocolonia"=>strtr($ExpedidoEn['colonia'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
//        "expedidolocalidad"=>strtr($ExpedidoEn['localidad'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
//        "expedidomunicipio"=>strtr($ExpedidoEn['municipio'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
//        "expedidonoExterior"=>$ExpedidoEn['noExterior'], 
//        "expedidocodigoPostal"=>$ExpedidoEn['codigoPostal'], 
    );
                
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Receptor') as $Receptor)
    { 
        $array_receptor=array(
        "rfc"=>$Receptor['rfc'],
        "nombre"=>$Receptor['nombre'],
        );
    }
    $detalle_receptor=array();
    
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Receptor//cfdi:Domicilio') as $ReceptorDomicilio)
    { 
        $detalle_receptor=array(
        "pais"=>$ReceptorDomicilio['pais'],
        "calle"=>$ReceptorDomicilio['calle'], 
        "estado"=>$ReceptorDomicilio['estado'], 
        "colonia"=>strtr($ReceptorDomicilio['colonia'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "municipio"=>strtr($ReceptorDomicilio['municipio'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "noExterior"=>$ReceptorDomicilio['noExterior'], 
        "noInterior"=>$ReceptorDomicilio['noInterior'], 
        "codigoPostal"=>$ReceptorDomicilio['codigoPostal'],
        "localidad"=>strtr($ReceptorDomicilio['codigoPostal'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy')
        );
    } 
    
        //Receptor    
    $complemento_receptor=array(
        "rfc"=>strtr($array_receptor['rfc'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "nombre"=>strtr($array_receptor['nombre'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "pais"=>$detalle_receptor['pais'],
        "calle"=>strtr($detalle_receptor['calle'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "estado"=>$detalle_receptor['estado'], 
        "colonia"=>strtr($detalle_receptor['colonia'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "municipio"=>strtr($detalle_receptor['municipio'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy'),
        "noExterior"=>$detalle_receptor['noExterior'], 
        "noInterior"=>$detalle_receptor['noInterior'], 
        "codigoPostal"=>$detalle_receptor['codigoPostal'],
        "localidad"=>strtr($detalle_receptor['codigoPostal'],'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝý','AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiÑñOOOOOOooooooUUUUuuuuYy')
    );    
        
        /********Conceptos (Máximo 3 por el momento )********/                 
        $conceptos=array();
        
    foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto)
     { 
        $array=array(
            "cantidad"=>$Concepto['cantidad'],
            "unidad"=>$Concepto['unidad'],
            "descripcion"=>$Concepto['descripcion'],
            "valorUnitario"=>$Concepto['valorUnitario'],
            "importe"=>$Concepto['importe'],
            
        );
        $conceptos[]=$array;
     }     
     
     $Traslados = array();
     foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado)
     { 
           $Traslados[] = array("tasa"=> $Traslado['tasa'], "importe"=>$Traslado['importe'], "impuesto"=>$Traslado['impuesto']);
      }
     
     foreach ($xml->xpath('//t:TimbreFiscalDigital') as $tfd)
     {
         $timbreFiscalDigital=array
         (
            "selloCFD"=>$tfd['selloCFD'],
            "FechaTimbrado"=>$tfd['FechaTimbrado'],
            "UUID"=>$tfd['UUID'],
            "noCertificadoSAT"=>$tfd['noCertificadoSAT'],
            "version"=>$tfd['version'],
            "selloSAT"=>$tfd['selloSAT'] 
         );
     }         
        /*
         * Se almacena la información en un arreglo multidimencional
         */
        $array_xml=array("encabezado"=>$encabezado,
            "emisor"=>$emisor,"receptor"=>$complemento_receptor,
            "conceptos"=>$conceptos,'timbreFiscalDigital'=>$timbreFiscalDigital, "Traslado"=>$Traslados
            );

    return $array_xml;
    }
}
