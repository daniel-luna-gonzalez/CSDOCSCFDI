<?php
/*
 * 
 *  Clase que devuelve el histórico de un CFDI, así como acuses de recibo y XML
 * 
 */

include '../../DAO/Querys.php';
require 'pclzip/pclzip.lib.php';
include '../../DAO/Log.php';
require_once 'DataBase.php';
require_once 'XML.php';

/**
 * Description of Seleccion_archivos
 *
 * @author Daniel
 */
/*
 * Los XML pueden ser seleccionados y el susuario tiene la opción de Descargarlos en un archivo comprimido o
 * enviarlos por correo.
 */
class Seleccion_archivos {

    public function __construct() {
        $this->ajax();
    }
    private function ajax()
    {
        /* Devuelve un CFDI solicitado */
        if($_POST['opcion']=='get_cfdi')
        {
            $this->devolver_cfdi();
        }
        
        /* Devulve un objeto de tipo XML */
        if($_POST['opcion']=='get_objeto_xml')
        {
            $this->devolver_objeto_xml($_POST['ruta_xml']);
        }
        
        if($_POST['opcion']=='descarga')
        {
            $xml=$_POST['xml'];
            $descarga_paquete=$this->construir_paquete($xml);
            $this->comprimir($descarga_paquete);

        }
        /* Descarga un Paquete en formato zip */
        if($_GET['opcion']=='descarga_zip')
        {
            $this->descarga($_GET['zip'],$_GET['usuario']);
        }
    /* Devuelve el historico de un CFDI */
        if($_POST['opcion']=='historico')
        {        
                $array_detalle_historico=$this->consulta_historico($_POST['content'],$_POST['id_detalle']);
                $this->crear_xml_historico($array_detalle_historico);
        }
    /* Descarga todo el paquete de Histórico */    
        if($_POST['opcion']=='descarga_historico')
        {
            $descarga_paquete=$this->descarga_historico($_POST['id_detalle'], $_POST['nombre_usuario'],$_POST['content']);
            $this->comprimir($descarga_paquete);

        }
        /* Devuelve el Acuse de Validación */
        if($_POST['opcion']=='get_acuse')
        {
            $this->get_acuse();
        }
        
        /* Devuelve un PDF para vista previa */
        if($_POST['opcion']=='get_ruta_pdf')
        {
            $this->procesar_ruta_pdf();
        }                        
    }    
    
    
    private function procesar_ruta_pdf()
    {
        $id_detalle=$_POST['id_detalle'];
        $server=  $_SERVER['SERVER_NAME'];    
        $ruta_pdf= $this->search_route_pdf($_POST['content'],$id_detalle);

        if(file_exists($ruta_pdf['ruta_pdf']))
        {
            //La ruta del pdf es absoluta y solo se necesita la ruta a nivel de server por eso se reconstruye
            $directorio = explode("/", $ruta_pdf['ruta_pdf']); 
            $ruta_nueva_pdf='/';
            for ($cont=3;$cont<count($directorio);$cont++)/* desde el nodo 3 para quitar /volume1/web/ */
            {
                if($cont+1==(count($directorio)))
                {
                    $ruta_nueva_pdf.=$directorio[$cont];        
                }
                else
                {
                    $ruta_nueva_pdf.=$directorio[$cont].'/';        
                }                               
            }
            $ruta='http://'.$server.$ruta_nueva_pdf;       
            
            if($_POST['content']=='nomina'){$clave_log=1;}
            if($_POST['content']=='cliente'){$clave_log=2;}
            if($_POST['content']=='proveedor'){$clave_log=3;}
//            $log=new Log();                                               
//            $log->write_line(23, $_POST['id_login'],$_POST['id_detalle'],$clave_log);/* Registro Log */ 

            //esta es la ruta que se envia al dialog que muestra el pdf
//            echo $ruta;
            $doc  = new DOMDocument('1.0','utf-8');
            $doc->formatOutput = true;   
            $root = $doc->createElement('PdfPath');
            $doc->appendChild($root);
            $Package = $doc->createElement("Path", $ruta);
            $root->appendChild($Package);        
            header ("Content-Type:text/xml");
            echo $doc->saveXML();
        }
        else
            XML::XmlResponse ("Error", 0, "<p>No existe el pdf solicitado</p>");
    }
    
    /* Devuelve la ruta del XML para ser visualizado */
    private function search_route_pdf($content,$id_empleado)
    {
        $ruta="";
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q='';
        if($content=='proveedor' or $content=='cliente')
        {
            $q="select ruta_pdf from detalle_factura_$content where id_detalle=$id_empleado";
        }
        if($content=='nomina')
        {
            $q="select pdf_ruta from detalle_recibo_nomina where id_detalle_recibo_nomina=$id_empleado";
        }
        
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
        {
            if($content=='cliente' or $content=='proveedor')
            {
                $Resultado=array("ruta_pdf"=>$fila['ruta_pdf']);
                $ruta=$Resultado;
            }
            if($content=='nomina')
            {
                $Resultado=array("ruta_pdf"=>$fila['pdf_ruta']);
                $ruta=$Resultado;
            }                             
        }

        mysql_close($conexion);
     return $ruta;
    }
    
    private function get_acuse()
    {
        $xml_acuse=$this->get_ruta_acuse($_POST['content'],$_POST['id_validacion']);
        if (file_exists($xml_acuse['ruta_acuse'])) 
        {          
            $xml = simplexml_load_file($xml_acuse['ruta_acuse']);    
            header('Content-Type: text/xml'); 
            echo $xml->saveXML(); 
//                    $this->log();
        }   
    }
    
    /* Función para devolver y mostrar la vista previa de un CFDI en Pantalla */
    private function devolver_cfdi()
    {
        $ruta_xml=  $this->get_ruta_xml($_POST['content'],$_POST['id_detalle']);
        $ruta= $ruta_xml['ruta_xml'];   
        if (file_exists($ruta)) 
        {           
            $xml = file_get_contents($ruta);
            $xml = preg_replace("/(<\/?)(\w+):([^>]*>)/", "$1$2$3", $xml);
            $xml = simplexml_load_string($xml);
//            $doc = new DOMDocument();
//            $doc->load($ruta);
//            $doc = simplexml_load_file($ruta);       
//            $root = $doc->firstChild;
//            $Acuse = $doc->createElement("Acuse", $ruta_xml['ruta_acuse']);
//            $root->appendChild($Acuse);
            header('Content-Type: text/xml');
            echo $xml->saveXML(); 
            
//            $nodo1_json= $xml->saveXML(); 
//            $json=array('xml_cfdi'=>$nodo1_json,'ruta_validacion'=>$ruta_xml['ruta_acuse'],'id_validacion'=>$ruta_xml['id_validacion']);
//            echo json_encode($json);
            
            $log=new Log();     
            if($_POST['content']=='nomina'){$clave_log=1;}
            if($_POST['content']=='cliente'){$clave_log=2;}
            if($_POST['content']=='proveedor'){$clave_log=3;}
            
//            $log->write_line(18, $_POST['id_login'],$_POST['id_detalle'],$clave_log);/* Registro Log */ 
        }        
    }
    
    /* Devuelve la ruta de un CFDI para devolver el XML */
    private function get_ruta_xml($content,$id_empleado)
    {
        $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q='';
        if($content=='nomina')
        {
            $q="SELECT det.xml_ruta, det.id_validacion, val.ruta_acuse FROM detalle_recibo_$content det inner join validacion_nomina val on det.id_validacion=val.id_validacion WHERE det.id_detalle_recibo_nomina=$id_empleado";
        }
        if($content=='proveedor' or $content=='cliente')
        {
            $q="SELECT det.ruta_xml, det.id_validacion ,val.ruta_acuse  FROM detalle_factura_$content det inner join validacion_$content val on det.id_validacion=val.id_validacion  WHERE det.id_detalle=$id_empleado";
        }
        
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                if($content=='proveedor' or $content=='cliente')
                {
                    $Resultado=array("ruta_xml"=>$fila['ruta_xml'],'id_validacion'=>$fila['id_validacion'],'ruta_acuse'=>$fila['ruta_acuse']);
                    $array=$Resultado;    
                }
                if($content=='nomina')
                {
                    $Resultado=array("ruta_xml"=>$fila['xml_ruta'],'id_validacion'=>$fila['id_validacion'],'ruta_acuse'=>$fila['ruta_acuse']);
                    $array=$Resultado;  
                }
                                 
            }

        mysql_close($conexion);
     return $array;
    }
    
    private function devolver_objeto_xml($ruta_xml)
    {
//        echo "php ruta=$ruta_xml";
        if (file_exists($ruta_xml)) 
        {            
            $xml = simplexml_load_file($ruta_xml);    
            header('Content-Type: text/xml'); 
            echo $xml->saveXML();
        }
    }
    
    /* Devuelve la ruta del acuse */
    private function get_ruta_acuse($content, $id_validacion)
    {
        $ruta_acuse='';
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="select ruta_acuse from validacion_$content where id_validacion=$id_validacion";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo('<?xml version="1.0" encoding="UTF-8"?><error>'.$mensaje.'</error>');
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $filas=array("ruta_acuse"=>$fila['ruta_acuse']);
                $ruta_acuse=$filas;              
            }

        mysql_close($conexion);
     return $ruta_acuse;
    }
    
    
    
    /* Se transforma el XML que se recibe en un Directorio único con todos
     *  Los comprobantes organizados por emisor y dentro de este todos los receptores */
    private function construir_paquete($xml_post)
    {       
       $xml=  simplexml_load_string($xml_post);
       $descargas=$xml->descarga;
       $fecha=date('mdyHms');
       $carpeta_raiz="/usr/CFDI/Descarga/".$xml->usuario[0]->nombre."/$fecha";
       
//       echo "<p>Carpeta raíz $carpeta_raiz</p>";
       
       if(file_exists("/usr/CFDI/Descarga/".$xml->usuario[0]->nombre))
       {
           system("rm -r /usr/CFDI/Descarga/".$xml->usuario[0]->nombre);
       }
       
       if(mkdir("$carpeta_raiz",0777,true))
       {
           foreach($descargas as $child)
            {
//                echo "<p>Procesando: ".$child->emisor . " " . $child->receptor . " ".$child->ruta."</p>";
                /* Se crea Carpeta de emisor y receptor*/

                $carpeta_destino="$carpeta_raiz/$child->emisor/$child->receptor/";
                $carpeta_cfdi_ = str_replace(" ", "_", $carpeta_destino);
                $carpeta_cfdi=  trim($carpeta_cfdi_);
                if(!file_exists($carpeta_cfdi))
                {
                    if(!mkdir($carpeta_cfdi,0777,true))
                    {
//                        echo "<p>Error al crear destino $carpeta_cfdi</p>";
                    }
                    else
                    {
//                        echo "<p>Destino creado $carpeta_cfdi</p>";
                    }

                }                                                   
                /* Se realizan los movimientos de XML a sus respectivos directorios */
                if(file_exists($child->ruta))
                {
                    /* nombre del archivo CFDI a pegar en el destino*/
                    $trozos = explode("/", $child->ruta); 
                    $archivo_ = end($trozos);
                    if(!copy($child->ruta, $carpeta_cfdi.$archivo_))
                    {
//                       echo "<p>error al mover a $carpeta_cfdi.$archivo_</p>";
                    }
                    
                 if(file_exists($child->ruta_pdf))
                 {           
//                     echo "<p> existe pdf ".$child->ruta_pdf."</p>";
                     if(!copy($child->ruta_pdf, $carpeta_cfdi.  basename($child->ruta_pdf)))
                        {
//                            echo "<p> No se movio el pdf ".$child->ruta_pdf."</p>";
                        }
                 }
                 if(file_exists($child->ruta_acuse))
                 {           
//                     echo "<p> existe pdf ".$child->ruta_pdf."</p>";
                     if(!copy($child->ruta_acuse, $carpeta_cfdi.  basename($child->ruta_acuse)))
                        {
//                            echo "<p> No se movio el pdf ".$child->ruta_pdf."</p>";
                        }
                 }
                    
                }                                
            }
       }
       return $carpeta_raiz;
    }
    
    function comprimir($ruta)
    {        
        $zipfile = new PclZip($ruta.'.zip');
	$v_list = $zipfile->create($ruta,PCLZIP_OPT_REMOVE_PATH, $ruta);
        $zip = "$ruta.zip";
        if ($v_list == 0) {
    	die ("Error: " . $zipfile->errorInfo(true));/* Si ocurré algún error este se devuelve */
	}                
        $this->respuesta_descarga($zip);
        
    }
    
    /* Devuelve un XML con los errores que llegasen a ocurrir */
    function salida_errores()
    {
        
    }
    
    /* Se envia la respuesta después de comprimir el archivo XML
     * y se devuelve estao 1 en caso de éxito y 0 en caso de Falló
     * Junto con la ruta del archivo a descargar, ya que el archivo se 
     * descargará en otra página */
    function respuesta_descarga($zip)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;   
        $root = $doc->createElement('Respuesta');
        $doc->appendChild($root);
        $respuesta=$doc->createElement('respuesta');
        /* Si el archivo existe se envia respuesta positiva */
        $estado='';
        $mensaje='';
        if(file_exists($zip))
        {
            $estado=$doc->createElement("estado",'1');
            $mensaje=$doc->createElement('mensaje','¡Se generó correctamente el archivo de descarga!'); 
            $nombre_zip=$doc->createElement('nombre_zip',  basename($zip));
        }
        else
        {
            $estado=$doc->createElement("estado",'0');
            $mensaje=$doc->createElement('mensaje','¡Ocurrió un error mientras se intentaba generar el archivo'
                    . ' de descarga¡');
            $nombre_zip=$doc->createElement('nombre_zip',$zip);
        }
        
        $respuesta->appendChild($estado);
        $respuesta->appendChild($mensaje);
        $respuesta->appendChild($nombre_zip);
        
        $root->appendChild($respuesta);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    /* Descarga de archivo comprimido ZIP */
    function descarga($zip,$usuario)
    {
        echo "Descarga archivo desde PHP";
        $path_zip='/usr/CFDI/Descarga/'.$usuario.'/'.$zip;
        
        $nombre_archivo=  basename($path_zip);
        header("Content-type: application/octet-stream");
	header("Content-disposition: attachment; filename=$nombre_archivo");
	readfile($path_zip);
    }
    
    
    
    private function consulta_historico($content, $id_detalle)
    {
        $array_historico=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="select his.id_historial,logi.nombre_usuario, his.fecha_hora, his.tipo_archivo, "
        . "vali.id_validacion, vali.ruta_acuse , his.ruta_xml, his.ruta_pdf from historial_$content his
        inner join login logi on his.id_usuario=logi.id_login inner join validacion_$content vali on vali.id_validacion=his.id_validacion
         WHERE his.id_detalle=$id_detalle ORDER BY his.tipo_archivo DESC";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $array_historico[]=$fila;              
            }

        mysql_close($conexion);
     return $array_historico;
    }
    
    
    /* Se devuelve el historico en un MXL */
    function crear_xml_historico($array_historico)
    {
        $server=  $_SERVER['SERVER_NAME'];    
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;   
        $root = $doc->createElement('Historico');
        $doc->appendChild($root);
        
        foreach ($array_historico as $array)
        {
            
            $historico=$doc->createElement('historico');
            $usuario=$doc->createElement('usuario',$array['nombre_usuario']);
            $historico->appendChild($usuario);
            $fecha=$doc->createElement('fecha',$array['fecha_hora']);
            $historico->appendChild($fecha);
            $tipo_archivo=$doc->createElement('tipo_archivo',$array['tipo_archivo']);
            $historico->appendChild($tipo_archivo);     
            $id_validacion=$doc->createElement('id_validacion',$array['id_validacion']);
            $historico->appendChild($id_validacion);
            $ruta_validacion=$doc->createElement("ruta_validacion",$array['ruta_acuse']);
            $historico->appendChild($ruta_validacion);
            $ruta_xml=$doc->createElement('ruta_xml',$array['ruta_xml']);
            $historico->appendChild($ruta_xml);
            $RutaPDF=$array['ruta_pdf'];
            if(strlen($RutaPDF)==0){$RutaPDF='S/PDF';}
            else
            {
                if(file_exists($RutaPDF))
                {
                    //La ruta del pdf es absoluta y solo se necesita la ruta a nivel de server por eso se reconstruye
                    $directorio = explode("/", $RutaPDF); 
                    $ruta_nueva_pdf='/';
                    for ($cont=3;$cont<count($directorio);$cont++)/* desde el nodo 3 para quitar /volume1/web/ */
                    {
                        if($cont+1==(count($directorio)))
                        {
                            $ruta_nueva_pdf.=$directorio[$cont];        
                        }
                        else
                        {
                            $ruta_nueva_pdf.=$directorio[$cont].'/';        
                        }                               
                    }
                    $ruta='http://'.$server.$ruta_nueva_pdf;       
                    $RutaPDF=$ruta;
                }
            }                        
            
            $ruta_pdf=$doc->createElement("ruta_pdf",$RutaPDF);
            $historico->appendChild($ruta_pdf);
            $root->appendChild($historico);
        }                                      
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }        
    
    /* Construccion del Paquete y descarga de histórico */
function descarga_historico($id_detalle,$nombre_usuario,$content)
{       

    $array_historico=array();
    $Querys=new Querys();
    $conexion=$Querys->Conexion();
    $BD="CFDI";
    mysql_select_db($BD,$conexion);

    $q='';
    if($content=='cliente')
    {
        $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_factura_cliente detalle inner join historial_cliente his 
        on detalle.id_detalle=his.id_detalle inner join receptor_factura_cliente receptor on detalle.id_receptor=receptor.id_receptor
        WHERE detalle.id_detalle=$id_detalle";
    }

    if($content=='proveedor')
    {
        $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_factura_proveedor detalle inner join historial_proveedor his 
        on detalle.id_detalle=his.id_detalle inner join receptor_factura_proveedor receptor on detalle.id_receptor=receptor.id_receptor
        WHERE detalle.id_detalle=$id_detalle";
    }
    
    if($content=='nomina')
    {
        $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_recibo_nomina detalle inner join historial_nomina his 
        on detalle.id_detalle_recibo_nomina=his.id_detalle inner join receptor_recibo_nomina receptor on detalle.id_receptor=receptor.id_receptor
        WHERE detalle.id_detalle_recibo_nomina=$id_detalle";
    }

    $resultado = mysql_query($q);
    if (!$resultado)
        {
            $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
            $mensaje .= 'Consulta completa: ' . $q;
            echo($mensaje);
        }
    while ($fila = mysql_fetch_assoc($resultado))
        {
            $array_historico[]=$fila;              
        }

    mysql_close($conexion);

   $fecha=date('mdyHms');
   $carpeta_raiz="/usr/CFDI/Descarga/$nombre_usuario/$fecha";

//       echo "<p>Carpeta raíz $carpeta_raiz</p>";

   if(file_exists("/usr/CFDI/Descarga/$nombre_usuario"))
   {
       system("rm -r /usr/CFDI/Descarga/$nombre_usuario");
   }
//       echo "<p>Tamaño del Arreglo ".count($array_historico)."</p>";
   if(mkdir($carpeta_raiz,0777,true))
   {

       for($contador=0;$contador<count($array_historico);$contador++)
        {
//                echo "<p>contador=$contador</p>";
            $carpeta_destino="$carpeta_raiz/".$array_historico[$contador]['nombre']."/";
                 $carpeta_cfdi_ = str_replace(" ", "_", $carpeta_destino);
                 $carpeta_cfdi=  trim($carpeta_cfdi_);
                 if(!file_exists($carpeta_cfdi))
                 {
                     if(!mkdir($carpeta_cfdi,0777,true))
                     {
//                             echo "<p>Error al crear destino $carpeta_cfdi</p>";
                     }
                     else
                     {
//                             echo "<p>Destino creado $carpeta_cfdi</p>";
                     }

                 }                                                   
                 /* Se realizan los movimientos de XML a sus respectivos directorios */
                 $ruta_xml=$array_historico[$contador]['ruta_xml'];
//                     echo "ruta xml=$ruta_xml";
                 if(file_exists($ruta_xml))
                 {
                     /* nombre del archivo CFDI a pegar en el destino*/
//                         echo "<p>Existe el archivo ".$array_historico[$contador]['ruta_xml']."</p>";
                     $archivo_=  basename($array_historico[$contador]['ruta_xml']);
                     if(!copy($array_historico[$contador]['ruta_xml'], $carpeta_cfdi.$archivo_))
                     {
//                            echo "<p>error al mover a $carpeta_cfdi.$archivo_</p>";
                     }   
                     else
                     {
//                             echo "<p>Se movio el archivo $archivo_</p>";
                     }
                 }                 
        }
   }
       
       
       return $carpeta_raiz;
    }        
}
$seleccion=new Seleccion_archivos();
