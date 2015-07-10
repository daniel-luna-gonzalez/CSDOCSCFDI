<?php
/* Clase llamada desde administracion.js
 * Función system_status()
 * 
 *  */
class system
{
    public function __construct() {
        $this->ajax();
    }
    private function ajax()
    {
        /* Comprueba el estado del sistema */
        if($_POST['system_status']==1)
        {
            $this->return_status();
        }
        if($_POST['restar_system']==1)
        {
            $this->restar_system();
        }
    }
    private function return_status()
    {
        $salida = shell_exec('ps|grep ".php"');
//        echo "<pre>$salida</pre>";
        
        $buscar_monitor_xml   = 'Monitor_Nomina_XML';
        $monitor_xml = strpos($salida, $buscar_monitor_xml);
        
        $buscar_Monitor_factura_cliente='Monitor_factura_cliente';
        $Monitor_factura_cliente=  strpos($salida, $buscar_Monitor_factura_cliente);
        
        $buscar_Monitor_factura_proveedor='Monitor_factura_proveedor';
        $Monitor_factura_proveedor=  strpos($salida, $buscar_Monitor_factura_proveedor);

        /* Si un monitor no se encuentra funcionando se pasa el estado a 0 sino devuelve 1 */

        $estado_recibo_nomina=0;
        $estado_factura_cliente=0;
        $estado_factura_proveedor=0;
        if (!$monitor_xml === false){$estado_recibo_nomina=1;}else{$estado_recibo_nomina=0;}
        if(!$Monitor_factura_cliente===false){$estado_factura_cliente=1;}else{$estado_factura_cliente=0;}
        if(!$Monitor_factura_proveedor===false){$estado_factura_proveedor=1;}else{$estado_factura_proveedor=0;}
            
        $this->xml_status($estado_recibo_nomina,$estado_factura_cliente,$estado_factura_proveedor);                
        
    }
    
    private function xml_status($estado_recibo_nomina,$estado_factura_cliente,$estado_factura_proveedor)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Estado');
        $doc->appendChild($root);       
        $estado_recibo_nomina_=$doc->createElement('estado_recibo_nomina',$estado_recibo_nomina);
        $root->appendChild($estado_recibo_nomina_);
        
        $estado_factura_cliente_=$doc->createElement('estado_factura_cliente',$estado_factura_cliente);
        $root->appendChild($estado_factura_cliente_);
        
        $estado_factura_proveedor_=$doc->createElement('estado_factura_proveedor',$estado_factura_proveedor);
        $root->appendChild($estado_factura_proveedor_);
        
        header ("Content-Type:text/xml");
//        $doc->save('/volume1/public/login.xml');
        echo $doc->saveXML();
    }
    
    /* Reinicia el sistema */
    private function restar_system()
    {
//         exec('sh /usr/syno/etc/rc.d/S99CFDI.sh restart > /dev/null &');
        exec("php /volume1/web/Services/Monitor_factura_proveedor.php > /dev/null &");
    }
}
$system=new system();
//ps -e |grep "proceso a buscar"
?>
