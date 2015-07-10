<?php
//require_once 'Transaction/Read_factura_cliente.php';
//require_once 'DAO/Carga_factura_cliente.php';
//
//$ScriptsPath = (__DIR__);
//
//if(file_exists("$ScriptsPath/Config/cfdv32.xsd"))
//    echo "Existe el xsd";
//
//$estado=FALSE;
//$read = new Read_factura_cliente();
//
//$xml = new DOMDocument(); 
//$xml->load($ScriptsPath.'/_root/cfdia0000000008.xml');
//if ($read->validacion_estructura($ScriptsPath.'/_root/cfdia0000000008.xml'))
//{           
//   $estado=TRUE;
//   echo "<p>Válido</p>";
//} 
//else
//    echo "<p>inválido</p>";
//
//$xml = simplexml_load_file($ScriptsPath.'/_root/cfdia0000000008.xml');
//
//
//$array = $read->detalle("$ScriptsPath/_root/", "cfdia0000000008.xml");
////var_dump($array);
//$Full = '';
//$full = GetNodes($array, $Full);
//
//echo $full;
//
//function GetNodes($array,$Full)
//{
//    foreach ($array as  $value)
//    {
//        
//        if(is_array($value))
//        {
//            $Full = GetNodes($value,$Full);
//        }
//        else
//            $Full.=$value.", ";
//    }    
//    
//    return $Full;
//}

require_once 'php/Encrypter.php';

echo $Salida = Encrypter::encrypt('20');
echo "<br><br>". Encrypter::decrypt("gRUIZG3qpPuPRxoyjsOBvHb02WiJTuM4sXDcVuzfl9I=");

