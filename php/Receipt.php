<?php
/**
 * Description of Receipt
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
if(!file_exists($filename))
    $RoutFile = dirname(getcwd());

require_once 'DataBase.php';
require_once 'XML.php';
//require_once("$RoutFile/apis/soap/lib/nusoap.php");

class Receipt {
    public function __construct() {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'GetXmlValidationReceipt': $this->GetXmlValidationReceipt(); break;
            case 'GetXmlSatValidationCfdiAnswer': $this->GetXmlSatValidationCfdiAnswer(); break;
        }
    }
    private function GetXmlSatValidationCfdiAnswer()
    {
        $DB = new DataBase();
        
        $IdUser = filter_input(INPUT_POST, "idLogin");
        $IdDetail = filter_input(INPUT_POST, "IdDetail");
        $Content = filter_input(INPUT_POST, "content");
        
        $Query = "";
        if(strcasecmp($Content, "proveedor")==0 or strcasecmp($Content, "cliente")==0)
        {
            $Query = "SELECT det.id_validacion , val.ruta_acuse FROM detalle_factura_$Content det inner join validacion_$Content val on det.id_validacion=val.id_validacion  WHERE det.id_detalle=$IdDetail ";
        }
        if(strcasecmp($Content, "nomina")==0)
        {
            $Query="SELECT det.id_validacion, val.ruta_acuse FROM detalle_recibo_$Content det inner join validacion_nomina val on det.id_validacion=val.id_validacion WHERE det.id_detalle_recibo_nomina=$IdDetail";
        }

        $Result = $DB->ConsultaSelect("CFDI", $Query);
        if($Result['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al recuperar el <b>Acuse de validación</b></p><br>Detalles:<br><br>".$Result['Estado']);
            return 0;
        }
        
        $Acuse = $Result['ArrayDatos'][0];
        
        if(!file_exists($Acuse['ruta_acuse']))
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> no existe el acuse de validación</p>");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->load($Acuse['ruta_acuse']);
        $root = $doc->firstChild;
        $IdAcuse = $doc->createElement("IdValidacion", $Acuse['id_validacion']);
        $root->appendChild($IdAcuse);
        header('Content-Type: text/xml');
        echo $doc->saveXML(); 
        
    }
    
    public static function ValidateWithWebServiceSAT($rfc_emisor,$rfc_receptor,$total_factura,$uuid)
    {
        $web_service="https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc?wsdl";
        $hora_envio = date("Y-m-d H:i:s");
        try {            
                $client = new SoapClient($web_service);
         } catch (Exception $e) {
             echo '\n Error de validación en WS Sat: ',  $e->getMessage();
             return 0;
         }

          $cadena = "re=$rfc_emisor&rr=$rfc_receptor&tt=$total_factura&id=$uuid";

          $param = array('expresionImpresa'=>$cadena);
          
          try
          {
              $respuesta = $client->Consulta($param);
          } catch (Exception $ex) {
              echo "\n Error en WebService SAT. ".$ex;
              return 0;
          }
          
          
          $hora_recepcion=date("Y-m-d H:i:s");                           

          if($respuesta->ConsultaResult->Estado=='Vigente')
          {
             $cadena_encriptar = $hora_envio.'│'.$rfc_emisor.'│'.$rfc_receptor.'│'.$total_factura.'│'.$uuid.'│'.$hora_recepcion;         
             $md5 = md5($cadena_encriptar);
             return $xml = Receipt::CreateReceiptXml($respuesta,$rfc_emisor, $rfc_receptor, $total_factura, $uuid, $web_service, $hora_envio, $hora_recepcion, $md5);
          }
          else
              return 0;
    }
    
    private function GetXmlValidationReceipt()
    {
        $DB = new DataBase();
        $ReceiptPath = filter_input(INPUT_POST, "ReceiptPath");
        $IdReceipt = filter_input(INPUT_POST, "IdReceipt");
        $content = filter_input(INPUT_POST, "content");
        
        if(!strlen($ReceiptPath)>0 or !(file_exists($ReceiptPath)))
        {
            $QueryGetReceipt = "SELECT ruta_acuse FROM validacion_$content WHERE id_validacion = $IdReceipt";
            $ResultGetReceipt = $DB->ConsultaSelect("CFDI", $QueryGetReceipt);
            if($ResultGetReceipt['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al intentar recuperar el comprobante de validación</p><br>Detalles:<br><br>".$ResultGetReceipt['Estado']);
                return 0;
            }
            $ReceiptPath = $ResultGetReceipt['ArrayDatos'][0]['ruta_acuse'];
        }
        
        if (file_exists($ReceiptPath)) 
        {          
            $xml = simplexml_load_file($ReceiptPath);    
            header('Content-Type: text/xml'); 
            echo $xml->saveXML(); 
        }   
        else
            XML::XmlResponse ("Error", 0, "<p><b>Error</b>, el comprobante de validación solicitado no fué encontrado</p>");
    }
    
    /* Recibe un objeto tipo DomDocument, el cual es el XML devuelto después de la validación */
    function InsertValidationCfdi($EnterpriseAlias, $content,$validacion,$ReceiptPath)
    {        
        $DB = new DataBase();
        
        $webService=$validacion->getElementsByTagName("WebService")->item(0)->nodeValue;
        $EmisorRfc=$validacion->getElementsByTagName("EmisorRfc")->item(0)->nodeValue;
        $ReceptorRfc=$validacion->getElementsByTagName("ReceptorRFC")->item(0)->nodeValue;
        $FechaHoraEnvio=$validacion->getElementsByTagName("FechaHoraEnvio")->item(0)->nodeValue;
        $FechaHoraRespuesta=$validacion->getElementsByTagName("FechaHoraRespuesta")->item(0)->nodeValue;
        $TotalFactura=$validacion->getElementsByTagName("TotalFactura")->item(0)->nodeValue;
        $uuid=$validacion->getElementsByTagName("UUID")->item(0)->nodeValue;
        $CodigoEstatus=$validacion->getElementsByTagName("CodigoEstatus")->item(0)->nodeValue;
        $Estado=$validacion->getElementsByTagName("Estado")->item(0)->nodeValue;
        $md5=$validacion->getElementsByTagName("AcuseRecibo")->item(0)->nodeValue;               
        
        $q="INSERT INTO validacion_$content (FechaHora_envio, FechaHora_respuesta, emisor_rfc,"
                . "receptor_rfc, total_factura, uuid, codigo_estatus, estado, md5, web_service, ruta_acuse)"
                . " VALUES ('$FechaHoraEnvio', '$FechaHoraRespuesta', '$EmisorRfc', '$ReceptorRfc'"
                . ", $TotalFactura, '$uuid', '$CodigoEstatus', '$Estado', '$md5', '$webService', '$ReceiptPath')";
        
        $NewIdReceipt = $DB->ConsultaInsertReturnId($EnterpriseAlias, $q);
        
        if(!$NewIdReceipt>0)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar la validación del nuevo Cfdi</p><br>Detalles:<br><br>$NewIdReceipt");
            return 0;
        }
        
        return $NewIdReceipt;
    } 
    
    public static function CreateReceiptXml($respuesta,$rfc_emisor,$rfc_receptor,$total_factura,$uuid,$web_service,$hora_envio,$hora_recepcion,$md5)
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

$Receipt = new Receipt();