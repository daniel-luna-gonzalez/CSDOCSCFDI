<?php

require_once("lib/nusoap.php");
try {
       $client = new SoapClient("https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc?wsdl");
    } catch (Exception $e) {
        echo 'Excepción capturada: ',  $e->getMessage(), "\n";
    }

     $rfc_emisor_='AIC911114399';
     $rfc_emisor=str_replace("&", "&amp;", $rfc_emisor_);
     $rfc_receptor_='HGP1307014D5';
     $rfc_receptor=str_replace("&", "&amp;", $rfc_receptor_);
     $total_factura='163560';
     $uuid='C09124CA-1FBC-46C3-A36E-B4F7CE40F23C';
     
     $cadena="re=$rfc_emisor&rr=$rfc_receptor&tt=$total_factura&id=$uuid";

     $param = array(
        'expresionImpresa'=>$cadena
     );
     
     $valores = $client->Consulta($param);
     print_r (var_dump($valores));
    echo "El codigo: ".$valores->ConsultaResult->CodigoEstatus."<br>";
    echo "El estado: ".$valores->ConsultaResult->Estado."<br>";
// }}} Valida Sello
// {{{ Valida este XML en el servidor del SAT 
// ftp://ftp2.sat.gob.mx/asistencia_servicio_ftp/publicaciones/cfdi/WS_ConsultaCFDI.pdf
     