<?php
/*
 * Regresa un XML con la información solicitada por el usuario
 */
include '/volume1/web/DAO/Querys.php';
class return_log {
    public function __construct() {
        $this->ajax();
    }
    private function ajax()
    {
        $tipo_log=$_POST['tipo_log'];
        /* Regresa el registro del día de hoy */
        if($tipo_log=='todo')
        {
            $this->log_now();
        }
        /* Regresa el listado de usuarios */
        if($_POST['get_users']==1)
        {
            $this->get_users();
        }
        /* log personalizado */
        if($tipo_log=='avanzado')
        {
            $this->log_avanzado();
        }
        
    }
    private function log_avanzado()
    {
        
        $date = new DateTime($_POST['fecha']);
        $fecha=$date->format('Ymd');
//        echo "fecha = ".$fecha;
        $archivo=array('fecha'=>$fecha);
        $archivo_=$archivo['fecha'];
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Log');
        $doc->appendChild($root); 
        
    if(file_exists("/usr/CFDI/Log/$archivo_.txt"))
    {                    
        if(($file = fopen("/usr/CFDI/Log/$archivo_.txt", "r")))
        {
            while(!feof($file))
            {            
                $linea= fgets($file). "<br />";
//                echo $linea;
                $explode_claves=  explode('**', $linea);              

                $explode=  explode('::',$linea);
                if($explode[0]>0)
                {
                    if(($_POST['id_login']!=0 and $_POST['id_login']!=$explode[1])){ continue;}
                    if($_POST['documento']!='todos' and $_POST['documento']!=$explode[6]){ continue;}
                    if($_POST['check_login']!=1 and $explode_claves[1]==1){ continue;}
                    if($_POST['check_busqueda']!=1 and $explode_claves[1]==2){ continue;}
                    if($_POST['check_consulta']!=1 and $explode_claves[1]==3){ continue;}
                    if($_POST['check_mail']!=1 and $explode_claves[1]==4){ continue;}
                    if($_POST['check_cargas']!=1 and $explode_claves[1]==5){ continue;}
                    if($_POST['check_update']!=1 and $explode_claves[1]==6){ continue;}
                    if($_POST['check_alta_user']!=1 and $explode_claves[1]==7){continue;}
                    
                    
                    $registro=$doc->createElement('Registro');
               
                    $clave_=$doc->createElement('clave',$explode[0]);                    
                    $id_login_=$doc->createElement('id_login',$explode[1]);                    
                    $nombre_usuario=$doc->createElement('nombre_usuario',$explode[2]);                   
                    $nombre_empresa=$doc->createElement('nombre_empresa',$explode[3]);                    
                    $accion=$doc->createElement('accion',$explode[4]);                    
                    $nombre_archivo=$doc->createElement('nombre_archivo',$explode[5]);                    
                    $tipo_comprobante=$doc->createElement('tipo_comprobante',$explode[6]);                    
                    $descripcion=$doc->createElement('descripcion',$explode[7]);                    
                    $fecha=$doc->createElement('fecha',$explode[8]);
                                              
                    $registro->appendChild($clave_);                                        
                    $registro->appendChild($id_login_);
                    $registro->appendChild($nombre_usuario);
                    $registro->appendChild($nombre_empresa);
                    $registro->appendChild($accion);
                    $registro->appendChild($nombre_archivo);
                    $registro->appendChild($tipo_comprobante);
                    $registro->appendChild($descripcion);
                    $registro->appendChild($fecha);      
                    
                    $root->appendChild($registro);
                    
                }                 
            }  /* fin while */                          
                fclose($file);
        }
    }
    else/* Si el log no existe o no está disponible se manda mensaje de error en un XML */
    {
        $error=$doc->createElement('Error');
        $error_=$doc->createElement('error','Lo sentimos, no fué posible abrir el registro... es posible que no exista.');
        $error->appendChild($error_);
        $root->appendChild($error);       
    }
        
        header ("Content-Type:text/xml");        
        echo $doc->saveXML();
    }
    private function log_now()
    {
        $hoy =  date('Ymd');
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Log');
        $doc->appendChild($root); 
        
        $file = fopen("/usr/CFDI/Log/$hoy.txt", "r");
        if($file)
        {
            while(!feof($file))
            {            
                $linea= fgets($file). "<br />";
//                echo $linea;
                $explode=  explode('::',$linea);
                if($explode[0]>0)
                {
                    $registro=$doc->createElement('Registro');
               
                    $clave_=$doc->createElement('clave',$explode[0]);
                    $registro->appendChild($clave_);
                    $id_login_=$doc->createElement('id_login',$explode[1]);
                    $registro->appendChild($id_login_);
                    $nombre_usuario=$doc->createElement('nombre_usuario',$explode[2]);
                    $registro->appendChild($nombre_usuario);
                    $nombre_empresa=$doc->createElement('nombre_empresa',$explode[3]);
                    $registro->appendChild($nombre_empresa);
                    $accion=$doc->createElement('accion',$explode[4]);
                    $registro->appendChild($accion);
                    $nombre_archivo=$doc->createElement('nombre_archivo',$explode[5]);
                    $registro->appendChild($nombre_archivo);
                    $tipo_comprobante=$doc->createElement('tipo_comprobante',$explode[6]);
                    $registro->appendChild($tipo_comprobante);
                    $descripcion=$doc->createElement('descripcion',$explode[7]);
                    $registro->appendChild($descripcion);
                    $fecha=$doc->createElement('fecha',$explode[8]);
                    $registro->appendChild($fecha);                                

                    $root->appendChild($registro);
                }
 
                
            }  /* fin while */  
            
                fclose($file);
        }        
        else/* Si el log no existe o no está disponible se manda mensaje de error en un XML */
        {
            $error=$doc->createElement('error');
            $error_=$doc->createElement('error','Lo sentimos, no fué posible abrir el registro o es posible que no exista');
            $error->appendChild($error_);
            $root->appendChild($error);       
        }
        
        header ("Content-Type:text/xml");        
        echo $doc->saveXML();
    }
    private function get_users()
    {
        $users=  $this->get_users_bd();
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Log');
        $doc->appendChild($root); 
        
        foreach ($users as $valor)
        {
            $usuario=$doc->createElement('Usuario');
            $id_login=$doc->createElement('id_login',$valor['id_login']);
            $usuario->appendChild($id_login);
            $nombre_usuario=$doc->createElement('nombre_usuario',$valor['nombre_usuario']);
            $usuario->appendChild($nombre_usuario);
            $nombre=$doc->createElement('nombre',$valor['nombre']);
            $usuario->appendChild($nombre);
            $apellido_paterno=$doc->createElement('apellido_paterno',$valor['apellido_paterno']);
            $usuario->appendChild($apellido_paterno);
            $apellido_materno=$doc->createElement('apellido_materno',$valor['apellido_materno']);
            $usuario->appendChild($apellido_materno);
            $root->appendChild($usuario);
        }
        
         header ("Content-Type:text/xml");        
        echo $doc->saveXML();
        
    }
    /* Devuelve el listado de usuarios activos en el sistema */
    private function get_users_bd()
    {
        $array=array();
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $q="SELECT id_login, nombre_usuario, nombre, apellido_paterno, apellido_materno FROM login WHERE estatus=1";
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
$return_log=new return_log();
?>
