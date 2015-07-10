<?php
/**
 * Description of ReadCFDI
 *
 * @author Daniel
 */
$RoutFile = dirname(getcwd());
require_once "$RoutFile/Classification/Proveedor.php";
require_once "$RoutFile/Classification/Nomina.php";

class ReadCFDI {
    /* Validación de estructura del CFDI */
    public function ValidateCfdi($CfdiPath)
    {                                
        $CfdiType = $this->GetCfdiType($CfdiPath);                

        if(strcasecmp($CfdiType, "0")==0)
        {
            echo "\n Xml desconocido";
            return 0;
        }
        
        $SchemaPath = $this->GetSchema($CfdiType);

        /* Validación por esquema */
        $xml = new DOMDocument(); 
        $xml->load($CfdiPath);
        if ($xml->schemaValidate($SchemaPath))
            return 1;
        else
            return 0;
    }
    
    function GetCfdiType($CfdiPath)
    {
        if(!file_exists($CfdiPath))
        {
            echo "\n No existe el documento ".basename($CfdiPath);
            return 0;
        }
        
        if(!($xml = simplexml_load_file($CfdiPath)))
        {
            echo "\n No pudo abrirse el CFDI ".basename($CfdiPath);
            return 0;
        }
        
        /* Se identifica el tipo de comprobante */
        if(isset($xml['tipoDeComprobante']))
            if(strcasecmp ($xml['tipoDeComprobante'], 'Ingreso')==0)
                    return "Factura";
            if(strcasecmp ($xml['tipoDeComprobante'], 'Egreso')==0)
                    return "Nomina";
    }
    
    function GetSchema($CfdiType)
    {
        $RoutFile = dirname(getcwd());
        switch ($CfdiType)
        {
            /* Factura de Proveedor/Cliente */
            case 'Factura':
                return "$RoutFile/Config/Schemas/cfdv32.xsd";
            case 'Nomina':
                return "$RoutFile/Config/Schemas/cfdv32.xsd";
                
            default: return 0;
        }
    }
    /* Lee el XML y devuelve un array asociativo con sus datos del mismo */
    function GetDetail($CfdiPath)
    {
        $CfdiType = $this->GetCfdiType($CfdiPath);
        
        if(strcasecmp($CfdiType, "0")==0)
        {
            echo "\n Xml desconocido ".  basename($CfdiPath);
            return 0;
        }
        
        switch ($CfdiType)
        {
            /* Factura de Proveedor/Cliente */
            case 'Factura':
                return Proveedor::GetDetail($CfdiPath);
            case 'Nomina':
                return Nomina::GetDetail($CfdiPath);
            default : return 0;
        }
    }
}
