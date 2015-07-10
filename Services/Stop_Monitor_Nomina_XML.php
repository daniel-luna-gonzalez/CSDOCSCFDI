<?php

$estado=TRUE;
while($estado)
{
    // Se intenta abrir el archivo que contiene el estado del monitor
    if(fopen("/usr/CFDI/Nomina_XML/estado_nominaxml.txt", "w"))
    {
        //si es posible se se limpia el archivo y se introduce un 0 para deter el monitor
        $archivo_estado=  fopen("/usr/CFDI/Nomina_XML/estado_nominaxml.txt", "w");
        fwrite($archivo_estado, "0");
        fclose($archivo_estado);
        $estado=FALSE;
    }    
    else
    {
        sleep(1);
    }
}   
    


?>
