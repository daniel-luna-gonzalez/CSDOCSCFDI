<?php
/**
 * Description of Searcher
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

require_once 'DataBase.php';
require_once 'XML.php';
require_once "$RoutFile/DAO/Log.php";

class Searcher {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'Begin': $this->Begin(); break;
        }        
    }
    
    private function Begin()
    {
        $DB = new DataBase(); 
        $XML = new XML();
        $content = filter_input(INPUT_POST, "content");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $IdEnterprise = filter_input(INPUT_POST, "IdEnterprise");
        $StartDate = filter_input(INPUT_POST, "StartDate");
        $EndDate = filter_input(INPUT_POST, "EndDate");
        $SearchWord = filter_input(INPUT_POST, "SearchWord");
        $Match = '';
        $Key = 0;
        $TableName = '';
        $SpecificEnterprise = '';
        
        if(strcasecmp($content, "provider")==0)
        {
            $Key = 3;
            $TableName = "proveedor";
        }
        if(strcasecmp($content, "client")==0)
        {
            $Key = 2;
            $TableName = "cliente";
        }
        if(strcasecmp($content, "payroll")==0)
        {
            $Key=1;
            $TableName = "nomina";
        }              
        
        if($IdEnterprise>0 and !strlen($SearchWord)>0)
            $SpecificEnterprise = "WHERE det.id_emisor=$IdEnterprise ";
        else
            if($IdEnterprise>0)
            $SpecificEnterprise = " AND det.id_emisor=$IdEnterprise ";
        
        if(strlen($SearchWord)>0)
          $Match = "WHERE MATCH (det.Full) AGAINST ('$SearchWord' IN BOOLEAN MODE)";        
        
        if(strcasecmp($TableName, "proveedor")==0 or strcasecmp($TableName, "cliente")==0)
            $SearchQuery = "SELECT em.IdEmisor, em.nombre, em.rfc, rec.IdReceptor, rec.nombre, rec.rfc "
                . "FROM detalle_$TableName det "
                . "LEFT JOIN Emisor em on det.IdEmisor = em.IdEmisor "
                . "INNER JOIN Receptor rec ON rec.IdReceptor = det.IdReceptor "
                . "$Match $SpecificEnterprise GROUP BY em.rfc";
        
        if(strcasecmp($TableName, "nomina")==0)
                $SearchQuery = "SELECT em.IdEmisor, em.nombre, em.rfc, rec.IdReceptor, rec.nombre, rec.rfc "
                . "FROM detalle_$TableName det "
                . "LEFT JOIN Emisor em on det.IdEmisor = em.IdEmisor  "
                . "INNER JOIN Receptor rec ON rec.IdReceptor = det.IdReceptor "
                . "$Match $SpecificEnterprise GROUP BY em.rfc";

        $SearchResult = $DB->QuerySelectArray($EnterpriseAlias, $SearchQuery);
        if($SearchResult['Estado']!=1)
        {
            $XML->XmlResponse("Error", 0, "<p><b>Error</b> al realizar la búsqueda</p><br>Detalles:<br><br>".$SearchResult['Estado']);
            return 0;
        }
        $SearchArray = $SearchResult['ArrayDatos'];

        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Search');

        for($cont=0; $cont < (count($SearchArray)-1); $cont++)
        {            
            $Result = $doc->createElement("Result");
            $IdTransmiter = $doc->createElement("IdTransmiter", $SearchArray[$cont][0]);
            $Result->appendChild($IdTransmiter);
            $TransmiterName = $doc->createElement("TransmiterName", $SearchArray[$cont][1]);
            $Result->appendChild($TransmiterName);
            $TRansmiterRFC = $doc->createElement("TransmiterRfc", $SearchArray[$cont][2]);
            $Result->appendChild($TRansmiterRFC);
            $IdReceiver = $doc->createElement("IdReceiver", $SearchArray[$cont][3]);
            $Result->appendChild($IdReceiver);
            $ReceiverName = $doc->createElement("ReceiverName", $SearchArray[$cont][4]);
            $Result->appendChild($ReceiverName);
            $ReceiverRfc = $doc->createElement("ReceiverRfc", $SearchArray[$cont][5]);
            $Result->appendChild($ReceiverRfc);
            $root->appendChild($Result);

        }
        $doc->appendChild($root);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
//         $log->log_registro_busqueda($IdUser,$IdEnterprise,$SearchWord,$StartDate,$EndDate,$Key);/* Registro Log */ 
    }
}

$searcher = new Searcher();
