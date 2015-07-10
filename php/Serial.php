<?php

/*
 * El archivo txt que se abre consta de dos columnas separadas por comas, la primer
 * columna corresponden a los números de serie y la segunda a la MAC address del equipo que va
 * utilizar el sistema. 
 */
class Serial
{
    private $info=array();    
    public function __construct() {
        $this->get_ajax();
    }
    private function get_ajax()
    {
    if ($_GET['ajaxCrossParam'] == 1)
        {
        $serial=  $_GET['serial'];
        $mac=   $_GET['mac'];
        $mac=  utf8_decode($mac);
        $this->read_and_insert_serial($serial,$mac);            
        $this->info['serial']=$serial;
        $this->info['mac']=$mac;
        $this->info['size_mac']=  strlen($mac);
        if (isset($_GET['callback']))
            {
                echo $_GET['callback'] . '( ' . json_encode($this->info) . ' )';
            } 
            else
            {
             echo 'callbackEjercicio( ' . json_encode($this->info) . ' )';
            }
        }
    }
    /*
     * Se busca el serial dentro del archivo, si no existe una mac esta se registra, si ya existe
     * una mac previamente registrada esta se comprueba que sea la misma que quiere activar el equipo CFDI
     */
    private function read_and_insert_serial($serial,$mac)
    {
        $lineas_archivo_nuevo=array();
        $ruta='ValidacionCFDI.txt';
        $archivo=file_exists($ruta);
        $bandera_serial=0;
        $bandera_mac=0;
        if($archivo)
        {         
            $archivo=fopen($ruta, 'r');
            while(!feof($archivo))
            {                      
                $fila= fgets($archivo);                            
                $fila_dividida=  explode(',', $fila);
                $fila_dividida[1]=  trim($fila_dividida[1]," ");
                $fila_dividida[1]=  utf8_decode($fila_dividida[1]);
               
                if($fila_dividida[0]!=$serial)
                {
                    array_push($lineas_archivo_nuevo,$fila);
                }
                //Si se encuentra el serial
                if($serial==$fila_dividida[0])
                {
                    $this->info['find_serial']="Se encontro el serial";
                    $this->info['mac_asociada']=$fila_dividida[1].".   tamaño=".strlen($fila_dividida[1]);
                    if(strlen($fila_dividida[1])<10)
                    {//Si ya existe una mac asociada debe de ser igual a la mac recibida
                        $this->info['find_mac']="No existe una mac asociada al NS";
                        $bandera=1;
                        $bandera_mac=1;
                    }//Si no existe mac asociada esta se registra
                    if(strlen($fila_dividida[1])>10)
                    {                        
                        $this->info['find_mac']="Se encontro una mac asociada";
                        if($fila_dividida[1]== $mac)
                        {
                            $this->info['find_mac_notif']="La mac Asociada es identica a la registrada";
                            $this->response(1);
                            $bandera_mac=1;
                        }
                        else
                        {
                            $this->info['find_mac_notif']="La mac recibida no corresponde a la asociada";
                            $this->response(0);
                        }
                    }
                }                                                               
            }
            fclose($archivo);
            
            if($bandera==1 and $bandera_mac=1)
            {
                $this->info['size_array']=  count($lineas_archivo_nuevo);
                $this->write_mac($serial, $mac, $lineas_archivo_nuevo);
                $this->response(1);
            }
            if($bandera_mac==0 and $bandera==0 or $bandera==1 and $bandera_mac=0)
            {
                $this->response(0);
            }
        }       
    }
    
    private function write_mac($serial,$mac,$array)
    {
        $ruta='ValidacionCFDI.txt';
        $linea_nueva=PHP_EOL.$serial.",".$mac.",";
        $archivo=fopen($ruta,"w");
        foreach ($array as $valor)
        {
            fwrite($archivo, $valor);
        }
        fwrite($archivo,$linea_nueva);
        fclose($archivo);
    }
    private function response($acceso)
    {
        if($acceso==0)
        {
            $this->info['response_text']="<p>¡Acceso Denegado!. Verifique que el serial de su equipo Synology Nas sea
                \"correcto\".</p> <p>Para soporte consulte la página <a href=\"http://www.cs-docs.com\">www.cs-docs.com</a></p>";
            $this->info['response_value']=0;
        }
        if($acceso==1)
        {
            $this->info['response_text']="Acceso Confirmado";
            $this->info['response_value']=1;
        }
    }
        
}
$serial=new Serial();
?>
