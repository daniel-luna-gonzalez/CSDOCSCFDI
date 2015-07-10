<?php
/*
 * Se utiliza una vista llamada insert_pdf para realizar la comparación entre las tablas registro_pdf y registro_xml
 */

require_once '/volume1/web/DAO/Querys.php';
class Insert_pdf {
    public function __construct() {        
    }
    public function recibir_datos($pila)
    {
        echo "TAMAÑO DE PILA PDFS=".count($pila);
        $this->insert_pdf_registro($pila);           
        $pdfs=  $this->consulta();        
        $this->proceso($pdfs);
        
        $this->size_table_xml();
    }
    private function insert_pdf_registro($pdf)
    {
        
        $Querys= new Querys();
        $conexion=$Querys->Conexion();  
        mysql_select_db('CFDI',  $conexion);
        foreach ($pdf as $valor)
        {
//            echo "insert $valor";
            $q="INSERT INTO registro_pdf (nombre) VALUES ('$valor')";
            $resultado=  mysql_query($q);
            if (!$resultado)
                {
                    $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                    $mensaje .= 'Consulta completa: ' . $q;                                           
                    echo($mensaje);
                }
        }
        
                
        mysql_close($conexion);
        
    }
    //función que procesa la pila que contiene los pdf insertandolos donde corresponden
    private function proceso($pdfs)
    {                
        
        foreach ($pdfs as $valor)
        {
//            echo "PROCE:". $valor['nombre'];
            if(file_exists('/volume1/Inbox_Recibo_Nomina_XML/'.$valor['nombre']))
            {
                $ruta= $this->move_pdf("/volume1/Inbox_Recibo_Nomina_XML/",$valor['nombre']);
                $this->procesar_resultado($valor['id_detalle'], $ruta);
            }
            
        }
    }
    
    private function consulta()
    {
        $pdfs=array();
        $clase_query=new Querys();
        $conexion=$clase_query->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $consulta="select *from insert_pdf";
        $resultado=  mysql_query($consulta);
        if (!$resultado)
                {
                    $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                    $mensaje .= 'Consulta completa: ' . $q;                                           
                    echo($mensaje);
                }
        while ($fila = mysql_fetch_assoc($resultado))
            {
                $pdfs[]=$fila;
            }
            mysql_close($conexion);
            return $pdfs;
    }
    private function procesar_resultado($id_detalle,$nombre_pdf)
    {
        $clase_query=new Querys();
        $conexion=$clase_query->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $consulta="UPDATE detalle_recibo_nomina SET pdf_ruta='$nombre_pdf' WHERE id_detalle_recibo_nomina=$id_detalle";
        $resultado=  mysql_query($consulta);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;                                           
                echo($mensaje);
            }
            mysql_close($conexion);
    }
    private function size_table_xml()
    {
        $size=0;
        $clase_query=new Querys();
        $conexion=$clase_query->Conexion();
        $BD="CFDI";
        mysql_select_db($BD,$conexion);
        $consulta="SELECT COUNT(*) FROM registro_xml";
    
        $resultado=  mysql_query($consulta);
        if (!$resultado)
            {
                $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                $mensaje .= 'Consulta completa: ' . $q;                                           
                echo($mensaje);
            }
            while($row = mysql_fetch_row($resultado)) 
            {
                $size = trim($row[0]);               
            }
            if($size>=70)
            {
                $consulta="truncate registro_xml";
                $resultado=  mysql_query($consulta);
                if (!$resultado)
                    {
                        $mensaje  = 'Consulta no válida: ' . mysql_error() . "\n";
                        $mensaje .= 'Consulta completa: ' . $q;                                           
                        echo($mensaje);
                    }
            }
            mysql_close($conexion);             
    }
    
     private function move_pdf($ruta_original,$pdf)
    {           
        $año=substr($pdf, 0,4);
        $curp=  substr($pdf, 8,-4);
        $ruta_destino="/volume1/web/_root/Nomina_xml/$año/";
//        echo "  RUTA DESTINO = $ruta_destino  ";
        $busqueda=  scandir($ruta_destino);
        foreach ($busqueda as $valor)
        {
//            echo "  ITERACION FOREACH CARPETA = $valor  CURPPDF= $curp";
            if($valor==$curp)
            {
//                echo "  RUTA DE PDF LOCALIZADA  ";
                rename($ruta_original.$pdf, $ruta_destino.$curp."/".$pdf);
            }
        }
        $estructura=$ruta_destino.$curp."/".$pdf;
                return $estructura;
      }
}
?>
