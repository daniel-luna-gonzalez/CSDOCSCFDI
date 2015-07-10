<?php

class Read_XML {
    public function __construct() {        
    }
    private function archivo($ruta_xml,$nombre_xml)
    {/*
     * Abre el archivo XML y en cada nodo le quita los dos puntos (:) p.e. cfdiEmisor
     */
        if(file_exists($ruta_xml.$nombre_xml))
        {
            $xml = file_get_contents($ruta_xml.$nombre_xml);
            $xml = preg_replace("/(<\/?)(\w+):([^>]*>)/", "$1$2$3", $xml);
            if(!$xml = simplexml_load_string($xml))
            {
                $xml=0;
            }
        }
        else
        {
            exit();
        }
            
        return $xml;
    }
     public function detalle($ruta_xml, $nombre_xml)
    {      
        $xml= $this->archivo($ruta_xml, $nombre_xml); 
       
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
        

////            //Emisor atributos
//        
//        $percepciones_encabezado=array(
//            "TotalGravado"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones['TotalGravado'],
//            "TotalExento"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones['TotalExento']
//            );
//        $complemento_percepciones=array();
//        for($valor=0;$valor<count($xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion);$valor++)
//            {
//                $detalle_xml=array(
//                     "TipoPercepcion"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion[$valor]['TipoPercepcion'],
//                     "Clave"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion[$valor]['Clave'],
//                     "Concepto"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion[$valor]['Concepto'],
//                     "ImporteGravado"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion[$valor]['ImporteGravado'],
//                     "ImporteExento"=>$xml->cfdiComplemento->nominaNomina->nominaPercepciones->nominaPercepcion[$valor]['ImporteExento']
//                    );
//                $complemento_percepciones[]=$detalle_xml;
//                unset($detalle_xml);
//            }
//
//        /*
//         * Deducciones
//         */
//        $deducciones_encabezado=array(
//            "TotalGravado"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones['TotalGravado'],
//            "TotalExento"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones['TotalExento']
//                );    
//        $complemento_deducciones=array();
//        for($valor=0;$valor<count($xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion);$valor++)
//            {
//                $detalle_xml=array(
//                    "TipoDeduccion"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion[$valor]['TipoDeduccion'],
//                    "Clave"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion[$valor]['Clave'],
//                    "Concepto"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion[$valor]['Concepto'],
//                    "ImporteGravado"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion[$valor]['ImporteGravado'],
//                    "ImporteExento"=>$xml->cfdiComplemento->nominaNomina->nominaDeducciones->nominaDeduccion[$valor]['ImporteExento']
//                );
//                $complemento_deducciones[]=$detalle_xml;
//                unset($detalle_xml);
//            }
//         $complemento_incapacidades=array();
//        for($valor=0;$valor<count($xml->cfdiComplemento->nominaNomina->nominaIncapacidades->nominaIncapacidad);$valor++)
//        {
//            $detalle_xml=array(
//                "DiasIncapacidad"=>$xml->cfdiComplemento->nominaNomina->nominaIncapacidades->nominaIncapacidad[$valor]['DiasIncapacidad'],
//                "TipoIncapacidad"=>$xml->cfdiComplemento->nominaNomina->nominaIncapacidades->nominaIncapacidad[$valor]['TipoIncapacidad'],
//                "Descuento"=>$xml->cfdiComplemento->nominaNomina->nominaIncapacidades->nominaIncapacidad[$valor]['Descuento']
//            );            
//            $complemento_incapacidades[]=$detalle_xml;
//            unset($detalle_xml);
//        }
//        $complemento_hrs=array();
//        for($valor=0;$valor<count($xml->cfdiComplemento->nominaNomina->nominaHorasExtras->nominaHorasExtra);$valor++)
//        {
//            $detalle_xml=array(
//                "Dias"=>$xml->cfdiComplemento->nominaNomina->nominaHorasExtras->nominaHorasExtra[$valor]['Dias'],
//                "TipoHoras"=>$xml->cfdiComplemento->nominaNomina->nominaHorasExtras->nominaHorasExtra[$valor]['TipoHoras'],
//                "HorasExtra"=>$xml->cfdiComplemento->nominaNomina->nominaHorasExtras->nominaHorasExtra[$valor]['HorasExtra'],
//                "ImportePagado"=>$xml->cfdiComplemento->nominaNomina->nominaHorasExtras->nominaHorasExtra[$valor]['ImportePagado']
//                );      
//            $complemento_hrs[]=$detalle_xml;
//            unset($detalle_xml);
//        }    
//           $detalle_xml=array();                  
        
        /*
         * Se almacena la información en un arreglo multidimencional
         */
        $array_xml=array("comprobante_encabezado"=>$comprobante_encabezado,
            "emisor"=>$emisor,"receptor"=>$complemento_receptor,
            "conceptos"=>$conceptos,"totalImpuestosRetenidos"=>$totalImpuestosRetenidos,
            "impuestos"=>$impuestos,"complemento_nomina"=>$complemento_nomina,
            'timbreFiscalDigital'=>$timbreFiscalDigital
//            "percepciones_encabezado"=>$percepciones_encabezado,
//            "complemento_percepciones"=>$complemento_percepciones,
//            "deducciones_encabezado"=>$deducciones_encabezado,
//            "complemento_deducciones"=>$complemento_deducciones,
//            "complemento_incapacidades"=>$complemento_incapacidades,
//            "complemento_hrs"=>$complemento_hrs
            );
//        printf("\n   Peso Array Read = ".  count($array_xml));
//        printf("\n");
//        echo var_dump($array_xml);

//        echo "<p>".$array_xml['impuestos'][0]['impuesto']."</p>";
    return $array_xml;
    }
}
?>
