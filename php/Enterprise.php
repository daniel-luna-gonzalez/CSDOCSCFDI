<?php
/**
 * Description of Enterprise
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

require_once 'XML.php';
require_once 'DataBase.php';
require_once 'Version.php';

class Enterprise {
    public function __construct() {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'GetListEnterprisesXml': $this->GetListEnterprisesXml();  break; 
            case 'GetSystemEnterprises': $this->GetSystemEnterprises(); break;
            case 'NewEnterpriseSystem': $this->NewEnterpriseSystem(); break;
            case 'ModifyEnterprise': $this->ModifyEnterprise(); break;
            case 'DeleteEnterprise': $this->DeleteEnterprise(); break;
        }    
    }
    
    private function DeleteEnterprise()
    {        
        $DB = new DataBase();
        
        $IdEnterprise = filter_input(INPUT_POST, "IdEnterprise");
        $DeleteEnterpriseName = filter_input(INPUT_POST, "DeleteEnterpriseName");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $AvailableMemory = filter_input(INPUT_POST, "AvailableMemory");
        $UsedMemory = filter_input(INPUT_POST, "UsedMemory");
        $TotalMemory = filter_input(INPUT_POST, "TotalMemory");
        $IdVolume = filter_input(INPUT_POST, "IdVolume");
        
        $UpdateVolumes = "UPDATE Volumes SET Used = (Used - $TotalMemory), Available = (Available + $TotalMemory) WHERE IdVolume = $IdVolume";
        if(($ResultUpdate = $DB->ConsultaQuery($EnterpriseAlias, $UpdateVolumes))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar la memoria</p><br>Detalles:<br><br>$ResultUpdate");
            return 0;
        }        
        
        $DeleteDataBase = "DELETE FROM Enterprises WHERE IdEnterprise = $IdEnterprise";
        
        if(($ResDelete = $DB->ConsultaQuery($EnterpriseAlias, $DeleteDataBase))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al eliminar del registro a '$DeleteEnterpriseName'</p><br>Detalles:<br><br>$ResDelete");
            return ;
        }
        
        $DB->DeleteDataBase($DeleteEnterpriseName);
        
        XML::XmlResponse("DeleteEnterprise", 1, "Empresa '$DeleteEnterpriseName' eliminada con éxito");
    }
    
    private function NewEnterpriseSystem()
    {                
        $DB = new DataBase();
        
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $ManagerEnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $EnterpriseAlias = filter_input(INPUT_POST, "NewEnterpriseAlias");
        $EnterpriseName = filter_input(INPUT_POST, "NewNameEnterprise");
        $EnterpriseRFC = filter_input(INPUT_POST, "NewRfcEnterprise");
        $EnterprisePassword = filter_input(INPUT_POST, "NewPasswordEnterprise");
        $IdVolume = filter_input(INPUT_POST, "IdVolume");
        $AssignedMemory = filter_input(INPUT_POST, "AssignedMemory");
        $Volume = filter_input(INPUT_POST, "Volume");
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */                
        
        $CheckVersion = Version::CheckVersion(); 
        if($CheckVersion==0)
            return 0;     
        
        
        $QueryDuplicated = "SELECT *FROM Enterprises WHERE Alias COLLATE utf8_bin = '$EnterpriseAlias'";
        $ResultDuplicated = $DB->ConsultaSelect($ManagerEnterpriseAlias, $QueryDuplicated);        
        
        if($ResultDuplicated['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar la no existencia de la nueva empresa</p><br>Detalles:<br><br>".$ResultDuplicated['Estado']);
            return 0;
        }        
        
        if(count($ResultDuplicated['ArrayDatos'])>0)
        {
            XML::XmlResponse("DuplicatedEnterprise", 0,"El alias de la empresa ya existe");
            return 0;
        }                       
        
        if(!($ResultCopy = copy("$RoutFile/index.html", "$RoutFile/$EnterpriseAlias.html")))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al generar el documento html de la nueva empresa</p>");
            return 0;
        }

        if(($CreateEnterprise = $DB->CreateEnterpriseInstance($EnterpriseAlias)!=1))
        {
            $DB->DeleteDataBase($EnterpriseAlias);
            return 0;        
        }
        
        $Now = date("Y-m-d H:i:s");

        $QInsertEnterprise = "INSERT INTO Enterprises (Alias, EnterpriseName, RFC, Password, DischargeDate , IdVolume, AvailableMemory, TotalMemory) VALUES "
                . "('$EnterpriseAlias', '$EnterpriseName', '$EnterpriseRFC', '$EnterprisePassword', '$Now',  '$IdVolume', $AssignedMemory ,$AssignedMemory)";
        
        $IdEnterprise = $DB->ConsultaInsertReturnId('Manager', $QInsertEnterprise);
        if(!($IdEnterprise>0))
        {
            $DB->DeleteDataBase($EnterpriseAlias);
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar la nueva empresa</p><br>Detalles:<br><br>$IdEnterprise");
            return 0;
        }
                
        $UpdateMemory = "UPDATE Volumes SET Used = Used + $AssignedMemory, Available = Available - $AssignedMemory WHERE IdVolume = $IdVolume";
        if(($ResultUpdate = $DB->ConsultaQuery('Manager', $UpdateMemory))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar el espacio disponible en el volúmen $Volume</p><br>Detalles:<br><br>$ResultUpdate");
            return 0;
        }
                        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("NewEnterprise");
        $doc->appendChild($root);       
        $mensaje_=$doc->createElement('Mensaje',"Empresa $EnterpriseName dada de alta con éxito");
        $root->appendChild($mensaje_);
        
        $IdEnterpriseXml = $doc->createElement("IdEnterprise", $IdEnterprise);
        $root->appendChild($IdEnterpriseXml);
        $EnterpriseAliasXml = $doc->createElement("EnterpriseAlias", $EnterpriseAlias);
        $root->appendChild($EnterpriseAliasXml);
        $EnterpriseNameXml = $doc->createElement("EnterpriseName", $EnterpriseName);
        $root->appendChild($EnterpriseNameXml);
        $RFCXml = $doc->createElement("RFC", $EnterpriseRFC);
        $root->appendChild($RFCXml);
        $DischargeDateXml = $doc->createElement("DischargeDate", $Now);
        $root->appendChild($DischargeDateXml);
        $TotalMemory = $doc->createElement("TotalMemory", $AssignedMemory);
        $root->appendChild($TotalMemory);
        $VolumeXml = $doc->createElement("Volume", $Volume);
        $root->appendChild($VolumeXml);
        $OccupiedMemory = $doc->createElement("OccupiedMemory", 0);
        $root->appendChild($OccupiedMemory);
        $FreeMemory = $doc->createElement("FreeMemory", $AssignedMemory);
        $root->appendChild($FreeMemory);                
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
    
    private function GetSystemEnterprises()
    {
        $DB = new DataBase();
        
        $IdEnterprise = filter_input(INPUT_POST, "IdEnterprise");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        
        if($IdEnterprise>0)
            $Condition = " WHERE en.IdEnterprise = $IdEnterprise ";
        
        $QueryEnterprises = "SELECT en.IdEnterprise, en.EnterpriseName, en.Alias, en.RFC, en.DischargeDate, en.UsedMemory, en.AvailableMemory, en.TotalMemory, vol.IdVolume, vol.VolumeName FROM Enterprises en LEFT JOIN Volumes vol ON en.IdVolume = vol.IdVolume $Condition";
        $ResultQuery = $DB->ConsultaSelect($EnterpriseAlias, $QueryEnterprises);
        
        if($ResultQuery['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al obtener el listado de empresas</p><br>Detalles:<br><br>".$ResultQuery['Estado']);
            return 0;
        }
        
        XML::XmlArrayResponse("Enterprises", "Enterprise", $ResultQuery['ArrayDatos']);
       
    }
    
    private function GetListEnterprisesXml()
    {
        $DB = new DataBase();
        $content = filter_input(INPUT_POST, "content");
        
        $QuerySelect = '';
        if(strcasecmp($content, "provider")==0)
            $QuerySelect = "SELECT *FROM emisor_factura_proveedor";
        if(strcasecmp($content, "client")==0)
            $QuerySelect = "SELECT *FROM emisor_factura_cliente";
        if(strcasecmp($content, "payroll")==0)
            $QuerySelect = "SELECT *FROM emisor_recibo_nomina";
            
        
        $Result = $DB->ConsultaSelect("CFDI", $QuerySelect);
        if($Result['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al obtener el listado de empresas</p><br>Detalles:<br><br>".$Result['Estado']);
            return 0;
        }

        $Enterprises = $Result['ArrayDatos'];
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Enterprises');
        
        for($cont=0; $cont < count($Enterprises); $cont++)
        {            
            $Enterprise = $doc->createElement("Enterprise");
            $IdEnterprise = $doc->createElement("IdEnterprise", $Enterprises[$cont]["idemisor"]);
            $Enterprise->appendChild($IdEnterprise);
            $EnterpriseName = $doc->createElement("Name", $Enterprises[$cont]['nombre']);
            $Enterprise->appendChild($EnterpriseName);
            $EnterpriseRFC = $doc->createElement("RFC", $Enterprises[$cont]['rfc']);
            $Enterprise->appendChild($EnterpriseRFC);  
            $root->appendChild($Enterprise);
        }
        $doc->appendChild($root);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function ModifyEnterprise()
    {
        $DB = new DataBase();
        
        $EntepriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdEnterprise = filter_input(INPUT_POST, "IdEnterprise");
        
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $AvailableMemory = filter_input(INPUT_POST, "AvailableMemory");
        $NewTotalMemory = filter_input(INPUT_POST, "NewTotalMemory");
        $UsedMemory = filter_input(INPUT_POST, "UsedMemory");
        $EnterpriseName = filter_input(INPUT_POST, "NewNameEnterprise");
        $RFC = filter_input(INPUT_POST, "NewRfcEnterprise");
        $AddNewMemory = filter_input(INPUT_POST, "AddMemory");
        
        $UpdateEnterprise = "UPDATE Enterprises SET EnterpriseName = '$EnterpriseName', RFC = '$RFC', AvailableMemory = (AvailableMemory + $AddNewMemory), TotalMemory = (TotalMemory + $AddNewMemory) WHERE IdEnterprise = $IdEnterprise";
        if(($ResultUpdate = $DB->ConsultaQuery($EntepriseAlias, $UpdateEnterprise))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar la información de la empresa</p><br>Detalles:<br><br>$ResultUpdate");
            return 0;
        }        
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("ModifyEnterprise");
        $doc->appendChild($root);       
        $mensaje_=$doc->createElement('Mensaje',"Empresa $EnterpriseName dada de alta con éxito");
        $root->appendChild($mensaje_);
        
        $IdEnterpriseXml = $doc->createElement("IdEnterprise", $IdEnterprise);
        $root->appendChild($IdEnterpriseXml);
        $EnterpriseNameXml = $doc->createElement("EnterpriseName", $EnterpriseName);
        $root->appendChild($EnterpriseNameXml);
        $RFCXml = $doc->createElement("RFC", $RFC);
        $root->appendChild($RFCXml);
        $TotalMemory = $doc->createElement("NewTotalMemory", $NewTotalMemory);
        $root->appendChild($TotalMemory);
        $OccupiedMemory = $doc->createElement("UsedMemory", $UsedMemory);
        $root->appendChild($OccupiedMemory);
        $AvailableMemoryXml = $doc->createElement("AvailableMemory", $AvailableMemory);
        $root->appendChild($AvailableMemoryXml);                
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    /* Devuelve el path de la empresa donde se contienen todos sus documentos */
    
    public static function GetEnterprisePath($EnterpriseAlias)
    {
        $DB = new DataBase();
        
        $Query = "SELECT ent.IdVolume, vol.VolumeName FROM Enterprises ent INNER JOIN Volumes vol ON "
                . "ent.IdVolume = vol.IdVolume WHERE ent.Alias COLLATE utf8_bin = '$EnterpriseAlias'";
        
        $Result = $DB->ConsultaSelect("CSDOCS_CFDI", $Query, 1);
        if($Result['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b< al consultar el Path del Volúmen</p><br>Detalles:<br><br>".$Result['Estado']);
            return 0;
        }
        
        $Path = $Result['ArrayDatos'][0]['VolumeName'];
        
        if(!file_exists($Path))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> el path de la empresa con Alias <b>$EnterpriseAlias</b> no existe.</p>");
            return 0;
        }
        
        return $Path;
    }
}

$enterprise = new Enterprise();
