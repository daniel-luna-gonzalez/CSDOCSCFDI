<?php
/*
 * Se encarga de mover los Recibos al directorio de timbrado
 */
include '/volume1/web/Services/Pila_factura_cliente.php';
class Monitor_factura_cliente {
   private $initial_files=array();
    private $carga_nueva=array();
    private $cola=array(); 
    private $stack_xml_pdf=array();
    private $status=TRUE,$archivo_estado;
    private $giro=0;
  public function __construct($archivo_log,$archivo_estado,$directory_monitor)
    {        
        $this->archivo_estado=$archivo_estado;
        $this->Status();        
        $this->Update($directory_monitor);
        $this->Monitorear($archivo_log,$directory_monitor);         
    }
    function Monitorear($archivolog,$directory_monitor)
    {          
         /* A partir de que se detectan nuevos archivos el contador de giros = 0 
            y cuando llgue a 5 se envian todos los archivos que contenga el array Cola 
         *  Sí está vacio no se envía nada             */
        
        //Inicio de Bucle de Comprobación
        $inicio=0;
        while($this->status==TRUE)
        {
            if($this->Status()==1)
            {
                sleep(5);     
//    *******  Se realiza un comparativo entre arrays para observar cambios **********}
                
                if($inicio==0)
                {
                    $array=array();
//                    printf("\n Primera comprobación");
                    $estado=$this->getNewFiles($this->initial_files,$array);
                    
                    if($estado)
                    {  
                        //Se actualiza el estado actual de los elementos del directorio                    
                        $this->Update($directory_monitor);             
                    }
                    
                    $inicio++;
                }
               
//              Se llena el segundo array
                $this->Repeat_Update($directory_monitor); 
                
//              Se compara el arreglo inicial con el final 
                $estado=$this->getNewFiles($this->carga_nueva,$this->initial_files);
                if($estado)
                {  
                    //Se actualiza el estado actual de los elementos del directorio                    
                    $this->Update($directory_monitor);
                }
                
                //Se compra si el arreglo nuevo es menor al actual
                //si se cumple significa que se borraron archivos del directorio
                
               if(count($this->carga_nueva)<  count($this->initial_files))
               {
//                   printf("\n\n Se detectaron menos archivos");
                   $this->getDeleteFiles($this->initial_files,  $this->carga_nueva);
               }                                                    
                
//                $contador++;       
//                $this->Marca_Conteo($archivolog,$contador);      
                                  
                
            }
            
            if($this->Status()==2)                
            {        
                sleep(0.3);
                continue;
            }
            
            //Si el estado esta apagado
            if($this->Status()==0)
            {
                continue;
            }
        }//fin while    
    }

    function Update($directorio)
    {
//              Directorio Inicial
//            $directorio="/volume1/Inbox_Nomina_TXT";
            $escaneo=scandir($directorio);     
            $resultado="";
            // se borra el arreglo si es que tiene algo
            if(count($this->initial_files)>0)
            {
                while(count($this->initial_files)) array_pop($this->initial_files);
            }
            
            //Se llena el arreglo Inicial
            foreach ($escaneo as $valor)
            {
                if($valor==='.' || $valor==='..'||$valor==='...'){continue;}            
                else
                {
                    array_push($this->initial_files, $valor);
                }
                
            }
            
            foreach ($this->initial_files as $valor)
            {
                $resultado=$resultado.$valor;
            }
            
            $archivo_estado=fopen("/usr/CFDI/datos.txt", "w+");    
            fwrite($archivo_estado, $resultado);
            fclose($archivo_estado);    
    }
    function Repeat_Update($directorio)
    {        
//        $resultado="";
        //Se limpia el arreglo carga nueva
        while(count($this->carga_nueva )) array_pop($this->carga_nueva );
        
        //Se abre el directorio monitoreado
        $escaneo=scandir($directorio);     
        
        //Se llena el arreglo carga nueva con el nuevo contenido
        foreach ($escaneo as $valor)
        {
            if($valor==='.' || $valor==='..'||$valor==='...'){continue;}            
            else
            {
                array_push($this->carga_nueva, $valor);
            }
        }
        foreach ($this->carga_nueva as $valor)
        {
            $resultado=$resultado.$valor;
        }
            
//        $archivo_estado=fopen("/usr/CFDI/datos_n.txt", "w+");    
//        fwrite($archivo_estado, $resultado);
//        fclose($archivo_estado); 
    }
    
    // Método que envia los nuevos archivos detectados a la Clase Pila.php
    function getNewFiles($inicial, $giro)
    {
        $estado=FALSE;
         $resultado="";
         
//         while(count($this->cola )) array_pop($this->cola );
         
        //devuelve un array con las diferencias entre el array inicial y el actualizado                
         $getNewFiles= array_diff($inicial, $giro);       
              
       //Se introducen los nuevos valores en formación
       foreach ($getNewFiles as $valor)
       {
           array_push($this->cola, $valor); 
       }                 
       
       foreach ($this->cola as $valor)
        {
//           printf("\n EN COLA: $valor");
            $resultado=$resultado.$valor;
        }
       
        $archivo_estado=fopen("/usr/CFDI/Factura_Cliente/nuevos.txt", "r+");    
        fwrite($archivo_estado, $resultado);
        fclose($archivo_estado);                                         
                    
        
       // Si se detectaron archivos nuevos se devuelve TRUE
       if(count($getNewFiles)>0)
       {
           $estado=TRUE;                                                   
           
            $this->search_pdf_in_stack(); /* Se buscan pares de XML y PDF */
                        
            /* Los archivos que no encontraron para dentro de Cola y en el Imbox existen archivos
             * estos se toman y se realiza una búsqueda de par con los archivos impares faltantes. */
            
            if(count($this->cola)>0)
            {
                $this->search_xml_pdf_directory();
            }
            
            if(count($this->stack_xml_pdf)>0)
            {
                foreach ($this->stack_xml_pdf as $array)
                {
                    print ("\n\n Enviando a Carga = $array");
                }  
                $pila=new Pila_factura_cliente();
                $pila->enviar_pila($this->stack_xml_pdf);
                while(count($this->stack_xml_pdf )) array_pop($this->stack_xml_pdf );                
            }
                                              
            
            $this->giro++;                                                                                                  
            if(count($this->cola)==0)/* Si array cola quedo vacio con la comprobacion de pares se empieza                                    * nuevamente la espera de nuevos archivos */
            {
                $this->giro=0;
            }
            

       }
       else
       {
           if($this->giro<3 and count($this->stack_xml_pdf)==0 or count($this->cola)>0)/* Cuando se no se encuentran archivos y 
                                                                *  se esta en inactividad, estos se envian si es que existen */
           {
               if(count($this->cola)>0)
               {
                   for ($cont=0;$cont<count($this->cola);$cont++)
                    {
//                        printf("\n pasando archivos de cola hacia stack_xml_pdf por inactividad =".$this->cola[$cont]);
                        array_push($this->stack_xml_pdf, $this->cola[$cont]);                    
                    }
                   foreach ($this->stack_xml_pdf as $array)
                    {
                        print ("\n Enviando a Carga = $array");
                    }                  
                    $pila=new Pila_factura_cliente();
                    $pila->enviar_pila($this->stack_xml_pdf);    
                    while(count($this->cola )) array_pop($this->cola );
                    while(count($this->stack_xml_pdf )) array_pop($this->stack_xml_pdf );
               }
                         
           }
       }
       
        if($this->giro==5) /* Se envia el array cola a carga de archivos */
           {
//                 printf("\n\n Iniciando.... pasando archivos de cola hacia stack_xml_pdf");
                for ($cont=0;$cont<count($this->cola);$cont++)
                {
//                    printf("\n pasando archivos de cola hacia stack_xml_pdf =".$this->cola[$cont]);
                    array_push($this->stack_xml_pdf, $this->cola[$cont]);                    
                }
                
                foreach ($this->stack_xml_pdf as $array)
                {
                    print ("\n Enviando a Carga = $array");
                }  
                
                $pila=new Pila_factura_cliente();
                $pila->enviar_pila($this->stack_xml_pdf);
                
                while(count($this->cola )) array_pop($this->cola );
                while(count($this->stack_xml_pdf )) array_pop($this->stack_xml_pdf );
                $this->giro=0;
                      
           }
           
//       printf("\n giro=".$this->giro);
       return $estado;
            
    }
    //Función que extrae el estado del archivo estado
    function Status()
    {            
        $estado=0;
        $leer=$this->archivo_estado;
        if(fopen($this->archivo_estado, "r+"))
        {
            $archivo_estado=fopen($this->archivo_estado, "r+");    
            $estado = fread($archivo_estado, filesize($leer));
            fclose($archivo_estado);

            if($estado==1)
            {
                $this->status=TRUE;            
            }
            else
            {
                $this->status=FALSE;
            }
        }
        else
        {
            $estado=2;
        }
        return $estado;
    }
    function Marca_Conteo($archivolog,$contador)
    {
//              Se pone marca de conteo
                $archivo_log=fopen($archivolog, "w+");
                fwrite($archivo_log, $contador);
                fclose($archivo_log);        
//              fin de marca de Conteo        
    }  
    
    function getDeleteFiles($viejos,$actual)
    {
        //Se vacia el arreglo de initial files para que obtenga los datos de carga nueva 
        $delete="";
        $getDeleteFiles=array_diff($viejos,$actual);
        foreach ($getDeleteFiles as $valor)
        {
//            printf("\n Eliminado = $valor");
            $delete=$delete.$valor;
            
            $clave_busqueda=  array_search($valor, $this->stack_xml_pdf);            
             
            //Si se encuentra el par se encia a stack_xml_pdf
            if($clave_busqueda!=FALSE)
            {                                                
                unset($this->cola[$clave_busqueda]);                                                
                $this->cola=  array_values($this->cola);
            }
             
             //Si se encuentra el par se encia a stack_xml_pdf
            if($clave_busqueda!=FALSE)
            {                                                
                unset($this->stack_xml_pdf[$clave_busqueda]);                                                
                $this->stack_xml_pdf=  array_values($this->stack_xml_pdf);
            }
             
        }
        $archivo_estado=fopen("/usr/CFDI/Factura_Cliente/eliminados.txt", "r+");    
        fwrite($archivo_estado, $delete);
        fclose($archivo_estado);     
        
        if(count($getDeleteFiles>0))
        {
            while(count($this->initial_files)) array_pop($this->initial_files);
            $this->initial_files=  $this->carga_nueva;        
        }
        
//        printf("\n \n");
        /* Si se eliminan archivos estos se quitan tambien de pila xml_pdf */
        
        
    }
    
    private function search_pdf_in_stack()
    {       
        $stop=0;  /* TRUE=se encontro el par XML/PDF para quitarlos de la pila Cola */
        $contador=0;
           
        $array_cola=$this->cola;
        
        
        while($stop<  count($array_cola))
        {
            $array_cola=$this->cola; /* Array con los xml y pdf encontrados */
//            printf("\n Stop=$stop");
            for ($cont=0;$cont<count($array_cola);$cont++)
            {
                if(array_key_exists($cont, $array_cola))
                {
                    $archivo_base=$array_cola[$cont];   /* Archivo contra el cuál se harán las comparaciones puede ser PDF o XML */
                    $archivo=$archivo_base;
                    $extension = pathinfo($archivo_base, PATHINFO_EXTENSION);
                    $nombre_base = basename($archivo, '.'.$extension); 

//                    printf("\n nombre base = $archivo_base con extension $extension  ");
                    
                    /* Si el archivo base es XML el dinamico debe ser PDF y vicerversa */
                    $extension_archivo_dinamico='';
                    $extension_archivo_dinamico2='';
                    /* El formato ya sea xml y pdf puede variar entre minisculas y mayusculas */
                    if(strcasecmp($extension,'xml')==0) { $extension_archivo_dinamico='.PDF'; $extension_archivo_dinamico2='.pdf';   }
                    if(strcasecmp($extension,'pdf')==0) {  $extension_archivo_dinamico='.xml'; $extension_archivo_dinamico2='.XML';}
                    
                    $nombre_base_dinamico=$nombre_base.$extension_archivo_dinamico;
                    $nombre_base_dinamico2=$nombre_base.$extension_archivo_dinamico2;
                    
//                    printf("\n Buscando $nombre_base_dinamico y $nombre_base_dinamico2");

                    $clave_busqueda=  array_search($nombre_base_dinamico, $array_cola);
                    if($clave_busqueda==FALSE)/* Sino se encuentra el archivo con formato en minusculas pe. .pdf se intenta buscar con un formato en mayusculas p.e. .PDF */
                    {
                        $clave_busqueda=  array_search($nombre_base_dinamico2, $array_cola);
                    }
                    //Si se encuentra el par se encia a stack_xml_pdf
                    if($clave_busqueda!=FALSE)
                    {                                                
                        array_push($this->stack_xml_pdf,  $this->cola[$cont]);
                        array_push($this->stack_xml_pdf,  $this->cola[$clave_busqueda]);
                        
//                        printf("\n traspasando a pila xml_pdf ".$this->cola[$cont]."   ".$this->cola[$clave_busqueda]);
                        
                        unset($this->cola[$cont]);
                        unset($this->cola[$clave_busqueda]);                                                
                                                
                        $this->cola=  array_values($this->cola);
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
//                printf("\n \n");
            }     /* fin for */

        }
                      
        
    }
    
    
    private function search_xml_pdf_directory()
    {
        $stop=0;  /* TRUE=se encontro el par XML/PDF para quitarlos de la pila Cola */
        $contador=0;
           
        /* Se hace una diferencia entre archivos olvidados en el directorio y los archivos en cola*/
        
        $array_diferencia=  array_diff($this->carga_nueva,$this->cola, $this->stack_xml_pdf);
        $pila_busqueda=array();
        foreach ($this->cola as $valor)
        {
//            printf("\n ingresando a pila_busqueda desde cola $valor");
            array_push($pila_busqueda, $valor);
        }
        
        foreach ($array_diferencia as $valor)
        {
//            printf("\n ingresando aarchivo olvidado $valor");
            array_push($pila_busqueda, $valor);
        }
        
        if(count($array_diferencia)==0)/* Sino existen archivos olvidados no se realiza la búsqueda */
        {
            $pila_busqueda=NULL;
        }
                        
        
        $array_cola=$pila_busqueda;
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
                        if($clave_busqueda==FALSE)/* Sino se encuentra el archivo con formato en minusculas pe. .pdf se intenta buscar con un formato en mayusculas p.e. .PDF */
                        {
                            $clave_busqueda=  array_search($nombre_base_dinamico2, $pila_busqueda);
                        }
                        //Si se encuentra el par se encia a stack_xml_pdf
                        if($clave_busqueda!=FALSE)
                        {                                 
                            array_push($this->stack_xml_pdf,  $pila_busqueda[$cont]);
                            array_push($this->stack_xml_pdf,  $pila_busqueda[$clave_busqueda]);

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
        }                
    }    
}
$monitor_nomina_xml=new Monitor_factura_cliente("/usr/CFDI/Nomina_XML/contador.txt", "/usr/CFDI/Factura_Cliente/estado.txt", "/volume1/Inbox_Factura_Cliente_XML");

?>
