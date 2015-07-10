<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Version
 *
 * @author Daniel
 */
require_once 'DataBase.php';
require_once 'Encrypter.php';
class Version {
    public static function CheckVersion()
    {
        $DB = new DataBase();
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */     
        
        /* Se comprueba el número de empresas que puede crear el sistema */
        if(!file_exists("$RoutFile/version/version.ini"))
        {
            XML::XmlResponse("Warning", 0, "<p>Error</b> no se encontró la licencia del producto. Favor de reportar directamente con CSDocs</p>");
            return 0;
        }
        
        if(!($Version = parse_ini_file("$RoutFile/version/version.ini")))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al abrir el archivo version</p><br>br$Version");
            return 0;
        }
        
        if(!isset($Version['Enterprises']))
        {
            XML::XmlResponse("Error", 0, "<p><b>No se encuentra definido el total de empresas permitida para esta versión de CSDocs CFDI</p>");
            return 0;
        }
        
        $EnterprisesAllowedEncrypted = $Version['Enterprises'];
        $EnterprisesAllowed = Encrypter::decrypt($EnterprisesAllowedEncrypted);
        
        if(!is_numeric($EnterprisesAllowed))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> el número de Empresas asignada a su versión de CSDocs CFDI es inválido. Favor de reportarlo a CSDocs</p>");
            return 0;
        }
        
        $QueryTotalEnterprises = "SELECT *FROM Enterprises";
        $TotalEnterprisesResult = $DB->ConsultaSelect("Manager", $QueryTotalEnterprises);
        if($TotalEnterprisesResult['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar el total de empresas</p><br>Detalles:<br><br>".$TotalEnterprisesResult['Estado']);
            return 0;
        }
        
        $TotalEnterprisesAvailable = count($TotalEnterprisesResult['ArrayDatos']); 
//        echo "<p>$TotalEnterprisesAvailable<=$EnterprisesAllowed</p>";
        if($TotalEnterprisesAvailable>=$EnterprisesAllowed)       
        {
           XML::XmlResponse("Warning", 0, "Total de Empresas alcanzado para su versión de CSDocs CFDI");
            return 0; 
        }
        else
            return 1;
    }
}
