<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Nomina
 *
 * @author Daniel
 */
class Nomina {
    public static function GetDetail($XmlPath)
    {      
        $xml_ = file_get_contents($XmlPath);
        $_xml = preg_replace("/(<\/?)(\w+):([^>]*>)/", "$1$2$3", $xml_);
        $xml = simplexml_load_string($_xml);
        
        /*
        * Encabezado
        */
         $comprobante_encabezado=array(
         "fecha"=>$xml['fecha'],
         "tipoDeComprobante"=>$xml['tipoDeComprobante'],
         "formaDePago"=>$xml['formaDePago'],
         "subTotal"=>$xml['subTotal'],
         "descuento"=>$xml['descuento'],
         "motivoDescuento"=>$xml['motivoDescuento'],
         "Moneda"=>$xml['Moneda'],
         "total"=>$xml['total'],
         "metodoDePago"=>$xml['metodoDePago'],
         "LugarExpedicion"=>$xml['LugarExpedicion'],
         "NumCtaPago"=>$xml['NumCtaPago']);                   
         
        /*
         * Emisor
         */                        
        $emisor=array(
        "rfc"=>$xml->cfdiEmisor['rfc'],
        "nombre"=>$xml->cfdiEmisor['nombre'],
        "pais"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['pais'],
        "calle"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['calle'],
        "estado"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['estado'],
        "colonia"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['colonia'],
        "referencia"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['referencia'],
        "municipio"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['municipio'],
        "noExterior"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['noExterior'],    
        "codigoPostal"=>$xml->cfdiEmisor->cfdiDomicilioFiscal['codigoPostal'],                        
        "Regimen"=>$xml->cfdiEmisor->cfdiRegimenFiscal['Regimen']
                );    
        

        //Receptor 
        $complemento_receptor=array(
            "curp"=>$xml->cfdiComplemento->nominaNomina['CURP'],//***** Agregado ****
            "rfc"=>$xml->cfdiReceptor['rfc'],
            "nombre"=>$xml->cfdiReceptor['nombre'],
            "calle"=>$xml->cfdiReceptor->cfdiDomicilio['calle'],
            "estado"=>$xml->cfdiReceptor->cfdiDomicilio['estado'],
            "pais"=>$xml->cfdiReceptor->cfdiDomicilio['pais'],
            "colonia"=>$xml->cfdiReceptor->cfdiDomicilio['colonia'],
            "municipio"=>$xml->cfdiReceptor->cfdiDomicilio['municipio'],
            "noExterior"=>$xml->cfdiReceptor->cfdiDomicilio['noExterior'],
            "noInterior"=>$xml->cfdiReceptor->cfdiDomicilio['noInterior'],
            "codigoPostal"=>$xml->cfdiReceptor->cfdiDomicilio['codigoPostal']
        );             
        /*
         * Conceptos
         */         
        $conceptos=array();
        for($valor=0;$valor<count($xml->cfdiConceptos->cfdiConcepto);$valor++)
        {
            
            $detalle_xml=
            array(
                "cantidad"=>$xml->cfdiConceptos->cfdiConcepto[$valor]['cantidad'],
                "unidad"=>$xml->cfdiConceptos->cfdiConcepto[$valor]['unidad'],
                "descripcion"=>$xml->cfdiConceptos->cfdiConcepto[$valor]['descripcion'],
                "valorUnitario"=>$xml->cfdiConceptos->cfdiConcepto[$valor]['valorUnitario'],
                "importe"=>$xml->cfdiConceptos->cfdiConcepto[$valor]['importe']
                 );       
            $conceptos[]=$detalle_xml;
            unset($detalle_xml);
        }    
        unset($detalle_xml);
          
        /*
         * Impuestos
         */    
        $impuestos=array();
        $totalImpuestosRetenidos=array("totalImpuestosRetenidos" =>$xml->cfdiImpuestos['totalImpuestosRetenidos']);
        
        for($valor=0;$valor<count($xml->cfdiImpuestos->cfdiRetenciones->cfdiRetencion);$valor++)
        {
            $detalle_xml=array("impuesto"=>$xml->cfdiImpuestos->cfdiRetenciones->cfdiRetencion[$valor]['impuesto'],
            "importe"=>$xml->cfdiImpuestos->cfdiRetenciones->cfdiRetencion[$valor]['importe']);
            $impuestos[]=$detalle_xml;
            unset($detalle_xml);
        }                        
        /*
       * Complemento
       */  
        $complemento_nomina=array(
            "Version"=>$xml->cfdiComplemento->nominaNomina['Version'],
            "RegistroPatronal"=>$xml->cfdiComplemento->nominaNomina['RegistroPatronal'],
            "NumEmpleado"=>$xml->cfdiComplemento->nominaNomina['NumEmpleado'],
            "CURP"=>$xml->cfdiComplemento->nominaNomina['CURP'],
            "TipoRegimen"=>$xml->cfdiComplemento->nominaNomina['TipoRegimen'],
            "NumSeguridadSocial"=>$xml->cfdiComplemento->nominaNomina['NumSeguridadSocial'],
            "FechaPago"=>$xml->cfdiComplemento->nominaNomina['FechaPago'],
            "FechaInicialPago"=>$xml->cfdiComplemento->nominaNomina['FechaInicialPago'],
            "FechaFinalPago"=>$xml->cfdiComplemento->nominaNomina['FechaFinalPago'],
            "NumDiasPagados"=>$xml->cfdiComplemento->nominaNomina['NumDiasPagados'],
            "Departamento"=>$xml->cfdiComplemento->nominaNomina['Departamento'],
            "CLABE"=>$xml->cfdiComplemento->nominaNomina['CLABE'],
            "Banco"=>$xml->cfdiComplemento->nominaNomina['Banco'],
            "FechaInicioRelLaboral"=>$xml->cfdiComplemento->nominaNomina['FechaInicioRelLaboral'],
            "Antiguedad"=>$xml->cfdiComplemento->nominaNomina['Antiguedad'],
            "Puesto"=>$xml->cfdiComplemento->nominaNomina['Puesto'],
            "TipoContrato"=>$xml->cfdiComplemento->nominaNomina['TipoContrato'],
            "TipoJornada"=>$xml->cfdiComplemento->nominaNomina['TipoJornada'],
            "PeriodicidadPago"=>$xml->cfdiComplemento->nominaNomina['PeriodicidadPago'],
            "SalarioBaseCotApor"=>$xml->cfdiComplemento->nominaNomina['SalarioBaseCotApor'],
            "RiesgoPuesto"=>$xml->cfdiComplemento->nominaNomina['RiesgoPuesto'],
            "SalarioDiarioIntegrado"=>$xml->cfdiComplemento->nominaNomina['SalarioDiarioIntegrado']
            
        );
        
        /*   TimbreFiscalDigital  */
        $timbreFiscalDigital=array(
            'UUID'=>$xml->cfdiComplemento->tfdTimbreFiscalDigital['UUID']
            
        );
        
        /*
         * Se almacena la información en un arreglo multidimencional
         */
        $array_xml=array("encabezado"=>$comprobante_encabezado,
            "emisor"=>$emisor,"receptor"=>$complemento_receptor,
            "conceptos"=>$conceptos,"totalImpuestosRetenidos"=>$totalImpuestosRetenidos,
            "impuestos"=>$impuestos,"complemento_nomina"=>$complemento_nomina,
            'timbreFiscalDigital'=>$timbreFiscalDigital
            );

        return $array_xml;
    }
}
