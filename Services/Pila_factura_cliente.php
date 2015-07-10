<?php
include  '/volume1/web/DAO/Carga_factura_cliente.php';
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Pila_factura_cliente
 *
 * @author jose
 */
class Pila_factura_cliente {
    public function __construct() {
        
    }
    public function enviar_pila($Pila)
    {             
        //Se pone la pila en estado desactivado  y se intenta 2 veces con un intervalo de espera
        // de 1 segundo por cada intento en caso de que no se puediera abrir el archivo de estado se sale del
        //programa     
       // $estado=  $this->espera();
//        if($estado)
//        {
             $this->Off();
                
          //  echo "Variable estado VERDADERO"; 
//            echo "Metodo enviar_pila() peso de pila=".count($Pila); 
           $carga=new Carga_factura_cliente();                               
           $espera=$carga->Cachar_Datos($Pila);    
           
//               if($espera)
//               {
//                   //Se libera la pila
//               }           
      
                $this->On();
//        }
       
            
       
            //Reporte de errores si la pila venia con archivos y no fué posible abrir el archivo estado de la pila
           // echo "Variable estado FALSO";
        
//              echo "TERMINA EJECUCION DE PILA"        ;
    }
    private function On()
    {
            $archivo_estado=fopen("/usr/CFDI/Factura_Cliente/pila.txt", "r+");    
            fwrite($archivo_estado, 1);
            fclose($archivo_estado);   
//            echo "PILA ENCENDIDA";
    }
    private function Off()
    {
            $archivo_estado=fopen("/usr/CFDI/Factura_Cliente/pila.txt", "r+");    
            fwrite($archivo_estado, 0);
            fclose($archivo_estado);    
//            echo "PILA APAGADA";
    }
    private function espera()
    {
        echo "Pila metodo espera()";
        $espera=0;
        $estado=FALSE;        
        while($espera!=10)
            {
                if(!fopen("/usr/CFDI/Factura_Cliente/pila.txt", "r+"))
                {
                    sleep(5);
                    $espera++;
                }
                else
                {
                    $this->Off();
                    $estado=TRUE;
                    $espera=3;
                }                
            }
            echo "Variable estado=".$estado;
            return $estado;
    }
//    public function Read_security_Log()
//    {
//        echo "METODO READ EN PILA";
//        $security=new Carga_xml_nomina();
//        $security->Read_Log_File();
//        unset($security);
//    }    
}
?>
