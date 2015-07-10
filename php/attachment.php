<?php
include '/volume1/web/DAO/Log.php';
//Como no sabemos cuantos archivos van a llegar, iteramos la variable $_FILES
class attachment
{
    public function __construct() {
        $this->subida();
    }
    private function subida()
    {
        $correctos=0;
        $error=0;
        $ruta=''; 
        $tipo_comprobante=0;
        foreach ($_FILES as $key)
          {
              if($key['error'] == UPLOAD_ERR_OK )
                  {
                      $content=$_POST['content'];
                      $ruta='';                
                      if($content=='nomina'){$ruta='/volume1/Inbox_Recibo_Nomina_XML/'; $tipo_comprobante=1;}
                      if($content=='cliente'){$ruta='/volume1/Inbox_Factura_Cliente_XML/'; $tipo_comprobante=2;}
                      if($content=='proveedor'){$ruta='/volume1/Inbox_Factura_proveedor/'; $tipo_comprobante=3;}                

                      $nombre = $key['name'];
                      $temporal = $key['tmp_name']; 
                      move_uploaded_file($temporal, $ruta . $nombre);   
                      $correctos++;

//                      $this->log(36,$_POST['id_login'],$nombre,$tipo_comprobante);
                  }
                  else
                  {
                      $error++;
                      echo $key['error']; //Si no se cargo mostramos el error
                  }
          }
        $inbox_=  explode('/', $ruta);
        echo "<p>$correctos archivo(s) movidos a $inbox_[2]</p>
        <p>$error con error</p>";
    }
   private function log($clave,$id_login,$nombre_archivo,$tipo_comprobante)
    {
//            $log=new Log();                                               
//            $log->arrastre_a_inbox($clave,$id_login,$nombre_archivo,$tipo_comprobante);/* Registro Log */ 
    }    
}

    $subir=new attachment();
   
?>
