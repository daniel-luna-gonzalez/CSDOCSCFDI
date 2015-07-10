<?php 

class Security_Inserts {   
    private $pila=array();
    private $emisor=array();
    private $receptor=array();
    private $detalle=array();
    
    public function __construct() {
        
    }
    public function Cachar_Datos($pila)
    {
        $this->pila=$pila;   
        //Se hace copia de seguridad de los nombre de los archivos a procesar
        $this->write_security_log($pila);
        //Se manda a procesamiento la pila de archivos
        $retorno=$this->process_stack();
        //Se elimina el log de seguridad
        $this->delete_security_log();     
        return $retorno;
    }    
    private function process_stack()
    {
        $ruta_xml="/usr/CFDI/Inbox_Nomina_Timbrado/";
        $nombre_xml="";
//      Instancia a la clase que lee los XML
        $read_xml=new Read_XML();     
        $existe=0;  
        //Recorremos la pila recibida
        for($valor=0;$valor<count($this->pila);$valor++)
        {
            echo $existe=0;
            echo "                  ITERACION $valor           ";
            //echo "Tamaño de pila " .count($this->pila);
            //echo "for Carga_xml_nomina";
            //Se obtienen los nombres de los ficheros almacenados en pila
            $nombre_xml=  $this->pila[$valor];           
            $arr_detalle=$read_xml->detalle($ruta_xml, $nombre_xml);
             //echo "TAMAÑO DE ARREGLO XML DEVUELTO ".  count($arr_detalle);
            if(count($arr_detalle)>315)
            {    
                
                //Se reparte la información recibida de la clase Read_XML y se nos devuelve el curp del detalle
                 $curp= $this->part($arr_detalle);

                 //Se comprueha la existencia del emisor
                if($this->exist_emisor($this->emisor[0]))
                {

                    // Se ejecutan las consultas a la BD
                    $this->Insert_emisor($this->emisor);
                }
                else{    

                    $existe++;}

                //se comprueba si existe el receptor
                if($this->exist_receptor($curp))
                {

                    $this->insert_receptor($this->receptor,$curp);
                }         
                else{

                    $existe++;}
                //Se comrpeuba si existe el detalle
                $rfc_emisor=  $this->emisor[0];

                $fecha=  $this->detalle[5];

                if($this->exist_detalle($curp, $fecha,$rfc_emisor))
                {
                    $this->Insert_detalle($this->detalle,$rfc_emisor,$curp);   
                }
                else{

                    $existe++;
                }

                //si existe==3 significa que el archivo es repetido y se manda a renombrar
                if($existe==3)
                {
                    echo 'EXISTE ARCHIVO '.$nombre_xml;
                    $intentos=$this->obtener_intentos($this->id_emisor($rfc_emisor), $nombre_xml);              
                    echo "INTENTOS = $intentos";
                    $this->renombrado_fallido($ruta_xml, $nombre_xml, $intentos);
                }
                else
                {//Si el archivo no se repite se mueve al directorio destino final
                    $this->move_to_nomina_xml($ruta_xml, $nombre_xml);
                }

                }                                                  
                else
                {
                    echo "EL XML $nombre_xml SE PROCESO CON ERROR";
                    //Se reporta el xml que no contiene información

                }                                              
            //Se elimina el nombre del archivo procesado del archivo Log
            $this->delete_first_line();
            //Al terminar de insertar, se vacia el contenido de cada array
            while(count($this->emisor )) array_pop($this->emisor );
            while(count($this->receptor )) array_pop($this->receptor );
            while(count($this->detalle )) array_pop($this->detalle);
        }
        return TRUE;
    }
    
    
    //Este método reparte el arreglo en secciones (Emisor, Receptor, Detalle)
    private function part($array_xml)
    {
//        echo "FUNCION PART PESO ARREGLO =".count($array_xml);
        $arreglo=$array_xml;
        
        $emisor=array();
        $receptor=array();
        $detalle=array();
        $deducciones=array();
        $percepciones=array();
        $incapacidad=array();
        $hrsextra=array();
        
    
        for($valor=0; $valor<count($array_xml); $valor++)
        {
            
            if($valor>=0 and $valor<21)
            {
                array_push($detalle,$array_xml[$valor]);
            }
            if($valor>=21 and $valor<36)
            {
//                echo "valor=".$valor;
                array_push($emisor,$array_xml[$valor]);
            }
            if($valor>=36 and $valor<46)
            {
                array_push($receptor,$array_xml[$valor]);
            }                        
        }
        $curp_detalle=$detalle[2];
  
//        for($valor=0;$valor<count($emisor);$valor++)
//        {
//            echo "    Arreglo[".$valor."]= ".$emisor[$valor];
//        }
        $this->emisor=$emisor;
        $this->receptor=$receptor;
        $this->detalle=$detalle;
       // echo "CURP DETALLE = ".$curp_detalle;
       return $curp_detalle;
    }

    private function Insert_emisor($emisor)
    {      
//        echo "METODO EMISOR";
       
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        
        mysql_select_db('CFDI',  $conexion);

        $query="INSERT INTO emisor_recibo_nomina (rfc,nombre,pais,calle,estado,colonia,
        municipio,noExterior,cp,pais_expedido,calle_expedido,estado_expedido,
        colonia_expedido,noExterior_expedido,cp_expedido) VALUES('".$emisor[0]."','".$emisor[1]."','".$emisor[2]."',
            '".$emisor[3]."','".$emisor[4]."','".$emisor[5]."','".$emisor[6]."',".$emisor[7].",
        '".$emisor[8]."','".$emisor[9]."','".$emisor[10]."','".$emisor[11]."',
            '".$emisor[12]."','".$emisor[13]."',".$emisor[14].");";
                
        $resultado=mysql_query($query,$conexion);
        if(!$resultado)
        {
             echo mysql_error();
        }         
        
        while(count($emisor)) array_pop($emisor);    
        mysql_close($conexion);
         return TRUE;;
    }
    
    private function insert_receptor($receptor,$curp)
    {
//        echo "FUNCION INSERT RECEPTOR";
//        echo "CURP A INSERTAR = ".$curp;
//         for($valor=0;$valor<count($receptor);$valor++)
//        {
//            echo "    ArregloE[".$valor."]= ".$receptor[$valor];
//        }
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);
                
        $query="INSERT INTO receptor_recibo_nomina 
            (curp,rfc,nombre,pais,calle,estado,colonia,municipio,noExterior,noInterior,cp)
        VALUES ('".$curp."' , '".$receptor[0]."','".$receptor[1]."','".$receptor[2]."','".$receptor[3]."','".$receptor[4]."',
        '".$receptor[5]."','".$receptor[6]."',".$receptor[7].",".$receptor[8].",".$receptor[9].");";
         
        $resultado=mysql_query($query,$conexion);
        if(!$resultado)
        {
            echo mysql_error();
        }    
        else
        {
            // Se notifica que existio un Error con ese XML
            echo "INSERTADO";
        }                                    
        while(count($arr_detalle)) array_pop($arr_detalle);  
        
        mysql_close($conexion);
    }
    
                
    private function Insert_detalle($arr_detalle,$rfc_emisor,$curp_receptor)
    {        
        $id_emisor=  $this->id_emisor($rfc_emisor);
        $id_receptor=  $this->id_receptor($curp_receptor);
        //      Se obtiene la conexion para la BD                        
        //Se formatea la fecha
         $var=  $this->detalle[5]; // dato de prueba
        $date=str_replace('/', '-', $var);
        $fecha=date("Y-m-d", strtotime($date) );
        
        
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);
        
        $query="INSERT INTO detalle_recibo_nomina (id_emisor,id_receptor,registro_patronal,NumEmpleado,curp,tipoRegimen,NumSegSocial,FechaPago,
        FechaInicialPago,FechaFinalPago,NumDiasPagados,departamento,clabe,banco,FechaInicioLaboral,antiguedad,puesto,
        TipoContrato,TipoJornada,PeriodicidadPago,SalarioBaseCotApor,RiesgoPuesto,SalarioDiarioIntegrado)
        VALUES (".$id_emisor.",".$id_receptor.",'".$arr_detalle[0]."',".$arr_detalle[1].",'".$arr_detalle[2]."',".$arr_detalle[3]."
            ,'".$arr_detalle[4]."','".$fecha."','".$arr_detalle[6]."','".$arr_detalle[7]."',
        ".$arr_detalle[8].",'".$arr_detalle[9]."','".$arr_detalle[10]."','".$arr_detalle[11].
                "','".$arr_detalle[12]."',".$arr_detalle[13].",'".$arr_detalle[14]."','".$arr_detalle[15].
                "','".$arr_detalle[16]."','".$arr_detalle[17]."',".$arr_detalle[18].",".$arr_detalle[19].
                ",".$arr_detalle[20].");";

        $resultado=mysql_query($query,$conexion);
        if(!$resultado)
        {
            echo mysql_error();
        }    
        else
        {
           echo "Insertado";
        }                                    
        while(count($arr_detalle)) array_pop($arr_detalle);            
        mysql_close($conexion);
        
         $estado=TRUE;

         return $estado;
    }
    private function id_emisor($rfc)
    {
        $id_emisor=0;
//        echo "RFC EMISOR= ".$rfc;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);
        $q="select idemisor from emisor_recibo_nomina where rfc='".$rfc."';";
        $resultado=  mysql_query($q);      

        if(!$resultado)
        {
            echo mysql_error();            
        }
        else 
        {
            $row= mysql_fetch_row($resultado);
            $id_emisor=$row[0];
        
        }
       // echo "ID EMISOR ".$id_emisor;
        
        mysql_close($conexion);
        
        return $id_emisor;
    }
    private function id_receptor($curp_receptor)
    {
        $id_emisor=0;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);        
                
        $q="select id_receptor from receptor_recibo_nomina where curp='".$curp_receptor."';";
        $resultado=  mysql_query($q);      

        if(!$resultado)
        {
            echo mysql_error();
        }
        else
        {
            $row=  mysql_fetch_row($resultado);
            $id_emisor=$row[0];
        }
              //  echo "ID RECEPTOR".$id_emisor;
                
                mysql_close($conexion);
        return $id_emisor;
    }
    private function exist_emisor($rfc)
    {
        $existe=FALSE;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);        
                
        $q="select idemisor from emisor_recibo_nomina where rfc='".$rfc."';";
        $resultado=  mysql_num_rows( mysql_query($q)); 

        if($resultado==0)
        {
           // echo "No existe el emisor";
            $existe=TRUE;           
        }              
        
        mysql_close($conexion);
        return $existe;
    }
    private function exist_receptor($curp)
    {
        $existe=FALSE;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);        
                
        $q="select id_receptor from receptor_recibo_nomina where curp='".$curp."';";
        $resultado=  mysql_num_rows( mysql_query($q)); 

        if($resultado==0)
        {
          //  echo "No existe el receptor";
            $existe=TRUE;           
        }                   
        mysql_close($conexion);
        return $existe;        
    }
    private function exist_detalle($curp,$fecha,$rfc)
    {
        echo "EXIST DETALLE $curp    $fecha     $rfc";
//        Se comprueba el formato de la fecha
        $var=$fecha; // dato de prueba
        $date=str_replace('/', '-', $var);
        $fecha=date("Y-m-d", strtotime($date) );
        
        $existe=FALSE;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);        
                
        $q="select rfc,curp,FechaPago FROM detalle_recibo_nomina inner join emisor_recibo_nomina 
        WHERE id_emisor=idemisor and rfc='$rfc' and curp = '$curp' and FechaPago='$fecha';";
        $resultado=  mysql_num_rows( mysql_query($q)); 

        if($resultado==0)
        {
        //    echo "No existe el receptor";
            $existe=TRUE;           
        }    
        else
        {
            echo "EXISTE DETALLE";
        }
        
        mysql_close($conexion);
        return $existe;        
    } 
    //Método que comprueba el número de veces que a sido enviado el mismo XML
    private function obtener_intentos($id_emisor,$nombre_archivo)
    {
        echo "ID EMISOR METODO OBTENER INTENTOS =".$id_emisor."  ".$nombre_archivo;
        $intentos=0;
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);
        echo "QUERY SELECT :  ";
        $q="select NoIntentos from existe where id_emisor=".$id_emisor." and nombre = '".$nombre_archivo."';";        
        $tamaño=  mysql_num_rows(mysql_query($q));
        echo "TAMAÑO DEVUELTO ROW = $tamaño";
        if($tamaño==0)
        {
            echo "OBTENER INTENTOS QUERY IF ==0  ";
            //Se registra por primera ves en la tabla
            $q="Insert into existe (id_emisor, nombre, NoIntentos) values (".$id_emisor.", '".$nombre_archivo."',1); ";
            $res=  mysql_query($q);
            if(!$res)
            {
                echo mysql_error()." al insertar el archivo $nombre_archivo a la tabla existe";
            }
            
        }
        else
        {
            echo "QUERY UPDATE NOMBRE = $nombre_archivo";
            $resultado=  mysql_query($q); 
            $row=mysql_fetch_row($resultado);
            $intentos=$row[0];
            $intentos++;
            echo "NO INTENTOS ANTES DE UPDATE = $intentos  ";
            $q="UPDATE existe set NoIntentos=$intentos WHERE id_emisor=$id_emisor and nombre = '$nombre_archivo'";
            $update= mysql_query($q);
            if(!$update)
            {
                echo "ERROR UPDATE ID EMISOR = $id_emisor";
                echo mysql_error();
            }else
            {
                echo "UPDATE CON EXITO ID EMISOR = $id_emisor";
            }
        }
        mysql_close($conexion);
        echo "INTENTOS = $intentos";
        return $intentos;
    }
    
    private function renombrado_fallido($ruta,$archivo,$intentos)
    {
        
        rename($ruta.$archivo, "/volume1/Inbox_Recibo_Nomina_XML/"."Existe".$intentos."_".$archivo);
    }
    private function move_to_nomina_xml($ruta,$archivo)
    {
        rename($ruta.$archivo, "/volume1/web/_root/Nomina_xml/".$archivo);
    }
    public function Read_Log_File()
    {
        echo "METODO READ LOG";
        $xml=array();
        if(file_exists("/usr/CFDI/log_inserts.txt"))
        {
            $archivo_log=fopen("/usr/CFDI/log_inserts.txt","r+");
            while ( ($linea = fgets($archivo_log)) !== false) {
                array_push($xml, $linea);

                //Se elimina el array XML
                while(count($xml)) array_pop($xml);
            }
            if(count($xml)>0)
            {
                $this->pila=$xml;
                $this->process_stack();
            }
            echo "TAMAÑO ARRAY LEIDO ".count($xml);
            fclose($archivo_log);
        }
        else
        {
            echo "  NO EXISTE EL ARCHIVO LOG    ";
        }
    }
}
$security=new Security_Inserts();
$security->Read_Log_File();
?>
