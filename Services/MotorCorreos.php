<?php

/*
 * Esta clase realiza las búsquedas de facturas y PDF adjuntos en correos electrónicos 
 * registrados en el sistema, se realiza la carga a la BD.
 */

/**
 * Description of MotorCorreos
 *
 * @author daniel
 */
require_once "/volume1/web/DAO/Carga_factura_proveedor.php";
require_once '/volume1/web/Transaction/webservice_sat.php';
require_once '/volume1/web/usuario/php/mail.php';
require_once '/volume1/web/Transaction/Read_factura_cliente.php';
include_once '/volume1/web/DAO/Querys.php';
class MotorCorreos {
    private $array_xml=array();
    private $id_emisor=0,$id_receptor=0, $id_detalle=0;
    public function __construct() {
        $this->inicio_motor_correo();
    }
    function inicio_motor_correo()
    {
         $dir_extraidos="/volume1/web/correoCFDI/extraidos/";
         $dir_invalidos="/volume1/web/correoCFDI/invalidos/"; /* CFDI invalidos o existentes */
         
        $mail=new mail();
        /* Listado de correos registrados */
        $lista_correo=$mail->get_lista_correo();
        if (count($lista_correo) == 0) {
            return;
        }
        /* Información del correo dedicado a envios */
        $correo_envios=$mail->info_mail_envios(0);/* El parámetro no se ocupa por el momento */
        foreach ($lista_correo as $correo)
        {
            printf("\n\n Iniciando extracción en ".$correo['correo']."\n\n");
            $mail->obtener_adjuntos($correo['host_imap'],$correo['puerto'], $correo['correo'], $correo['password'], '/volume1/web/correoCFDI/extraidos/');
        }
        printf("\nFinalizo extraccion");
        /* Después de la extracción se busca en el directorio de extraidos */
        $array_archivos=$this->escaneo_dir_extraidos();
        printf("\n\n Iniciando validacion \n\n");
        foreach ($array_archivos as $valor)
        {
            /* Instancia a clase de Carga de Facturas */
            $carga_proveedor=new Carga_factura_proveedor();
            /* Lectura del XML */
            $read_xml=new Read_factura_cliente();     
            
            $carga_proveedor->array_xml='';
            $carga_proveedor->id_detalle=0;
            $carga_proveedor->id_emisor=0;
            $carga_proveedor->id_receptor=0;            
                                          
            $nombre_xml=$valor['xml'];            
            
            $array_read_xml=$read_xml->detalle($dir_extraidos.$valor['correo']."/", $valor['xml']);
                    
            $carga_proveedor->array_xml=$array_read_xml;
            
            /* Datos de correo de envio (Se ocupa para respuestas de correo con CFDI inválidos) */
            $correo_envios=$mail->info_mail_envios(0);
            
            /* Comprobación de parámetros para validación */
            if(count($array_read_xml)<=0 or $array_read_xml==null)
                {
                    printf("Formato incorrecto");
                    $this->notificar_cfdi_invalido($carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'desconocido');                
                    continue;
                }
            if(strlen($array_read_xml['emisor']['rfc'])==0 or strlen($array_read_xml['receptor']['rfc'])==0 or strlen($array_read_xml['timbreFiscalDigital']['UUID'])==0)
                {
                    printf('\n xml invalido '.$valor['xml']);  
                    $this->notificar_cfdi_invalido($carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'desconocido');                
                    continue;
                }
            
            
            /* Validación del CFDI */
            $validacion_web=  new webservice_sat();
            $validacion=$validacion_web->valida_cfdi($array_read_xml['emisor']['rfc'], $array_read_xml['receptor']['rfc'], $array_read_xml['encabezado']['total'], $array_read_xml['timbreFiscalDigital']['UUID']);
            printf("\n validando.... E rfc=". $array_read_xml['emisor']['rfc']." R rfc=". $array_read_xml['receptor']['rfc']." total=". $array_read_xml['encabezado']['total']." UUID=". $array_read_xml['timbreFiscalDigital']['UUID']);
            if(!count($validacion)>0)
            {
                /* Se registra en el sistema el archivo como inválido y se notifica al correo emisor. */
                printf("\n Fallo en validacion ". $valor['xml'] ."reenviando a ".$valor['correo']);    
                $this->notificar_cfdi_invalido($carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'invalido');                
                continue;
            }    
            
            /* Una vez válidado el CFDI se inserta en la BD */
            /* Devuelve el id del emisor si existe sino se aumenta el contador */
            $existe=0;
            if(($carga_proveedor->id_emisor=$carga_proveedor->exist_emisor())  ==0){$carga_proveedor->id_emisor=$carga_proveedor->Insert_emisor(); }else{   $existe++;  }
            /* Devuelve el id del receptor si existe sino se aumenta el contador */
            if(($carga_proveedor->id_receptor=$carga_proveedor->exist_receptor())   ==0){$carga_proveedor->id_receptor=  $carga_proveedor->insert_receptor(); }else{$existe++; }

            /*Se obtienen los ids emisor y receptor después de la inserción de los mismo
            * esto pasa sino existian en caso de que existan la condición se ignora  */
            if($carga_proveedor->id_emisor==0) {    $carga_proveedor->id_emisor=$carga_proveedor->id_emisor(); } 
            if($carga_proveedor->id_receptor==0){   $carga_proveedor->id_receptor=  $carga_proveedor->id_receptor(); }
     
            if(($id_detalle=$carga_proveedor->exist_detalle())==0)
            {                           
                $extension = pathinfo($nombre_xml, PATHINFO_EXTENSION);
                $nombre_acuse = basename($nombre_xml, '.'.$extension);
                $ruta_cfdi=  $carga_proveedor->get_ruta_cfdi();
                $validacion->save($ruta_cfdi.$nombre_acuse."SAT.xml");
                $id_validacion=$carga_proveedor->insert_validacion($validacion,$ruta_cfdi.$nombre_acuse."SAT.xml");
                $ruta=$carga_proveedor->move_cfdi($dir_extraidos.$valor['correo']."/",$nombre_xml); 
                $ruta_pdf=NULL;
                if(file_exists($dir_extraidos.$valor['correo']."/".$valor['pdf']))
                {
                    $carga_proveedor->move_cfdi($dir_extraidos.$valor['correo']."/",$valor['pdf']);
                    $ruta_pdf=$ruta.$valor['pdf'];

                }
                $carga_proveedor->id_detalle=$carga_proveedor->Insert_detalle($id_validacion,$ruta.$nombre_xml,$ruta_pdf); 
                $this->insert_motor_correo(0,$carga_proveedor,$valor['correo'], 'valido',$ruta.$nombre_xml,$ruta_pdf);
            }
            else{   $existe++;  }      

                if($existe==3)
                {
                    $ruta_pdf=NULL;
                    $ruta_xml=NULL;
                    
                    if(!file_exists($dir_invalidos.$valor['correo']))
                    {
                       mkdir($dir_invalidos.$valor['correo'],0777, true);
                       chmod($dir_invalidos.$valor['correo'],  0777);      
                    }   
                    
                    if(file_exists($dir_invalidos.$valor['correo']."/".$valor['pdf']))
                    {
                        $ruta_pdf=$dir_invalidos.$valor['correo']."/".$valor['pdf'];
                    }
                    
                    $intentos=$carga_proveedor->obtener_intentos($carga_proveedor->id_emisor, $nombre_xml);              
                   
                    rename($dir_extraidos.$valor['correo']."/".$nombre_xml, $dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$nombre_xml);
                    $ruta_xml=$dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$nombre_xml;

                    $this->insert_motor_correo(0,$carga_proveedor,$valor['correo'], 'repetido',$ruta_xml,$ruta_pdf);
                }                            
                        
            /* Se limpian las variables globales */
            while(count($carga_proveedor->emisor )) array_pop($carga_proveedor->emisor );
            while(count($carga_proveedor->receptor )) array_pop($carga_proveedor->receptor );
            while(count($carga_proveedor->detalle )) array_pop($carga_proveedor->detalle);
            while(count($carga_proveedor->array_xml)) array_pop($carga_proveedor->array_xml);
            
            /* Insert en la BD */
        }
    }
    
    /* Se registra en el sistema el archivo inválido y se notifica al emisor */
    function notificar_cfdi_invalido($instancia_carga_factura,$correo_envios,$nombre_xml,$nombre_pdf,$correo_emisor,$estatus)
    {
        $dir_extraidos="/volume1/web/correoCFDI/extraidos/$correo_emisor/";
        $dir_invalidos="/volume1/web/correoCFDI/invalidos/$correo_emisor/"; /* CFDI invalidos o existentes */
        $ruta_xml=NULL;
        $ruta_pdf=NULL;
        
        if(!file_exists($dir_invalidos))
        {
           mkdir($dir_invalidos,0777, true);
           chmod($dir_invalidos,  0777);      
        }   
        if (file_exists($dir_extraidos. $nombre_xml)) {
            rename($dir_extraidos. $nombre_xml, $dir_invalidos. $nombre_xml);
            $ruta_xml=$dir_invalidos. $nombre_xml;
        }
        if($nombre_pdf!='' or $nombre_pdf!=null)
        {
            if(file_exists($dir_extraidos.$nombre_pdf)){
            rename($dir_extraidos.$nombre_pdf, $dir_invalidos.$nombre_pdf);
            $ruta_pdf=$dir_invalidos.$nombre_pdf;
            }
        }
        
        $this->insert_motor_correo(0,$instancia_carga_factura, $correo_emisor, "$estatus",$ruta_xml,$ruta_pdf);
        $archivos_respuesta=array("xml"=>$dir_invalidos.$nombre_xml,"pdf"=>$dir_invalidos.$nombre_pdf);
        /* Mensaje enviado por Correo electrónico para notificación de Facturas inválidas */
        $mensaje="<p>El sistema CSDocs CFDI ha detectado que la siguiente Factura es inválida, ya que no se "
                . "encuentra en la Base de Datos del SAT, por favor envié una Factura válida. </p>"
                . "<br>"
                . "<p>$nombre_xml</p>"
                . "<p>$nombre_pdf</p>";
        $mail=  new mail();
        $mail->respuesta_cfdi_invalido($correo_envios, $correo_emisor, 'Devolución de CFDI Inválido', $mensaje, $archivos_respuesta);
    }
    
    /* Todos los archivos recibidos por correo se dirigen al directorio de extraidos y los devuelve en un array */
    function escaneo_dir_extraidos()
    {
        printf("\n Monitoreo de Directorios");
        $array_archivos=array();
        $stack_pdf_xml=array();
         $escaneo=scandir('/volume1/web/correoCFDI/extraidos/');     
         $dir_extraidos="/volume1/web/correoCFDI/extraidos/";
         foreach ($escaneo as $scan) 
         {             
            if ($scan != '.' and $scan != '..')
            {
                printf("\n $scan");
                if(is_dir($dir_extraidos.$scan))
                {                   
                    printf("\n\nIniciando escaneo de $scan");
                    foreach (scandir($dir_extraidos.$scan) as $archivo)
                    {
                        if ($archivo != '.' and $archivo != '..')
                        {
                            $array_archivos[]=$archivo;
                            printf("\nArchivo dentro de dir $archivo");
                        }                        
                    }
                    /* fin de escaneo en directorio de correo, se organizan los pares de PDF y XML */  
                    $stack_pares=$this->buscar_paridad_xml_pdf($array_archivos, $scan);
                    unset($array_archivos);
                    foreach ($stack_pares as $valor)
                    {                        
                        $fila_pares=array("xml"=>$valor['xml'],"pdf"=>$valor['pdf'],"correo"=>$valor['correo']);
                        array_push($stack_pdf_xml,$fila_pares);
                    }
                }
            }
         }
         
         printf("\n \n Array con Pares CFDI \n\n");
         foreach ($stack_pdf_xml as $valor)
         {
             printf("\n xml=". $valor['xml']. " pdf=".$valor['pdf']." correo=".$valor['correo']);
         }
         return $stack_pdf_xml;
    }
    /* Busca los pares de XML y de PDF que se encuentran dentro de una directorio de correo */
   function buscar_paridad_xml_pdf($array_pdf_xml,$correo)
   {
       $stop=0;
       $pila_busqueda=$array_pdf_xml;
       $array_cola=$array_pdf_xml;
       $stack=array();
        if(count($array_cola)>0)
        {
            while($stop<  count($array_cola))
            {
                $array_cola=$pila_busqueda; /* Array con los xml y pdf encontrados */
//                printf("\n Stop=$stop");
                for ($cont=0;$cont<count($array_cola);$cont++)
                {
                    if(array_key_exists($cont, $pila_busqueda))
                    {
                        $archivo_xml=''; /* Nombre del archivo xml */
                        $archivo_pdf=''; /* Nombre del archivo PDF */
                        $archivo_base=$pila_busqueda[$cont];   /* Archivo contra el cuál se harán las comparaciones puede ser PDF o XML */
                        $archivo=$archivo_base;
                        $extension = pathinfo($archivo_base, PATHINFO_EXTENSION);
                        $nombre_base = basename($archivo, '.'.$extension); 

//                        printf("\n nombre base = $archivo_base con extension $extension  ");

                        /* Si el archivo base es XML el dinamico debe ser PDF y vicerversa */
                        $extension_archivo_dinamico='';
                        $extension_archivo_dinamico2='';
                        /* El formato ya sea xml y pdf puede variar entre minisculas y mayusculas */
                        if(strcasecmp($extension,'xml')==0) { $extension_archivo_dinamico='.PDF'; $extension_archivo_dinamico2='.pdf';   }
                        if(strcasecmp($extension,'pdf')==0) {  $extension_archivo_dinamico='.xml'; $extension_archivo_dinamico2='.XML';}

                        $nombre_base_dinamico=$nombre_base.$extension_archivo_dinamico;
                        $nombre_base_dinamico2=$nombre_base.$extension_archivo_dinamico2;

//                        printf("\n Buscando $nombre_base_dinamico y $nombre_base_dinamico2");

                        
                        $clave_busqueda=  array_search($nombre_base_dinamico, $pila_busqueda);
                        if($extension_archivo_dinamico==='xml'){$archivo_xml=$archivo_base; $archivo_pdf=$nombre_base_dinamico;}
                        else{$archivo_xml=$pila_busqueda[$clave_busqueda];$archivo_pdf=$archivo_base;}
                        if($clave_busqueda==FALSE)/* Sino se encuentra el archivo con formato en minusculas pe. .pdf se intenta buscar con un formato en mayusculas p.e. .PDF */
                        {
                            $clave_busqueda=  array_search($nombre_base_dinamico2, $pila_busqueda);                            
                            if($extension_archivo_dinamico==='xml'){$archivo_xml=$archivo_base; $archivo_pdf=$nombre_base_dinamico;}
                            else{$archivo_xml=$pila_busqueda[$clave_busqueda];$archivo_pdf=$archivo_base;}
                            
                        }
                        //Si se encuentra el par se encia a stack_xml_pdf
                        if($clave_busqueda!=FALSE)
                        {                                                                    
                            $pares=array("xml"=>$archivo_xml,"pdf"=>$archivo_pdf,"correo"=>$correo);
                            array_push($stack,$pares);

//                            printf("\n traspasando a stack desde busqueda en directorio ".$pila_busqueda[$cont]);

                            unset($pila_busqueda[$cont]);    
                            unset($pila_busqueda[$clave_busqueda]);    

                            $pila_busqueda=  array_values($pila_busqueda);
                            $stop=0;
                            break;
                         }
                         else
                         {
                             $stop++;
                         }
                    }
                    else
                    {
                        $stop++;
                        break;
                    }                                    
//                    printf("\n \n");
                }     /* fin for */
            }
        }/* Fin while */
        
        if(count($pila_busqueda)>0)
        {
            for ($cont=0;$cont<count($array_cola);$cont++)
            {
                $archivo_base=$pila_busqueda[$cont];   /* Archivo contra el cuál se harán las comparaciones puede ser PDF o XML */
                $archivo=$archivo_base;
                $extension = pathinfo($archivo_base, PATHINFO_EXTENSION);
                $nombre_base = basename($archivo, '.'.$extension); 
                if($extension!='xml')continue;
                
                $pares=array("xml"=>$archivo_base,"pdf"=>'',"correo"=>$correo);
                array_push($stack,$pares);
            }
        }
        
        /* Se retorna un array con los pares de pdf, xml y su respectivo correo del emisor que envio los archivos */
        return $stack;
   }
   
   /* Se registra el detalle de la factura insertada en una tabla que podrá visualizar el usuario 
    * como control de las facturas tomadas desde el correo e insertadas */
   function insert_motor_correo($id_correo,$carga_proveedor,$correo_emisor,$estatus_insert,$ruta_xml,$ruta_pdf)
   {
              
       $total=$carga_proveedor->array_xml['encabezado']['total'];
       $folio=$carga_proveedor->array_xml['encabezado']['folio'];
       $fecha=$carga_proveedor->array_xml['encabezado']['fecha'];
       
       if($total=='' or $total==null){$total=0;}
       
       $hora_envio= date("Y-m-d H:i:s");
       $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);                
        $query="INSERT INTO motor_correo (id_correo,id_emisor, id_receptor, id_detalle, emisor_correo, monto_factura,
        folio, fecha_factura, fecha_ingreso, estatus_insert, ruta_xml, ruta_pdf) VALUES ($id_correo,$carga_proveedor->id_emisor,"
        . "$carga_proveedor->id_receptor, $carga_proveedor->id_detalle, '$correo_emisor',$total, '$folio',"
        ."'$fecha', '$hora_envio', '$estatus_insert','$ruta_xml','$ruta_pdf')";
         
        $resultado=mysql_query($query,$conexion);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $query;
                printf("\n".$mensaje);
            }                                   

        mysql_close($conexion);
   }
   
}
$Motor=new MotorCorreos();