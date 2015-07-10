<?php



/**
 * Description of webservice_sat
 *
 * @author daniel
 */
require_once("/volume1/web/usuario/media/soap/lib/nusoap.php");
//require_once '../usuario/media/soap/lib/nusoap.php';
class webservice_sat {
    
    public function valida_cfdi($rfc_emisor,$rfc_receptor,$total_factura,$uuid)
    {                        
        /*
        * Mensajes de Respuesta
        Los mensajes de respuesta que arroja el servicio de consulta de CFDI´s incluyen la descripción del resultado de la operación que corresponden a la siguiente clasificación:
        Mensajes de Rechazo.
        N 601: La expresión impresa proporcionada no es válida.
        Este código de respuesta se presentará cuando la petición de validación no se haya respetado en el formato definido.
        N 602: Comprobante no encontrado.
        Este código de respuesta se presentará cuando el UUID del comprobante no se encuentre en la Base de Datos del SAT.
        Mensajes de Aceptación.
        S Comprobante obtenido satisfactoriamente.
         */
        
//           printf("\n clase webservice rfce=$rfc_emisor rfcr=$rfc_receptor total=$total_factura uuid=$uuid");
        
        $web_service="https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc?wsdl";
        try {
            $hora_envio= date("Y-m-d H:i:s");
            $client = new SoapClient($web_service);
         } catch (Exception $e) {
             echo 'Excepción capturada: ',  $e->getMessage(), "\n";
         }

          $cadena="re=$rfc_emisor&rr=$rfc_receptor&tt=$total_factura&id=$uuid";

          $param = array(
             'expresionImpresa'=>$cadena
          );
                              
          $respuesta = $client->Consulta($param);
          
          $hora_recepcion=date("Y-m-d H:i:s");                           
          $xml=0;
          if($respuesta->ConsultaResult->Estado=='Vigente')
          {
             $cadena_encriptar=$hora_envio.'│'.$rfc_emisor.'│'.$rfc_receptor.'│'.$total_factura.'│'.$uuid.'│'.$hora_recepcion;         
             $md5=md5($cadena_encriptar);
             $xml=$this->create_xml($respuesta,$rfc_emisor, $rfc_receptor, $total_factura, $uuid, $web_service, $hora_envio, $hora_recepcion, $md5);
          }
          return $xml;                         
    }
    
    
    private function create_xml($respuesta,$rfc_emisor,$rfc_receptor,$total_factura,$uuid,$web_service,$hora_envio,$hora_recepcion,$md5)
    {
        $doc = new DomDocument('1.0', 'UTF-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('RespuestaSAT'); 
        $doc->appendChild($root);
        $webService=$doc->createElement('WebService',"$web_service");
        $root->appendChild($webService);          
        $emisorRfc=$doc->createElement('EmisorRfc',"$rfc_emisor");
        $root->appendChild($emisorRfc);
        $receptorRfc=$doc->createElement("ReceptorRFC","$rfc_receptor");
        $root->appendChild($receptorRfc);
        $FechaHoraEnvio=$doc->createElement("FechaHoraEnvio","$hora_envio");
        $root->appendChild($FechaHoraEnvio);
        $FechaHoraRespuesta=$doc->createElement("FechaHoraRespuesta","$hora_recepcion");
        $root->appendChild($FechaHoraRespuesta);
        $TotalFactura=$doc->createElement("TotalFactura","$total_factura");
        $root->appendChild($TotalFactura);
        $UUID=$doc->createElement("UUID",$uuid);
        $root->appendChild($UUID);
        $codigoEstatus=$doc->createElement('CodigoEstatus',$respuesta->ConsultaResult->CodigoEstatus);
        $root->appendChild($codigoEstatus);
        $estado=$doc->createElement('Estado',$respuesta->ConsultaResult->Estado);
        $root->appendChild($estado);
        $acuse=$doc->createElement("AcuseRecibo","$md5");
        $root->appendChild($acuse);
        
//        $doc->save('RespuestaSAT.xml');        
//        echo htmlentities($doc->saveXML());
        
        return $doc;
    }
    
}

