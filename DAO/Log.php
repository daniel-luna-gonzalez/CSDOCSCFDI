<?php
/*
 * Clase que contiene las funciones necesarias para el registro de movimientos en un log
 * 
 * 
 */
require_once 'Querys.php';
class Log {
    public function __construct() {        
    }
    public function write_line($clave,$id_login,$id_detalle,$tipo_comprobante)
    {
        $descripcion='*';
        if($clave==2)
        {
            $descripcion='Alta de Usuario en el Sistema ';   
        }
        if($clave==3)
        {
            $descripcion='Carga Recibos de Nómina ';   
        }
        if($clave==4)
        {
            $descripcion='Carga de Facturas Cliente ';   
        }
        if($clave==5)
        {
            $descripcion='Carga de Facturas Proveedor ';   
        }
        if($clave==6)
        {
            $descripcion='Baja de Usuario ';   
        }
        if($clave==7)
        {
            $descripcion='Modificación de Usuario ';   
        }
        if($clave==8)
        {
            $descripcion='Actualización de XML ';   
        }
        if($clave==9)
        {
            $descripcion='Actualización de PDF ';   
        }
        if($clave==10)
        {
            $descripcion='Impresión de documento ';   
        }

        if($clave==18)
        {
            $descripcion='Consulta de Comprobante ';   
        }
        if($clave==19)
        {
            $descripcion='Entrada al sistema ';   
        }
        if($clave==20)
        {
            $descripcion='Búsqueda Global ';   
        }
        if($clave==21)
        {
            $descripcion='Consulta Log ';   
        }
        if($clave==22)
        {
            $descripcion='Descarga Log ';   
        }
        if($clave==23)
        {
            $descripcion='Visor PDF ';   
        }
        $hoy = date("Y-m-d H:i:s"); 
//        $hoy = date("Y-m-d"); 
        $nombre_usuario=array();
        
        if($id_login!=0)
        {
            $nombre_usuario=  $this->return_name_user($id_login);
        }
        $nombre_usuario_=$nombre_usuario[0]['nombre_usuario'];
        
        $detalle=array();
        if($clave==23 or $clave==9){$detalle=  $this->return_empresa_fromdetalle($id_detalle, $tipo_comprobante, 'pdf');}
        if($clave==18 or $clave==8){$detalle=  $this->return_empresa_fromdetalle($id_detalle, $tipo_comprobante, 'xml');}
        $nombre_empresa_='S/N';
        $nombre_archivo='S/N';
        $nombre_archivo_='S/N';
        $descripcion2='S/D';
        $clave_movimiento='0';
        /*  Recibos tipo cliente */
        if($tipo_comprobante==1)
        {
            $nombre_empresa_=$detalle[0]['nombre'];
            if($clave==23 or $clave==9){$nombre_archivo=$detalle[0]['pdf_ruta'];}
            if($clave==18 or $clave==8){$nombre_archivo=$detalle[0]['xml_ruta']; } 
            $nombre_archivo_=  $this->nombre_archivo($nombre_archivo);
            $descripcion2="$descripcion $nombre_archivo_";
            $tipo_comprobante='Recibo de Nómina';
        }
        /*  Cliente y Proveedor */
        if($tipo_comprobante==2 or $tipo_comprobante==3)
        {
            $nombre_empresa_=$detalle[0]['nombre'];
            if($clave==23 or $clave==9){$nombre_archivo=$detalle[0]['ruta_pdf'];}
            if($clave==18 or $clave==8){$nombre_archivo=$detalle[0]['ruta_xml'];}
            $nombre_archivo_=  $this->nombre_archivo($nombre_archivo);
            $descripcion2="$descripcion $nombre_archivo_";
            if($tipo_comprobante==2)$tipo_comprobante='Factura Cliente';
            if($tipo_comprobante==3)$tipo_comprobante='Factura Proveedor';
        }
        /* Otro tipo de Movimiento */
        if($tipo_comprobante==''){$tipo_comprobante='No especifícado';}
        if($clave==19){$clave_movimiento=1;}
        if($clave==18){$clave_movimiento=3;}
        if($clave==23){$clave_movimiento=3;}
        if($clave==8){$clave_movimiento=6;}
        if($clave==9){$clave_movimiento=6;}
        if($clave==2 or $clave==6 or $clave==7){$clave_movimiento=7; $descripcion2="\"$nombre_usuario_\" $descripcion";}
                
        $cadena="$clave::$id_login::$nombre_usuario_::$nombre_empresa_::$descripcion::$nombre_archivo_::$tipo_comprobante::$descripcion2::$hoy::**$clave_movimiento**";
        
        $fecha=  date('Ymd');
        $ar=fopen("/usr/CFDI/Log/$fecha.txt","a");
        if($ar)
        {
            fputs($ar,$cadena);
            fputs($ar,"\n");
            fclose($ar);
        }               
    }
public function write_line_mail($clave,$id_login,$id_detalle,$tipo_comprobante,$destinatario)
    {
    $nombre_usuario=array();
        if($id_login!=0)
        {
            $nombre_usuario=  $this->return_name_user($id_login);
        }
        $nombre_usuario_=$nombre_usuario[0]['nombre_usuario'];
        
        
        $nombre_empresa_='S/N';
        $nombre_archivo='S/N';
        $detalle=  $this->return_detalle_mail($id_detalle, $tipo_comprobante);
        if($tipo_comprobante==1)
        {                                 
            $nombre_empresa_=$detalle[0]['nombre'];   
            $nombre_archivo=  $this->nombre_archivo($detalle[0]['xml_ruta']);    
            $tipo_comprobante='Recibo de Nómina';
        }
        else
        {                     
            $nombre_empresa_=$detalle[0]['nombre'];   
            $nombre_archivo=  $this->nombre_archivo($detalle[0]['ruta_xml']);
            
            if($tipo_comprobante==2)$tipo_comprobante='Factura Cliente';
            if($tipo_comprobante==3)$tipo_comprobante='Factura Proveedor';
        }                       
        
        $hoy = date("Y-m-d H:i:s"); 
//        $hoy = date("Y-m-d");         
                                                                                                                                                                        /* Claves */   
        $cadena="$clave::$id_login::$nombre_usuario_::$nombre_empresa_::'Envió de Mail'::$nombre_archivo::$tipo_comprobante::'Envió de mail a $destinatario'::$hoy::**4**";
        $fecha=  date('Ymd');
        $ar=fopen("/usr/CFDI/Log/$fecha.txt","a");
        if($ar)
        {
            fputs($ar,$cadena);
            fputs($ar,"\n");
            fclose($ar);
        }               
}  
public function log_registro_busqueda($id_login,$id_empresa,$cadena_buscar,$fecha1,$fecha2, $tipo_comprobante)
{       
        $descripcion='S/D';
        $clave=0;
        if($id_empresa==0 and $cadena_buscar=='' and $fecha1=='' and $fecha2=='')
        {
            $descripcion='Búsqueda Global';
            $clave=11;
        }
        if($id_empresa==0 and $cadena_buscar!='' and $fecha1=='' and $fecha2=='')
        {
            $descripcion="Búsqueda Global Cadena Específica '$cadena_buscar'";
            $clave=24;
        }
        if($id_empresa!=0 and $cadena_buscar=='' and $fecha1=='' and $fecha2=='')
        {
            $descripcion='Búsqueda Global Empresa';
            $clave=25;
        }
        if($id_empresa!=0 and $cadena_buscar!='' and $fecha1=='' and $fecha2=='')
        {
            $descripcion="Búsqueda Empresa Cadena Específica '$cadena_buscar'";
            $clave=26;
        }
        if($id_empresa!=0 and $cadena_buscar=='' and $fecha1!='' and $fecha2=='')
        {
            $descripcion="Búsqueda Empresa Cadena Específica '$cadena_buscar', Fecha Inicio '$fecha1'";
            $clave=27;
        }
        if($id_empresa!=0 and $cadena_buscar=='' and $fecha1=='' and $fecha2!='')
        {
            $descripcion="Búsqueda Empresa Cadena Específica '$cadena_buscar', Fecha Final '$fecha2'";
            $clave=28;
        }
        if($id_empresa!=0 and $cadena_buscar=='' and $fecha1!='' and $fecha2!='')
        {
            $descripcion="Búsqueda Empresa Cadena Específica '$cadena_buscar', Fecha Inicio '$fecha1' y Fecha Final '$fecha2'";
            $clave=29;
        }
        if($id_empresa==0 and $cadena_buscar!='' and $fecha1!='' and $fecha2=='')
        {
            $descripcion="Búsqueda Global Cadena Específica '$cadena_buscar', Fecha de Inicio '$fecha1'";
            $clave=30;
        }
        if($id_empresa==0 and $cadena_buscar!='' and $fecha1!='' and $fecha2!='')
        {
            $descripcion="Búsqueda Global Cadena Específica '$cadena_buscar', Fecha de Inicio '$fecha1' y Fecha Final '$fecha2'";
            $clave=31;
        }
        if($id_empresa==0 and $cadena_buscar=='' and $fecha1!='' and $fecha2=='')
        {
            $descripcion="Búsqueda Global con Fecha de Inicio '$fecha1'";
            $clave=32;
        }
        if($id_empresa==0 and $cadena_buscar=='' and $fecha1=='' and $fecha2!='')
        {
            $descripcion="Búsqueda Global con Fecha Final '$fecha2'";
            $clave=33;
        }
        if($id_empresa==0 and $cadena_buscar=='' and $fecha1!='' and $fecha2!='')
        {
            $descripcion="Búsqueda Global con Fecha de Inicio '$fecha1' y Fecha Final '$fecha2'";
            $clave=34;
        }        
        if($id_empresa==0 and $cadena_buscar!='' and $fecha1=='' and $fecha2!='')
        {
            $descripcion="Búsqueda Global con Cadenea Específica '$cadena_buscar' y Fecha Final '$fecha2'";
            $clave=34;
        }        
        
        $nombre_archivo='S/N';
        $nombre_empresa_='';
        if($cadena_buscar=='')$cadena_buscar='Sin Cadena a buscar';
        if($fecha1=='')$fecha1='Sin fecha de inicio';
        if($fecha2=='')$fecha2='Sin fecha final';
        
        $nombre_usuario=array();
        $hoy = date("Y-m-d H:i:s"); 
//        $hoy = date("Y-m-d"); 
        if($id_login!=0)
        {
            $nombre_usuario=  $this->return_name_user($id_login);
        }
        $nombre_usuario_=$nombre_usuario[0]['nombre_usuario'];
        $tabla='';
        if($tipo_comprobante==1){$tabla='emisor_recibo_nomina'; $tipo_comprobante='Recibo de Nómina';}
        if($tipo_comprobante==2){$tabla='emisor_factura_cliente';$tipo_comprobante='Factura Cliente';}
        if($tipo_comprobante==3){$tabla='emisor_factura_proveedor';$tipo_comprobante='Factura Proveedor';}
        
        $nombre_empresa=array();
        if($id_empresa!=0)
        {
            $nombre_empresa=  $this->return_empresa($id_empresa, $tabla);
            $nombre_empresa_=$nombre_empresa[0]['nombre'];
        }
        if($nombre_empresa_=='')$nombre_empresa_='Sin empresa seleccionada';
        
       
        
        $cadena="$clave::$id_login::$nombre_usuario_::$nombre_empresa_::'Búsqueda'::$nombre_archivo::$tipo_comprobante::$descripcion::$hoy::**2**";
        $fecha=  date('Ymd');
        $ar=fopen("/usr/CFDI/Log/$fecha.txt","a");
        if($ar)
        {
            fputs($ar,$cadena);
            fputs($ar,"\n");
            fclose($ar);
        }              
}
public function arrastre_a_inbox($clave,$id_login,$nombre_archivo,$tipo_comprobante)
{
        $nombre_usuario=array();
        $hoy = date("Y-m-d H:i:s"); 
        $documento='';
//        $hoy = date("Y-m-d"); 
        if($id_login!=0)
        {
            $nombre_usuario=  $this->return_name_user($id_login);
        }
        $nombre_usuario_=$nombre_usuario[0]['nombre_usuario'];
        $tabla='';
        if($tipo_comprobante==1){$tabla='emisor_recibo_nomina'; $documento='Carga de Documentos en Inbox Recibo de Nómina'; $tipo_comprobante='Recibo de Nómina';}
        if($tipo_comprobante==2){$tabla='emisor_factura_cliente'; $documento='Carga de Carga de Facturas de Cliente'; $tipo_comprobante='Factura Cliente';}
        if($tipo_comprobante==3){$tabla='emisor_factura_proveedor'; $documento='Carga de Facturas de Proveedor'; $tipo_comprobante='Factura Proveedor';}
        
        $cadena="$clave::$id_login::$nombre_usuario_::*::'Ingreso de Archivos a Inbox'::$nombre_archivo::$tipo_comprobante::$documento::$hoy::**5**";
        $fecha=  date('Ymd');
        $ar=fopen("/usr/CFDI/Log/$fecha.txt","a");
        if($ar)
        {
            fputs($ar,$cadena);
            fputs($ar,"\n");
            fclose($ar);
        }           
}
private function return_empresa($id_empresa,$tabla)
{
    $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="SELECT nombre FROM $tabla WHERE idemisor=$id_empresa";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $array[]=$fila;                     
            }

        mysql_close($conexion);
     return $array;
}
    
    private function return_name_user($id_login)
    {
        $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="SELECT nombre_usuario FROM Usuarios WHERE IdUsuario=$id_login";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $array[]=$fila;                     
            }

        mysql_close($conexion);
     return $array;
    }           
    
    private function return_empresa_fromdetalle($id_detalle, $tipo_comprobante,$tipo_archivo)
    {
        $ruta='';
        $tabla_detalle='';
        $campo_id_detalle='';
        $tabla_emisor='';
        if($tipo_comprobante==1)
        {
            $campo_id_detalle='id_detalle_recibo_nomina';
            $tabla_detalle='detalle_recibo_nomina';
            $tabla_emisor='emisor_recibo_nomina';
            if($tipo_archivo=='xml')
            {
                $ruta='xml_ruta';
            }
            if($tipo_archivo=='pdf')
            {
                $ruta='pdf_ruta';
            }
        }
        if($tipo_comprobante==2 or $tipo_comprobante==3)
        {
            $campo_id_detalle='id_detalle';
            if($tipo_comprobante==2){$tabla_detalle='detalle_factura_cliente'; $tabla_emisor='emisor_factura_cliente';}
            if($tipo_comprobante==3){$tabla_detalle='detalle_factura_proveedor'; $tabla_emisor='emisor_factura_proveedor';}
            
            if($tipo_archivo=='xml'){$ruta='ruta_xml';}
            if($tipo_archivo=='pdf'){$ruta='ruta_pdf';}
        }
        $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="select em.nombre,de.$ruta from $tabla_detalle de inner join $tabla_emisor em on em.idemisor=de.id_emisor where de.$campo_id_detalle=$id_detalle";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $array[]=$fila;                     
            }

        mysql_close($conexion);
     return $array;
    }           
        
    private function nombre_archivo($ruta)
    {
        $trozos = explode("/", $ruta); 
        return $trozos[7];
    }
    
    /*
     *Nos regresa el nombre de los archivos enviados por mail 
     */
    private function return_detalle_mail($id_detalle,$tipo_comprobante)
    {  
        $ruta='';
        $tabla_detalle='';
        $campo_id_detalle='';
        $tabla_emisor='';
       if($tipo_comprobante==1)
        {
            $campo_id_detalle='id_detalle_recibo_nomina';
            $tabla_detalle='detalle_recibo_nomina';
            $tabla_emisor='emisor_recibo_nomina';

            $ruta='xml_ruta';
  
        }
        if($tipo_comprobante==2 or $tipo_comprobante==3)
        {
            $campo_id_detalle='id_detalle';
            if($tipo_comprobante==2){$tabla_detalle='detalle_factura_cliente'; $tabla_emisor='emisor_factura_cliente';}
            if($tipo_comprobante==3){$tabla_detalle='detalle_factura_proveedor'; $tabla_emisor='emisor_factura_proveedor';}
            
           $ruta='ruta_xml';

        }
        
        
        $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="select em.nombre,de.$ruta from $tabla_detalle de inner join $tabla_emisor em on em.idemisor=de.id_emisor where de.$campo_id_detalle=$id_detalle";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $array[]=$fila;                     
            }

        mysql_close($conexion);
     return $array;
    }           
}
?>
