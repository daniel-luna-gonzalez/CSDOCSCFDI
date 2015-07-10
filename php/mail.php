<?php
/*
 * Se reciben parametros del archivo barra_herramientas.js de la función enviar_mail
 * Se envia un correo electrónico con el xml y el pdf de cada fecha que se quieran enviar
 * llamada recibida a esta clase desde el archivo barra_herramientas.js
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once "$RoutFile/DAO/Carga_factura_proveedor.php";
require_once "$RoutFile/DAO/Querys.php";
require_once "$RoutFile/Transaction/Read_factura_cliente.php";
require_once  'PHPMailer/class.phpmailer.php';  
require_once "$RoutFile/DAO/Log.php";
require_once 'DataBase.php';
require_once 'XML.php';
//include_once '/volume1/web/Services/MotorCorreos.php';
class mail {
    private $comprobante='';
    private $motor_recolector_movimientos=array();
    public function __construct() {     
        $this->ajax();
    }       
    
    private function ajax()
    {
        if($_POST['opcion']=='envio_mail')
        {
            $this->enviar_mail();
        }
        if($_POST['opcion']=='prueba_imap')
        {
            $this->prueba_imap();
        }
        if($_POST['opcion']=='get_lista_correo')
        {
            $listado=$this->get_lista_correo();
            $this->create_xml_lista_correo($listado);
        }
        if($_POST['opcion']=='eliminar_correo')
        {
            $this->eliminar_correo($_POST['id_correo']);
        }
        if($_POST['opcion']=='modificar_correo')
        {
            $this->modificar_correo();
        }
        if($_POST['opcion']=='get_list_motor')
        {
            $this->get_list_motor();
        }        
        
        if($_POST['opcion']=='motor_descarga_correo')
        {
            $this->motor_descarga_correo();
        }
        
        if($_POST['opcion']=='eliminar_registro_motor')
        {
            $this->eliminar_registro_motor();
        }
        
    }
    
    
    
    /* Devuelve el listado de inserts realizados a través del motor de correos que examina cada correo
     * registrado en busca de comprobantes  */
    
    private function get_list_motor()
    {
        /* Define el tipop de lista de retorno, ya sea listado de validos, invalidos, repetidos, desconocidos*/
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  "CFDI";
        
        $opcion_list=$_POST['opcion_lista_motor'];
        $listado=$this->get_list_motor_bd($opcion_list);
        
        if($listado['Estado']!=1)
        {
            $estado=0;
            $mensaje="Ocurrio un erro en la BD ".$listado['estado'];
            return 0;
        }
        
        $array_listado=$listado['ArrayDatos'];      
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('ListadoMotor');
        $doc->appendChild($root);  
        
        /* Se inserta la información del listado, sí es que éxiste */
        if(count($array_listado)>0)
        {
            $server=  $_SERVER['SERVER_NAME'];    
            foreach ($array_listado as $valor)
            {
                $Listado=$doc->createElement("Listado");
                $id_motor=$doc->createElement("id_motor",$valor['id_motor']);
                $Listado->appendChild($id_motor);
                $emisor=$doc->createElement("emisor",$valor['emisor_nombre']);  
                $Listado->appendChild($emisor);
                $receptor=$doc->createElement("receptor",$valor['receptor_nombre']);
                $Listado->appendChild($receptor);
                $emisor_correo=$doc->createElement("emisor_correo",$valor['emisor_correo']);
                $Listado->appendChild($emisor_correo);
                $monto_factura=$doc->createElement("monto_factura",$valor['monto_factura']);
                $Listado->appendChild($monto_factura);
                $folio=$doc->createElement("folio",$valor['folio']);
                $Listado->appendChild($folio);
                $fecha_factura=$doc->createElement("fecha_factura",$valor['fecha_factura']);
                $Listado->appendChild($fecha_factura);
                $estatus=$doc->createElement("estatus",$valor['estatus_insert']);
                $Listado->appendChild($estatus);
                $ruta_xml=$doc->createElement("ruta_xml",$valor['ruta_xml']);
                $Listado->appendChild($ruta_xml);
//                $ruta_pdf=$doc->createElement("ruta_pdf",$valor['ruta_pdf']);
                $RutaPDF=$valor['ruta_pdf'];
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
                $Listado->appendChild($ruta_pdf);
                $root->appendChild($Listado);
            }
        }

        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 
        
        /* Se crea el XML a devolver */
    }
    
    private function eliminar_registro_motor()
    {
        $id_registro=$_POST['id_registro_motor'];
        
        $estado=1;
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);          
        $q="DELETE FROM motor_correo WHERE id_motor=$id_registro";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $estado= mysql_error();
            }
                   
        mysql_close($conexion);
        $mensaje="Registro eliminado con éxito";    
        if($estado!=1){$estado=0; $mensaje="Error al intentar eleiminar el registro $estado";}
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');
        $doc->appendChild($root);  
        $Resultado=$doc->createElement("EliminarRegistro");
        $resultado_prueba=$doc->createElement("estado",$resultado);
        $Resultado->appendChild($resultado_prueba);
        $Mensaje=$doc->createElement("mensaje",$mensaje);
        $Resultado->appendChild($Mensaje);
        $root->appendChild($Resultado);
        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 
        
    }
    
    private function get_list_motor_bd($opcion_list)
    {
//        $XML=new XML();
//        $BD= new DataBase();
//        $DataBaseName=  "CFDI";
       $estado=1;
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        $array_bd=array();
        
        $q="select mo.id_motor, em.nombre, re.nombre, mo.emisor_correo, mo.monto_factura, 
        mo.folio, mo.fecha_factura, mo.estatus_insert, mo.ruta_xml,mo.ruta_pdf from motor_correo mo 
        inner join emisor_factura_proveedor em on mo.id_emisor=em.idemisor 
        inner join receptor_factura_proveedor re on re.id_receptor=mo.id_receptor WHERE mo.estatus_insert='$opcion_list'
";
        
        mysql_select_db($BD,$conexion);   

        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $estado= mysql_error();
            }
            
        while ($fila = mysql_fetch_array($resultado, MYSQL_NUM)) {
            $array=array("id_motor"=>$fila[0], "emisor_nombre"=>$fila[1],"receptor_nombre"=>$fila[2],
            "emisor_correo"=>$fila[3],"monto_factura"=>$fila[4],"folio"=>$fila[5],"fecha_factura"=>$fila[6]
            ,"estatus_insert"=>$fila[7], "ruta_xml"=>$fila[8],"ruta_pdf"=>$fila[9]);
        array_push($array_bd,$array);
        }                    
        mysql_close($conexion);
        $array_resultado=array("ArrayDatos"=>$array_bd,"Estado"=>$estado);
     return $array_resultado;
    }
    
    private function enviar_mail()
        {      
            $id = $_POST['id'];
            $id_usuario_sistema=$_POST['id_usuario_sistema'];
            $XmlPath = filter_input(INPUT_POST, "XmlPath");
            $PdfPath = filter_input(INPUT_POST, "PdfPath");
            $info_mail=  $this->info_mail_envios($id_usuario_sistema);   

            /*
             * Se obtiene la información del correo del Usuario del Sistema
             */           
            $destinatario_mail=$_POST['destinatario_mail'];/* Se recibe una cadena separada ´por : */            
            $asunto=$_POST['asunto'];
            $mensaje=$_POST['mensaje'];     
            $radio_xml=$_POST['xml'];
            $radio_pdf=$_POST['pdf'];
            $ruta_pdf="";
            $ruta_xml="";           
            
            $tabla='';
            if($_POST['content']=='client')
            {
                $tabla='detalle_factura_cliente';
                $this->comprobante=2;
            }
            if($_POST['content']=='PayRoll')
            {
                $tabla='detalle_recibo_nomina';
                $this->comprobante=1;
            }
            if($_POST['content']=='Provider')
            {
                $tabla='detalle_factura_proveedor';
                $this->comprobante=3;
            }
            
            if($radio_xml==1)         
            {
                if(file_exists($XmlPath))
                    $ruta_xml = $XmlPath;
//                    $ruta_xml=$this->ruta_xml($tabla,$id);
            }
            if($radio_pdf==1)
            {
                if(file_exists($PdfPath))
                    $ruta_pdf = $PdfPath;
//                $ruta_pdf=  $this->ruta_pdf($tabla,$id);   
            }          
            
            $array=  explode(':', $destinatario_mail);

            $this->enviar($info_mail,$array,$asunto,$mensaje,$ruta_xml,$ruta_pdf);                                   
        }
        
private function log($tipo_documento,$destinatario)
    {
//            $log=new Log();                                               
//            $log->write_line_mail(1, $_POST['id_usuario_sistema'],$_POST['id'],$tipo_documento,$destinatario);/* Registro Log */ 
    }  
        
    function enviar($info_mail,$destinatario_mail,$asunto,$mensaje,$ruta_xml,$ruta_pdf)
    {
//            require '/volume1/web/usuario/php/PHPMailer/PHPMailerAutoload.php'; 
            
            $remitente_nombre=$info_mail['titulo_mostrar'];
            $remitente_mail=$info_mail['correo'];
                        
            $mail = new PHPMailer();         
        $mail->isSMTP();           
//        $mail->SMTPDebug = 1;// Set mailer to use SMTP
        $mail->Host = $info_mail['smtp'];  // Specify main and backup server
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = $remitente_mail;                            // SMTP username
        $mail->Password = $info_mail['password'];                           // SMTP password
        if($info_mail['seguridad']!="")
        {
            $mail->SMTPSecure = $info_mail['seguridad'];                           // Enable encryption, 'ssl' also accepted            
        }
        $mail->Port=$info_mail['PuertoSmtp'];
        
        
        $mail->From = $remitente_mail;
        $mail->FromName = $remitente_nombre;
        

        if($ruta_xml!="")
        {
             $mail->addAttachment($ruta_xml);         // Add attachments
        }
        if($ruta_pdf!="")
        {
             $mail->addAttachment($ruta_pdf);         // Add attachments
        }
//        $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
        $mail->isHTML(true);                                  // Set email format to HTML

        $mail->Subject = utf8_decode($asunto);
        $mail->Body    = utf8_decode($mensaje);
//        $mail->AltBody = 'Texto enviado desde PHP maquina Daniel - PC';
         
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');                  
        
        foreach ($destinatario_mail as $valor)
        {
            if(!strlen($valor)>0)
                continue;
            $envio = $doc->createElement('envio');
            $mail->addAddress($valor);  // Add a recipient
            $estado_envio=0;
            
            if(!$mail->send()) {  
              $status=$doc->createElement('status',0);
              $envio->appendChild($status);
              $msj=$doc->createElement('mensaje','Error al enviar a '.$valor.":  "  . $mail->ErrorInfo);              
              $envio->appendChild($msj);

            }
            else
            {
                $status=$doc->createElement('status',1);
                $envio->appendChild($status);
                $msj=$doc->createElement('mensaje',"¡Enviado con éxito a $valor!");                  
                $envio->appendChild($msj);

                $estado_envio=1;
                if($estado_envio==1)
                {
//                    $this->log($this->comprobante, $valor);/* Log */
                }
            }       
            
            $root->appendChild($envio);     
        }
        
        $doc->appendChild($root);        
//        $doc->save('/volume1/public/envios.xml'); 
        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 

    }
       
    /* Regresa la información del correo dedicado a envios */
     function info_mail_envios($id_usuario)
    {      
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);   /* Solo éxiste una cuenta de correo para envios, si se afecta este query
         * Modificar la clase de admin_alta_usuario */     
        $q="SELECT lo.IdUsuario, lo.tipo_usuario,  co.servidor,co.smtp,co.PuertoSmtp,co.seguridad,co.auth,co.password,co.correo, co.titulo_mostrar FROM correo co inner join Usuarios lo on lo.IdUsuario=co.id_empleado where co.smtp!='NULL'";/*where id_empleado=$id_usuario";*/
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        
        $fila = mysql_fetch_assoc($resultado);                    
        mysql_close($conexion);
     return $fila;
    }                  
            
     private function prueba_imap()/* El parametro define si se refiere a un insert o a una modificacion */
    {
         $host=trim($_POST['host']);
         $servidor=$_POST['host'];
         $usuario=trim($_POST['usuario']);
         $password=trim($_POST['password']);
         $puerto=$_POST['puerto'];

         $INBOX='INBOX';/* Usado comunmente por gmail y yahoo */
         if(strcasecmp($host,'gmail')==0)
         {
             $puerto=993;
             $host='imap.gmail.com';
             $usuario.="@gmail.com";
             $ruta_imap="{imap.gmail.com:993/imap/ssl}INBOX"; 
             
         }
         else if(strcasecmp($host,'hotmail')==0)
         {
             $puerto=993;
             $host='imap-mail.outlook.com';
             $ruta_imap="{imap-mail.outlook.com:$puerto/imap/ssl/novalidate-cert}INBOX";
             $usuario.='@hotmail.com';
             
         }
         
         else if(strcasecmp($host,'yahoo')==0)
         {
             $puerto=993;
             $host='imap.mail.yahoo.com';
             $ruta_imap="{imap.mail.yahoo.com:$puerto/imap/ssl/novalidate-cert}INBOX";
             
         }
         else if(strcasecmp($host,'live')==0)
         {
             $puerto=993;
             $host='imap-mail.outlook.com';
             $ruta_imap="imap-mail.outlook.com:$puerto/imap/ssl/novalidate-cert";
             $usuario.='@live.com';             
         }
         else if(strcasecmp($host,'otro')==0)
         {
             $host=$_POST['server'];
             $ruta_imap="{".$host.":".$puerto."/imap/ssl/novalidate-cert}".$INBOX;
         }
         
         
         $imap=  $this->conexion_imap($ruta_imap, $usuario, $password);
         $resultado=$imap;
         $mensaje="Cuenta Comprobada correctamente. ";
         
         if($resultado==1)
         {
             if(($estado_insert=$this->insert_imap($host, $servidor,$puerto, $usuario, $password, $_POST['id_usuario'])!=1))
             {
                 $resultado=0;
                 $mensaje.=' Problema al realizar el insert en la BD '.$estado_insert;
             }
         }
         else
         {
             $mensaje=$resultado;
             $resultado=0;
         }

        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');
        $doc->appendChild($root);  
        $Resultado=$doc->createElement("Resultado");
        $resultado_prueba=$doc->createElement("estado",$resultado);
        $Resultado->appendChild($resultado_prueba);
        $Mensaje=$doc->createElement("mensaje",$mensaje);
        $Resultado->appendChild($Mensaje);
        $root->appendChild($Resultado);
        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 
        
        
    }
    /* Comprueba si los datos para IMAP son correctos */
    private function conexion_imap($ruta_imap,  $usuario, $password)
    {
//        echo "<p>$ruta_imap</p>";
//        echo "<p>$usuario</p>";
//        echo "<p>$password</p>";
        /* Datos devueltos por default */
        $estado=1;
        if(($mbox = imap_open ($ruta_imap,  $usuario, $password)))
             imap_close($mbox);             
        else
        {
            XML::XmlResponse("Error", 0, "<p>Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>");
//            $estado="Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>";  
            $estado = 0;                    
        }
                
        return $estado;
    }
    /* Modifica la información de un correo IMAP */
    private function modificar_correo()
    {
        /* Se comprueba la configuración de los nuevos datos */
        $ruta_imap="{".$_POST['host'].":".$_POST['puerto']."/imap/ssl/novalidate-cert}";
        $imap=  $this->conexion_imap($ruta_imap, $_POST['usuario'], $_POST['password']);
        $resultado=$imap;
        if($resultado==1)
        {
            $resultado=  $this->modificar_correo_bd();
            $mensaje="Correo validado y modificado con éxito";
            if($resultado!=1)            
            {
                $mensaje=$resultado;
                $resultado=0;
            }
        }
        else
        {
            
            $mensaje=$resultado;
            $resultado=0;
            return 0;
        }
                
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');
        $doc->appendChild($root);  
        $Resultado=$doc->createElement("Modificar");
        $resultado_prueba=$doc->createElement("estado",$resultado);
        $Resultado->appendChild($resultado_prueba);
        $Mensaje=$doc->createElement("mensaje",$mensaje);
        $Resultado->appendChild($Mensaje);
        $root->appendChild($Resultado);
        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 
    }
    
    private function modificar_correo_bd()
    {
        $id_correo=$_POST['id_correo'];
        $id_empleado=$_POST['id_usuario'];        
        $servidor=$_POST['servidor'];
        $host=$_POST['host'];
        $puerto=$_POST['puerto'];
        $usuario=$_POST['usuario'];
        $password=$_POST['password'];
        
        $estado=1;
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);        
        $q="UPDATE correo SET id_empleado=$id_empleado, servidor='$servidor', correo='$usuario', password='$password', "
        . "host_imap='$host', puerto=$puerto where id_correo=$id_correo";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $estado= mysql_error();
            }

        mysql_close($conexion);
        return $estado;
    }
    
    /* Insert en la Base con la información del correo IMAP */
    private function insert_imap($host,$servidor,$puerto, $usuario, $password,$id_usario)
    {
        $estado=1;
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);        
        $q="INSERT INTO correo (id_empleado, servidor, host_imap, puerto, correo, password) "
        . "VALUES ($id_usario, '$servidor', '$host', $puerto, '$usuario', '$password' )";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $estado= mysql_error();
            }

        mysql_close($conexion);
        return $estado;
    }
    
    /* Devuleve el listado de correos IMAP */
    function get_lista_correo()
    {
        $array_resultado="";
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);        
        $q="SELECT id_correo, servidor, host_imap,puerto, correo, password FROM correo where estatus=1 AND host_imap!=''";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;
                echo($mensaje);
            }
        while ($fila = mysql_fetch_assoc($resultado))
        {
            $array_resultado[]=$fila;              
        }

        mysql_close($conexion);
        
        return $array_resultado;
    }
    
    private function create_xml_lista_correo($array_correo)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');
        $doc->appendChild($root);  

        foreach ($array_correo as $valor)
        {
            $Correo=$doc->createElement("Correo");
            $id_correo=$doc->createElement("id_correo",$valor['id_correo']);
            $Correo->appendChild($id_correo);
            $servidor=$doc->createElement("servidor",$valor['servidor']);
            $Correo->appendChild($servidor);
            $host_imap=$doc->createElement("host_imap",$valor['host_imap']);
            $Correo->appendChild($host_imap);
            $puerto=$doc->createElement("puerto",$valor['puerto']);
            $Correo->appendChild($puerto);
            $correo=$doc->createElement("correo",$valor['correo']);
            $Correo->appendChild($correo);
            $password=$doc->createElement("password",$valor['password']);
            $Correo->appendChild($password);
            $root->appendChild($Correo);
        }                      
        header ("Content-Type:text/xml");        
        echo $doc->saveXML();         
    }
    
    /* Se da de baja una cuenta IMAP */
    private function eliminar_correo($id_correo)
    {
        $estado=$this->baja_correo($id_correo);
        $mensaje="Correo dado de baja con éxito.";
        if($estado!=1)
        {
            $mensaje='Ocurrió un error al intentar dar de baja el correo seleccionado. '.$estado;
        }
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Mail');
        $doc->appendChild($root);
        $eliminar=$doc->createElement("Eliminar");
        $Estado=$doc->createElement("estado",$estado);
        $eliminar->appendChild($Estado);
        $Mensaje=$doc->createElement("mensaje",$mensaje);
        $eliminar->appendChild($Mensaje);
        $root->appendChild($eliminar);
        header ("Content-Type:text/xml");        
        echo $doc->saveXML();         
        
    }
    
    private function baja_correo($id_correo)
    {
        $estado=1;
        $Querys=new Querys();
        $conexion=$Querys->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);        
        $q="UPDATE correo SET estatus=0 WHERE id_correo=$id_correo";
        $resultado = mysql_query($q);
        if (!$resultado)
            {
                $estado= mysql_error();
            }
        mysql_close($conexion);
        return $estado;
    }
    
    /* Al recibir un cfdi inválido, esta se reenvia a su emisor para notificarle */
    function respuesta_cfdi_invalido($info_mail,$destinatario_mail,$asunto,$mensaje,$archivos)
    {            
            $remitente_nombre=$info_mail['titulo_mostrar'];
            $remitente_mail=$info_mail['correo'];
                        
            $mail = new PHPMailer();         
        $mail->isSMTP();           
//        $mail->SMTPDebug = 1;// Set mailer to use SMTP
        $mail->Host = $info_mail['smtp'];  // Specify main and backup server
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = $remitente_mail;                            // SMTP username
        $mail->Password = $info_mail['password'];                           // SMTP password
        $mail->SMTPSecure = $info_mail['seguridad'];                           // Enable encryption, 'ssl' also accepted
        $mail->Port=$info_mail['puerto'];
        
        
        $mail->From = $remitente_mail;
        $mail->FromName = $remitente_nombre;
        
        if(file_exists($archivos['xml'])){
            $mail->addAttachment($archivos['xml'], '');    // Optional name
        }
        
        if(file_exists($archivos['pdf'])){
            $mail->addAttachment($archivos['pdf'], '');    // Optional name
        }
        
        $mail->isHTML(true);                                  // Set email format to HTML

        $mail->Subject = utf8_decode($asunto);
        $mail->Body    = utf8_decode($mensaje);
//        $mail->AltBody = 'Texto enviado desde PHP maquina Daniel - PC';
                                  
        $mail->addAddress($destinatario_mail);  // Add a recipient

        if(!$mail->send()) {          
            printf("\n".$mail->ErrorInfo); 
        }     
    }
    
    /* Se inicia la descarga de archivos desde la bandeja de entrada de un correo determinado */
    private function motor_descarga_correo()
    {      
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  "CFDI";
        
         $id_correo=$_POST['id_correo'];
         $host=trim($_POST['host']);
         $servidor=$_POST['servidor'];
         $correo=trim($_POST['correo']);
         $password=trim($_POST['password']);
         $puerto=$_POST['puerto'];
         $nombre_usuario=$_POST['nombre_usuario'];
         $savedirpath='/volume1/web/correoCFDI/extraidos/'.$nombre_usuario.'/';   
         $dir_extraidos=$savedirpath;
         
         $ResultObtenerAdjuntos = $this->obtener_adjuntos($host,$puerto,$correo,$password,$savedirpath);
         
         if($ResultObtenerAdjuntos == 0)
             return;
         
         $array_archivos=$this->escaneo_dir_extraidos($savedirpath);
         if(!is_array($array_archivos))
             return 0;
//         printf("<p> Iniciando validacion </p>");
         
         $dir_invalidos="/volume1/web/correoCFDI/invalidos/$nombre_usuario/"; /* CFDI invalidos o existentes */
        foreach ($array_archivos as $valor)
        {          
            $id_motor_insert=0;/* Se guardan los ids de los inserts para devolver una consulta con el detalle de
             *                      movimientos */
            
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
            $correo_envios=$this->info_mail_envios(0);
            
            /* Comprobación de parámetros para validación */
            if(!is_array($array_read_xml))
            {
//                    printf("Formato incorrecto");
                $id_motor_insert=$this->notificar_cfdi_invalido($nombre_usuario,$id_correo,$carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'invalido');                

                continue;
            }
            if(strlen($array_read_xml['emisor']['rfc'])==0 or strlen($array_read_xml['receptor']['rfc'])==0 or strlen($array_read_xml['timbreFiscalDigital']['UUID'])==0)
            {
//                    printf('\n xml invalido '.$valor['xml']);  
                $id_motor_insert=$this->notificar_cfdi_invalido($nombre_usuario,$id_correo,$carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'invalido');                
                continue;
            }
            
            
            /* Validación del CFDI */
            $validacion_web=  new webservice_sat();
            $validacion=$validacion_web->valida_cfdi($array_read_xml['emisor']['rfc'], $array_read_xml['receptor']['rfc'], $array_read_xml['encabezado']['total'], $array_read_xml['timbreFiscalDigital']['UUID']);
//            echo ("<p> validando.... E rfc=". $array_read_xml['emisor']['rfc']." R rfc=". $array_read_xml['receptor']['rfc']." total=". $array_read_xml['encabezado']['total']." UUID=". $array_read_xml['timbreFiscalDigital']['UUID']."</p>");
            if(!is_object($validacion))
            {
                /* Se registra en el sistema el archivo como inválido y se notifica al correo emisor. */
//                printf("\n Fallo en validacion ". $valor['xml'] ."reenviando a ".$valor['correo']);    
                $id_motor_insert=$this->notificar_cfdi_invalido($nombre_usuario,$id_correo,$carga_proveedor,$correo_envios,$valor['xml'], $valor['pdf'],$valor['correo'],'invalido');                
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
                $id_motor_insert=$this->insert_motor_correo($id_correo,$carga_proveedor,$valor['correo'], 'valido',$ruta.$nombre_xml,$ruta_pdf);
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
                    $intentos=$carga_proveedor->obtener_intentos($carga_proveedor->id_emisor, $nombre_xml);                                  
                    if(file_exists($dir_extraidos.$valor['correo']."/".$valor['pdf']))
                    {
                        rename($dir_extraidos.$valor['correo']."/".$valor['pdf'], $dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$valor['pdf']);
                        $ruta_pdf=$dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$valor['pdf'];
                    }
                    if(file_exists($dir_extraidos.$valor['correo']."/$nombre_xml"))
                    {
                        rename($dir_extraidos.$valor['correo']."/".$nombre_xml, $dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$nombre_xml);                        
                        $ruta_xml=$dir_invalidos.$valor['correo']."/Existe_".$intentos."_".$nombre_xml;
                    }
                    
                    $id_motor_insert=$this->insert_motor_correo($id_correo,$carga_proveedor,$valor['correo'], 'repetido',$ruta_xml,$ruta_pdf);
                }                            
                array_push($this->motor_recolector_movimientos,$id_motor_insert);                
            /* Se limpian las variables globales */
            while(count($carga_proveedor->emisor )) array_pop($carga_proveedor->emisor );
            while(count($carga_proveedor->receptor )) array_pop($carga_proveedor->receptor );
            while(count($carga_proveedor->detalle )) array_pop($carga_proveedor->detalle);
            while(count($carga_proveedor->array_xml)) array_pop($carga_proveedor->array_xml);
            
            /* Insert en la BD */
        }
        $this->motor_detalle_movimientos();
        
        /* Se obtiene el detalle de movimientos realizando una consulta */
        
        
    }
    private function motor_detalle_movimientos()
    {
        $server=  $_SERVER['SERVER_NAME'];    
        $array_ids=  $this->motor_recolector_movimientos;

        /* Se crea un xml para devolver respuesta */
         $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('RespuestaDescargaCorreo');
        $doc->appendChild($root);  
        
        if(count($array_ids)>0)
        {
            foreach ($array_ids as $valor)
            {
                $Resultado=$doc->createElement("DescargaCorreo");
                $id_motor=$doc->createElement("id_motor",$valor['id_motor']);
                $Resultado->appendChild($id_motor);
                $nombre_emisor=$doc->createElement("nombre_emisor",$valor['nombre_emisor']);
                $Resultado->appendChild($nombre_emisor);
                $nombre_receptor=$doc->createElement("nombre_receptor",$valor['nombre_receptor']);
                $Resultado->appendChild($nombre_receptor);
                $emisor_correo=$doc->createElement("emisor_correo",$valor['emisor_correo']);
                $Resultado->appendChild($emisor_correo);
                $total_factura=$doc->createElement("total_factura",$valor['monto_factura']);
                $Resultado->appendChild($total_factura);
                $folio_factura=$doc->createElement("folio_factura",$valor['folio']);
                $Resultado->appendChild($folio_factura);
                $fecha_factura=$doc->createElement("fecha_factura",$valor['fecha_factura']);
                $Resultado->appendChild($fecha_factura);
                $estatus=$doc->createElement("estatus",$valor['estatus']);
                $Resultado->appendChild($estatus);
                $ruta_xml=$doc->createElement("ruta_xml",$valor['ruta_xml']);
                $Resultado->appendChild($ruta_xml);
                $RutaPDF=$valor['ruta_pdf'];
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
                    $Resultado->appendChild($ruta_pdf);
                    $root->appendChild($Resultado);               
                }
        }                       
        header ("Content-Type:text/xml");        
        echo $doc->saveXML(); 
    }
    /* Todos los archivos recibidos por correo se dirigen al directorio de extraidos y los devuelve en un array */
    function escaneo_dir_extraidos($directorio_raiz)
    {
//        printf("\n Monitoreo de Directorios");
        $array_archivos=array();
        $stack_pdf_xml=array();
        if(!file_exists($directorio_raiz))
        {
            echo "Sin correos descargados";
            return 0;
        }
         $escaneo=scandir($directorio_raiz);     
         foreach ($escaneo as $scan) 
         {             
            if ($scan != '.' and $scan != '..')
            {
                
                if(is_dir($directorio_raiz.$scan))
                {                   
//                    printf("\n\nIniciando escaneo de $scan");
                    foreach (scandir($directorio_raiz.$scan) as $archivo)
                    {
                        if ($archivo != '.' and $archivo != '..')
                        {
                            $array_archivos[]=$archivo;
//                            echo("<p>Archivo dentro de dir $archivo</p>");
                        }                        
                    }
                    /* fin de escaneo en directorio de correo, se organizan los pares de PDF y XML */  
//                    echo "<p>Peso array ".count($array_archivos)."</p>";
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
         
//         printf("<br><p> Array con Pares CFDI </p>");
//         foreach ($stack_pdf_xml as $valor)
//         {
//             echo("<br><p> xml=". $valor['xml']. " pdf=".$valor['pdf']." correo=".$valor['correo']."<p>");
//         }
         return $stack_pdf_xml;
    }
    
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
       $nombre_receptor=$carga_proveedor->array_xml['receptor']['nombre'];
       $nombre_emisor=$carga_proveedor->array_xml['emisor']['nombre'];
       
       if($nombre_emisor=='' or $nombre_emisor==null){$nombre_emisor='No disponible';}
       if($nombre_receptor=='' or $nombre_receptor==null){$nombre_receptor='No disponible';}
       if($fecha==null or $fecha==''){$fecha='No disponible';}
       if($total=='' or $total==null){$total=0;}
       if($folio=='' or $folio==null){$folio='S/F';}
       
       $hora_envio= date("Y-m-d H:i:s");
       $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);                
                       
        $query="INSERT INTO motor_correo (id_correo,id_emisor, id_receptor, id_detalle, emisor_correo, monto_factura,"
        . "folio, fecha_factura, fecha_ingreso, estatus_insert, ruta_xml, ruta_pdf) VALUES ($id_correo,$carga_proveedor->id_emisor,"
        . "$carga_proveedor->id_receptor, $carga_proveedor->id_detalle, '$correo_emisor',$total, '$folio',"
        ."'$fecha', '$hora_envio', '$estatus_insert','$ruta_xml','$ruta_pdf')";
         
        $resultado=mysql_query($query,$conexion);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $query;
                printf("\n".$mensaje);
            }                                   
        $id=mysql_insert_id();
        mysql_close($conexion);
        
         $array_info_motor=array("id_motor"=>$id,
         "nombre_emisor"=>$nombre_emisor
         ,"nombre_receptor"=>$nombre_receptor,
         "emisor_correo"=>$correo_emisor,
         "monto_factura"=>$total,
         "folio"=>$folio,
         "fecha_factura"=>$fecha,
         "estatus"=>$estatus_insert,"ruta_xml"=>$ruta_xml,"ruta_pdf"=>$ruta_pdf         
             );
        
         return $array_info_motor;
   }
   
   /* Se registra en el sistema el archivo inválido y se notifica al emisor */
    function notificar_cfdi_invalido($nombre_usuario,$id_correo,$instancia_carga_factura,$correo_envios,$nombre_xml,$nombre_pdf,$correo_emisor,$estatus)
    {
        $dir_extraidos="/volume1/web/correoCFDI/extraidos/$nombre_usuario/$correo_emisor/";
        $dir_invalidos="/volume1/web/correoCFDI/invalidos/$nombre_usuario/$correo_emisor/"; /* CFDI invalidos o existentes */
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
        
        $id_motor_insert=$this->insert_motor_correo($id_correo,$instancia_carga_factura, $correo_emisor, "$estatus",$ruta_xml,$ruta_pdf);
        
        $archivos_respuesta=array("xml"=>$dir_invalidos.$nombre_xml,"pdf"=>$dir_invalidos.$nombre_pdf);
        /* Mensaje enviado por Correo electrónico para notificación de Facturas inválidas */
        $mensaje="<p>El sistema CSDocs CFDI ha detectado que la siguiente Factura es inválida, ya que no se "
                . "encuentra en la Base de Datos del SAT, por favor envié una Factura válida. </p>"
                . "<br>"
                . "<p>$nombre_xml</p>"
                . "<p>$nombre_pdf</p>";
        $this->respuesta_cfdi_invalido($correo_envios, $correo_emisor, 'Devolución de CFDI Inválido', $mensaje, $archivos_respuesta);
        return $id_motor_insert;
    }
    
    
    /* Obitiene los archivos adjuntos de una cuenta de correo (XML y PDF) */
    function obtener_adjuntos($host,$puerto,$login,$password,$savedirpath)
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  "CFDI";
        $ruta_imap="{".$host.":".$puerto."/imap/ssl/novalidate-cert}";
    
        if(!($mbox = imap_open ($ruta_imap,  $login, $password)))
        {
            $XML->ResponseXML("Error", 0, "Ocurrió el siguiente error. ".imap_last_error());
            return 0;
        }
    
    for ($jk = 1; $jk <= imap_num_msg($mbox); $jk++)
        {
            /* get information specific to this email */
            $overview = imap_fetch_overview($mbox,$jk,0);
            $message = imap_fetchbody($mbox,$jk,2);
            $structure = imap_fetchstructure($mbox,$jk);

            $attachments = array();
            if(isset($structure->parts) && count($structure->parts))
            {
                for($i = 1; $i < count($structure->parts); $i++) 
            {
            $structure = imap_fetchstructure($mbox, $jk );    
            $parts = $structure->parts;
            $fpos=2;
            for($i = 1; $i < count($parts); $i++)
            {
                /* Se ignoran otros formatos que no sean XML y PDF */
                if(!($structure->parts[$i]->subtype=="xml" or $structure->parts[$i]->subtype=="pdf" or $structure->parts[$i]->subtype=="XML" or $structure->parts[$i]->subtype=="PDF"))
                continue;


                $attachments[$i] = array(
                'is_attachment' => false,
                'filename' => '',
                'name' => '',
                'attachment' => '');

                if($structure->parts[$i]->ifdparameters)
                {
                    foreach($structure->parts[$i]->dparameters as $object) {
                        if(strtolower($object->attribute) == 'filename') {
                            $attachments[$i]['is_attachment'] = true;
                            $attachments[$i]['filename'] = $object->value;
                    }
                    }
                }
               
                if($structure->parts[$i]->ifparameters) {
                    foreach($structure->parts[$i]->parameters as $object) {
                        if(strtolower($object->attribute) == 'name') {
                            $attachments[$i]['is_attachment'] = true;
                            $attachments[$i]['name'] = $object->value;
                        }
                    }
                }

                if($attachments[$i]['is_attachment']) {
                    $attachments[$i]['attachment'] = imap_fetchbody($mbox, $jk, $i+1);
                    if($structure->parts[$i]->encoding == 3) { // 3 = BASE64
                        $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
                    }
                    else if($structure->parts[$i]->encoding == 4) { // 4 = QUOTED-PRINTABLE
                    $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
                    }
                }      
                $filename=$structure->parts[$i]->dparameters[0]->value;
//                printf("\n nombre= $filename extension =". $structure->parts[$i]->subtype);

                /* Se obtiene el emisor */
                $result = imap_fetch_overview($mbox,$jk);          
                $regexp = '/([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+/i';
                preg_match_all($regexp, $result[0]->from, $m,PREG_PATTERN_ORDER);/* Se busca la estructura de correo */
                $correo_emisor=$m[0][0];
//                printf ("\n ".$correo_emisor);
                

                /* Se mueve el archiv descargado al directorio de recibidos */
                if(!file_exists($savedirpath.$correo_emisor."/"))
                {
                    mkdir( $savedirpath.$correo_emisor."/",0777, true);
                    chmod( $savedirpath.$correo_emisor."/",  0777); 
                }

                /* Se almacena el adjunto */
                foreach($attachments as $at)
                {
                    if($at['is_attachment']==1)
                    {
                        file_put_contents($savedirpath.$at['filename'],$at['attachment']);
                    }
                }
                /* Se mueve al directorio destino */
                
                if(rename($savedirpath.$filename, $savedirpath.$correo_emisor."/".$filename))
                {
//                    echo "<p>Se movio $filename</p>";
                }
                if(file_exists($savedirpath.$filename))
                {
                    unlink($savedirpath.$filename);
                }
            }
            
         }
       }
//            imap_mail_move($mbox, $jk, $buzon_destino);
//imap_delete tags a message for deletion
    imap_delete($mbox,$jk);


        }
// imap_expunge deletes all tagged messages
//                    imap_expunge($mbox);
        imap_close($mbox,CL_EXPUNGE);       
        return 1;
    }
    
    
}

$mail=new mail();

