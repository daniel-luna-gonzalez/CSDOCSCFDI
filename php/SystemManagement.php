<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of SystemManagement
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once "XML.php";
class SystemManagement {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'GetVolumesDetail': $this->GetVolumesDetail(); break;
            case 'GetVolumes': $this->GetVolumes(); break;
        }
    }
    
    /*--------------------------------------------------------------------------
     * El comando df -m devuelve el detalle de memoria de cada uno de los discos
     * instalados en el sistema, en el siguiente orden (por disco):
     *  
     *      FileSystem, 1M-blocks, Used, Available, Use%, Mounted on
     * 
     * 
     *    
     * ------------------------------------------------------------------------*/
    
    private function GetVolumesDetail()
    {
        $this->RegisterVolumes();
        
        $DB = new DataBase();
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");        
        $GetVolumes = "SELECT *FROM Volumes";
        $ResultGetVolumes = $DB->ConsultaSelect($EnterpriseAlias, $GetVolumes);
        if($ResultGetVolumes['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al obtener el listado de volúmenes</p><br>Detalles:<br><br>$ResultGetVolumes");
            return 0;
        }
        
        $Volumes = $ResultGetVolumes['ArrayDatos'];
        
        /* Se calcula el número de empresas por volúmen */
        
        for($cont = 0; $cont < count($Volumes); $cont++)
        {
            $IdVolume = $Volumes[$cont]['IdVolume'];
            $GetTotalEnterprises = "SELECT Alias FROM Enterprises WHERE IdVolume = $IdVolume";
            $ResGetTotal = $DB->ConsultaSelect($EnterpriseAlias, $GetTotalEnterprises);
            if($ResGetTotal['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al calcular el total del empresas en el volumen ".$Volumes[$cont]['VolumeName']."</p><br>Detalles:<br><br>".$ResGetTotal['Estado']);
                return 0;
            }
            $TotalEnterprises = count($ResGetTotal['ArrayDatos']);
            $Volumes[$cont]['TotalEnterprises'] = $TotalEnterprises;
            $Volumes[$cont]['Enterprises'] = $ResGetTotal['ArrayDatos'];
        }      
        
        /*  Devolución de repuesta en XML */
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Volumes");
        $doc->appendChild($root);         
        for($cont = 0; $cont < count($Volumes); $cont++)
        {
            $Volume = $doc->createElement("Volume");
            $IdVolumeXml = $doc->createElement("IdVolume", $Volumes[$cont]['IdVolume']);
            $Volume->appendChild($IdVolumeXml);
            $VolumeNameXml = $doc->createElement("VolumeName", $Volumes[$cont]['VolumeName']);
            $Volume->appendChild($VolumeNameXml);
            $UsedXml = $doc->createElement("Used", $Volumes[$cont]['Used']);
            $Volume->appendChild($UsedXml);
            $AvailableXml = $doc->createElement("Available", $Volumes[$cont]['Available']);
            $Volume->appendChild($AvailableXml);
            $TotalMemoryXml = $doc->createElement("TotalMemory", $Volumes[$cont]['TotalMemory']);
            $Volume->appendChild($TotalMemoryXml);
            $TotalEnterprisesXml = $doc->createElement("TotalEnterprises", $Volumes[$cont]['TotalEnterprises']);
            $Volume->appendChild($TotalEnterprisesXml);
            $Enterprises = $doc->createElement("Enterprises");
            for($aux = 0; $aux < count($Volumes[$cont]['Enterprises']); $aux++)
            {
                $Enterprise = $doc->createElement("Enterprise");
                $Alias = $doc->createElement("Alias", $Volumes[$cont]['Enterprises'][$aux]['Alias']);                                
                $Enterprise->appendChild($Alias);
                $Enterprises->appendChild($Enterprise);
            }
            $Volume->appendChild($Enterprises);
            $root->appendChild($Volume);
        }                        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();

//        XML::XmlArrayResponse("VolumesDetail", "Volume", $Volumes);
    }    
    
    private function RegisterVolumes()
    {
        $DB = new DataBase();
        
        $RefularExpression = "/volume_.*/"; /* Ayuda a identificar un volumen (Inicio de línea de salida) */
        $DiskDetail = shell_exec("df -m | grep volume");
        $MemoryArray = preg_split('/\s+/', trim($DiskDetail));
        $Volumes = array();        
                
        for($cont = 0; $cont < count($MemoryArray); $cont++)
        {            
            $Volume = preg_match($RefularExpression, $MemoryArray[$cont]);
            if($Volume)
                $Volumes[]=array("FileSystem"=>$MemoryArray[$cont],"Blocks"=>$MemoryArray[$cont+1], "Used"=>$MemoryArray[$cont+2], "Available"=>$MemoryArray[$cont+3], "Use"=>$MemoryArray[$cont+4], "Mounted"=>$MemoryArray[$cont+5]);
        }
        
        /* Una vez obtenidos los volúmenes se registran en la BD */
        for($cont = 0; $cont<count($Volumes); $cont++)
        {
            $VolumeName = $Volumes[$cont]['Mounted'];
//            $FileSystem = $Volumes[$cont]['FileSystem'];
//            $Blocks = $Volumes[$cont]['Blocks'];
            $Used = $Volumes[$cont]['Used'];
            $Available = $Volumes[$cont]['Available'];
            $Total = (int)$Used + (int)$Available;
                        
            $CheckIfExistVolume = "SELECT *FROM Volumes WHERE VolumeName COLLATE utf8_bin = '$VolumeName'";
            $ResultCheck = $DB->ConsultaSelect("Manager", $CheckIfExistVolume);
            if($ResultCheck['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al relizar registro de volúmenes</p><br>Detalles:<br><br>".$ResultCheck['Estado']);
                return 0;
            }
            
            if(count($ResultCheck['ArrayDatos'])>0)
                continue;
            
            /* Registro del volúmen */
            
            $InsertVolume = "INSERT INTO Volumes (VolumeName, Used, Available, TotalMemory) VALUES ('$VolumeName', $Used, $Available, $Total)";
            if(($ResultInsert = $DB->ConsultaQuery("Manager", $InsertVolume))!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar el volumen <b>$VolumeName</b></p><br>Detalles:<br><br>$ResultInsert");
                return 0;
            }
        }
        
    }
    
    private function GetVolumes()
    {
        $output = shell_exec("ls -l / | grep volume");
        $RefularExpression = "/vol.*/";
        $volumes = array();
        preg_match($RefularExpression, $output, $volumes);
                       
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Volumes");
        $doc->appendChild($root);              
        for($cont = 0; $cont < count($volumes); $cont++)
        {
            $Volume = $doc->createElement("Volume", $volumes[$cont]);
            $root->appendChild($Volume);
        }
        if(count($volumes)==0)
        {
            $Volume = $doc->createElement("Volume", 0);
            $root->appendChild($Volume);
        }
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
    
}

$SystemManagement = new SystemManagement();