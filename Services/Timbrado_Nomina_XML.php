<?php
include '/volume1/web/Services/Pila_Nomina_Timbrado.php';

class Timbrado_Nomina_XML {
    private $initial_files=array();
    private $carga_nueva=array();
    private $cola=array(); 
    private $status=TRUE,$archivo_estado;
    public function __construct($archivo_log,$archivo_estado,$directory_monitor)
    {
        
        $this->archivo_estado=$archivo_estado;
        $this->Status();        
        $this->Update($directory_monitor);
        $this->Monitorear($archivo_log,$directory_monitor);  
       
    }
    function Monitorear($archivolog,$directory_monitor)
    {          
//        $contador=0;
        //Inicio de Bucle de Comprobación
        while($this->status==TRUE)
        {
            if($this->Status()==1)
            {
                sleep(4);
//    *******  Se realiza un comparativo entre arrays para observar cambios **********
               
//              Se llena el segundo array
                $this->Repeat_Update($directory_monitor); 
                
//              Se compara el arreglo inicial con el final 
                $estado=$this->getNewFiles( $this->carga_nueva,$this->initial_files);
                echo $estado;
                if($estado)
                {  
                    //Se actualiza el estado actual de los elementos del directorio                    
                    $this->Update($directory_monitor);
                }
                
                //Se compra si el arreglo nuevo es menor al actual
                //si se cumple significa que se borraron archivos del directorio
                
               if(count($this->carga_nueva)<  count($this->initial_files))
               {
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
            
//            $archivo_estado=fopen("/usr/CFDI/datos.txt", "w+");    
//            fwrite($archivo_estado, $resultado);
//            fclose($archivo_estado);    
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
    function getNewFiles($nuevo, $actual)
    {
        $estado=FALSE;
         $resultado="";
         
         while(count($this->cola )) array_pop($this->cola );
         
        //devuelve un array con las diferencias entre el array inicial y el actualizado
       $getNewFiles= array_diff($nuevo, $actual);
       
       //Se introducen los nuevos valores en formación
       foreach ($getNewFiles as $valor)
       {
           array_push($this->cola, $valor); 
       }
       foreach ($this->cola as $valor)
        {
            $resultado=$resultado.$valor;
        }
       
        $archivo_estado=fopen("/usr/CFDI/datos.txt", "r+");    
        fwrite($archivo_estado, $resultado);
        fclose($archivo_estado);                                         

       // Si se detectaron archivos nuevos se devuelve TRUE
       if(count($getNewFiles)>0)
       {
           $pila=new Pila_Nomina_Timbrado();
            $pila->enviar_pila($this->cola);
            unset($pila);
            while(count($this->cola )) array_pop($this->cola );
           $estado=TRUE;
       }
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
                $archivo_log=fopen($archivolog, "r+");
                fwrite($archivo_log, $contador);
                fclose($archivo_log);        
//              fin de marca de Conteo        
    }  
    
    function getDeleteFiles($nuevo,$actual)
    {
        //Se vacia el arreglo de initial files para que obtenga los datos de carga nueva 
        $delete="";
        $getDeleteFiles=array_diff($nuevo, $actual);
        foreach ($getDeleteFiles as $valor)
        {
            $delete=$delete.$valor;
        }
//        $archivo_estado=fopen("/usr/CFDI/datos_n.txt", "r+");    
//        fwrite($archivo_estado, $delete);
//        fclose($archivo_estado);     
        
        if(count($getDeleteFiles>0))
        {
            while(count($this->initial_files)) array_pop($this->initial_files);
            $this->initial_files=  $this->carga_nueva;
        
        }
        
    }
}

$timbrado=new Timbrado_Nomina_XML("/usr/CFDI/LOGcsvtxt.txt","/usr/CFDI/estado_timbrado.txt","/usr/CFDI/Inbox_Nomina_Timbrado");


?>
