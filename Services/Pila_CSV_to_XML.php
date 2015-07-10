<?php
include '/volume1/web/Transaction/CSV_to_XML.php';
class Pila_CSV_to_XML {
    public function __construct() {
    }
    function enviar_pila($Pila)
    {             
        //Se pone la pila en estado desactivado  y se intenta 2 veces con un intervalo de espera
        // de 1 segundo por cada intento en caso de que no se puediera abrir el archivo de estado se sale del
        //programa     
        $estado=  $this->espera();
        if($estado)
        {                  
            $proceso=new CSV_to_XML();        
                foreach ($Pila as $valor)
                {                
                    if($proceso->CsvtoXml("/volume1/Inbox_Nomina_TXT/",$valor))
                    {
                        continue;
                    }
                    else //Registramos el archivo que no se proceso correctamente
                    {

                    }
                }                
        }
        else
        {
            //Reporte de errores si la pila venia con archivos y no fué posible abrir el archivo estado de la pila
        }
        $on= $this->espera();
        if($on)
        {
            $this->On();
        }
        
    }
    private function On()
    {
            $archivo_estado=fopen("/usr/CFDI/pila.txt", "r+");    
            fwrite($archivo_estado, "1");
            fclose($archivo_estado);    
    }
    private function Off()
    {
            $archivo_estado=fopen("/usr/CFDI/pila.txt", "r+");    
            fwrite($archivo_estado, "0");
            fclose($archivo_estado);    
    }
    private function espera()
    {
        $espera=0;
        $estado=FALSE;        
        while($espera!=3)
            {
                if(!fopen("/usr/CFDI/pila.txt", "r+"))
                {
                    sleep(1);
                    $espera++;
                }
                else
                {
                    $this->Off();
                    $estado=TRUE;
                    $espera=3;
                }                
            }
            return $estado;
    }
}

?>
