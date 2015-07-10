<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Historic
 *
 * @author Daniel
 */
require_once 'DataBase.php';
require_once 'XML.php';
require 'pclzip/pclzip.lib.php';
class Historical {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
                $Option = filter_input(INPUT_POST, "option");
        switch ($Option)
        {
            case 'GetHistoric': $this->GetHistoric(); break;
            case 'Download': $this->Download(); break;
        }
    }
    
    private function Download()
    {
        $DB = new DataBase();
        $content = filter_input(INPUT_POST, "content");
        $IdDetail = filter_input(INPUT_POST, "IdDetail");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $ServerName = filter_input(INPUT_SERVER, "SERVER_NAME");
        $ScriptsPath = filter_input(INPUT_SERVER, "DOCUMENT_ROOT");

        $q = '';
        if($content=='cliente')
        {
            $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_factura_cliente detalle inner join historial_cliente his 
            on detalle.id_detalle=his.id_detalle inner join receptor_factura_cliente receptor on detalle.id_receptor=receptor.id_receptor
            WHERE detalle.id_detalle=$IdDetail";
        }

        if($content=='proveedor')
        {
            $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_factura_proveedor detalle inner join historial_proveedor his 
            on detalle.id_detalle=his.id_detalle inner join receptor_factura_proveedor receptor on detalle.id_receptor=receptor.id_receptor
            WHERE detalle.id_detalle=$IdDetail";
        }

        if($content=='nomina')
        {
            $q="SELECT receptor.nombre, his.ruta_xml, his.tipo_archivo from detalle_recibo_nomina detalle inner join historial_nomina his 
            on detalle.id_detalle_recibo_nomina=his.id_detalle inner join receptor_recibo_nomina receptor on detalle.id_receptor=receptor.id_receptor
            WHERE detalle.id_detalle_recibo_nomina=$IdDetail";
        }
        
        $ResultHistorical = $DB->ConsultaSelect("CFDI", $q);
        if($ResultHistorical['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al obtener los paquetes a descargar</p><br>Detalles: <br><br>".$ResultHistorical['Estado']);
            return 0;
        }
        
        $array_historico = $ResultHistorical['ArrayDatos'];
        
        $fecha=date('mdyHms');
        $carpeta_raiz="$ScriptsPath/Download/$UserName/$fecha";

        if(file_exists("$ScriptsPath/Download/$UserName"))
        {
            system("rm -r $ScriptsPath/Download/$UserName");
        }        
        if(($mkdir = mkdir($carpeta_raiz,0777,true))!=TRUE)
        {        
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al generar el directorio de descarga: $mkdir</p>");
        }        

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
             
        $zipfile = new PclZip($carpeta_raiz.'.zip');
	$v_list = $zipfile->create($carpeta_raiz,PCLZIP_OPT_REMOVE_PATH, $carpeta_raiz);
        $zip = "$carpeta_raiz.zip";
        if ($v_list == 0) {
    	echo ("Error: " . $zipfile->errorInfo(true));/* Si ocurré algún error este se devuelve */
        return;
	}              
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;   
        $root = $doc->createElement('Downloading');
        $doc->appendChild($root);
        $Message = $doc->createElement("Mesagge", "Descarga historial....");
        $root->appendChild($Message);
        $Package = $doc->createElement("Package", $zip);
        $root->appendChild($Package);        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function GetHistoric()
    {
        $DB = new DataBase();
        $content = filter_input(INPUT_POST, "content");
        $IdDetail = filter_input(INPUT_POST, "IdDetail");
        $ServerName = filter_input(INPUT_SERVER, "SERVER_NAME");
        
        $q="select his.id_historial,logi.nombre_usuario, his.fecha_hora, his.tipo_archivo, "
        . "vali.id_validacion, vali.ruta_acuse , his.ruta_xml, his.ruta_pdf from historial_$content his
        LEFT JOIN Usuarios logi on his.id_usuario=logi.IdUsuario 
        LEFT JOIN validacion_$content vali on vali.id_validacion=his.id_validacion
         WHERE his.id_detalle=$IdDetail ORDER BY his.tipo_archivo DESC";
        
        $ResultGetHistoric = $DB->ConsultaSelect("CFDI", $q);
        if($ResultGetHistoric['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consulta el histórico del documento</p><br>Detalles:<br><br>".$ResultGetHistoric['Estado']);
            return 0;
        }        
        
//        XML::XmlArrayResponse("Historical", "Register", $ResultGetHistoric['ArrayDatos']);
                $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;   
        $root = $doc->createElement('Historical');
        $doc->appendChild($root);
        
        foreach ($ResultGetHistoric['ArrayDatos'] as $array)
        {
            
            $historico=$doc->createElement('Register');
            $usuario=$doc->createElement('nombre_usuario',$array['nombre_usuario']);
            $historico->appendChild($usuario);
            $fecha=$doc->createElement('fecha_hora',$array['fecha_hora']);
            $historico->appendChild($fecha);
            $tipo_archivo=$doc->createElement('tipo_archivo',$array['tipo_archivo']);
            $historico->appendChild($tipo_archivo);     
            $id_validacion=$doc->createElement('id_validacion',$array['id_validacion']);
            $historico->appendChild($id_validacion);
            $ruta_validacion=$doc->createElement("ruta_acuse",$array['ruta_acuse']);
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
                    $ruta='http://'.$ServerName.$ruta_nueva_pdf;       
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
    
    public function InsertHistorical($content,$IdUser, $id_detalle,$id_validacion,$ruta_xml,$ruta_pdf,$tipo_archivo)
    {
        $DB = new DataBase();
        $q="INSERT INTO historial_$content SET id_detalle=$id_detalle,id_validacion=$id_validacion,id_usuario=$IdUser"
            . ",fecha_hora=now(),ruta_xml='$ruta_xml', ruta_pdf='$ruta_pdf', tipo_archivo='$tipo_archivo'"; 
        $NewIdHistorical = $DB->ConsultaInsertReturnId("CFDI", $q);
        if(!($NewIdHistorical>0))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al insertar el registro en el histórico</p><br>Detalles:<br><br>$NewIdHistorical");
            return 0;
        }
        
        
        return $NewIdHistorical;
    }
    
}

$Historic = new Historical();