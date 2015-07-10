<?php

/**
 * Description of EmailEngine
 *
 * @author Daniel
 */
require_once 'DataBase.php';
require_once 'XML.php';
require_once 'Enterprise.php';
require_once  'PHPMailer/class.phpmailer.php'; 
require_once 'CFDI.php';

class EmailEngine {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {        
        $option = filter_input(INPUT_POST, "option");

        $Parameters = $_SERVER['argv'];
        if(count($Parameters)>0)
            $this->OptionService();
        else
            switch ($option)
            {
                case 'GetActiveEmails': $this->GetActiveEmails(); break;
                case 'CheckEmail': $this->CheckEmail(); break;
                case 'DeleteEmail': $this->DeleteEmail(); break;
                case 'GetEmail': $this->GetEmial(); break;
                case 'ModifyEmail': $this->ModifyEmail(); break;
                case 'DownloadCFDIs': $this->DownloadCFDIs(); break;
            }                       
    }
        /* Opciones para que funcione esta clase en modo servicio */
    private function OptionService()
    {
        $Parameters = $_SERVER['argv']; 
        $DownloadType = '';
        if(isset($Parameters[1]))
            $DownloadType = $Parameters[1];
        
        switch ($DownloadType)
        {
            case 'CFDIWebDownload': $this->CFDIWebDownload(); break;
            default : break;
        }                
    }
    
    private function CFDIWebDownload()
    {
        $RootPath = dirname(getcwd());
        $Parameters = $_SERVER['argv']; 
        $AliasPath = null; $EnterpriseAlias = 0; $IdUser = 0; $UserName = null;
        
        if(isset($Parameters[2]) and isset($Parameters[3]) and isset($Parameters[4]) and $Parameters[5])
        {
            $AliasPath = $Parameters[2];
            $EnterpriseAlias = $Parameters[3];
            $IdUser = $Parameters[4];
            $UserName = $Parameters[5];
        }
        
        if(isset($Parameters[6]) and isset($Parameters[7]))
        {            
            $IdEmail = $Parameters[6];
            $UserNameEmail = $Parameters[7];
            $this->DownloadCFDIsService($EnterpriseAlias, $IdUser, $UserName, $IdEmail, $UserNameEmail);
            $Files = $this->ExploreDownloadCFDI($EnterpriseAlias, $UserNameEmail);
            $CFDI = new CFDI();
            $Upload = $CFDI->UploadCFDI($EnterpriseAlias, $Files , $AliasPath, 1);
            echo "\n Resultado de carga de CFDI = $Upload";
        }
    }
    
    /* Método que ejecuta el servicio de descarga de CFDI's desde correo elctrónico */
    private function DownloadCFDIs()
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $AliasPath = Enterprise::GetEnterprisePath($EnterpriseAlias);

        $EmailXmlString = filter_input(INPUT_POST, "Xml");
        
        if(!($EmailXml = simplexml_load_string($EmailXmlString)))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al manipular el XML</p><br>Detalles:<br><br>$EmailXml");
        }
        /* Xml con los correos a explorar */
        foreach ($EmailXml->Email as $Email)
        {
            $IdEmail = $Email->IdEmail;
            $UserNameEmail = $Email->UserNameEmail;
            
            $EmailEngineOutpuPath = "$RoutFile/EmailEngine/$EnterpriseAlias/";
            $EmailEngineOutput = "$RoutFile/EmailEngine/$EnterpriseAlias/$UserNameEmail.ini";

            if(!file_exists($EmailEngineOutpuPath))
                if(!($mkdir = mkdir($EmailEngineOutpuPath, 0777, true)))
                {
                    XML::XmlResponse("Error", 0, "<p><b>Error</b> al generar el directorio de descarga de CFDI's</p><br>Detalles:<br><br>$mkdir");
                    return 0;
                }
            /* Ejecución del programa en modo servicio */
            $command = "php $RoutFile/php/EmailEngine.php CFDIWebDownload $AliasPath $EnterpriseAlias $IdUser $UserName $IdEmail $UserNameEmail >>$EmailEngineOutput 2>>$EmailEngineOutput &";
            exec($command); 
        }
                
        XML::XmlResponse("DownloadCFDIs", 1, "Comenzando proceso de descarga de CFDI's desde correo electrónico.");
    }        
    
    /* Función utilizada desde una descarga web y en modo servicio */
    function DownloadCFDIsService($EnterpriseAlias, $IdUser, $UserName, $IdEmail = 0)
    {        
        $RootPath = dirname(getcwd());   /* /volume/web/ */
        $Email = $this->GetEmial($EnterpriseAlias, $IdUser, $UserName, $IdEmail);
        $UserNameEmail = $Email['User'];
        $ImapSecure = '';
        $regexp = '/([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+/i';
        
        if(strcasecmp($Email['ImapSecure'], "ssl")==0 or strcasecmp($Email['ImapSecure'], "tls")==0)
            $ImapSecure = $Email['ImapSecure']."/" ;
                
        $ImapPath = "{".$Email['Imap'].":".$Email['ImapPort']."/imap/".$ImapSecure."novalidate-cert}";
                        
        if(!($mbox = imap_open ($ImapPath,  $Email['User'], $Email['Password'])))
        {
            echo "\nError al intentar conectarse a imap ".imap_last_error();
            return 0;
        }

        for ($MsgNumber = 1; $MsgNumber <= imap_num_msg($mbox); $MsgNumber++)
        {
//            echo "\n\n correo No $MsgNumber";
            /* get information specific to this email */
//            $overview = imap_fetch_overview($mbox,$MsgNumber,0);
//            $message = imap_fetchbody($mbox,$MsgNumber,2);
            $structure = imap_fetchstructure($mbox,$MsgNumber);

            $attachments = array();
            if(!isset($structure->parts))
                continue;
            
            for($i = 1; $i < count($structure->parts); $i++) 
            {
                $structure = imap_fetchstructure($mbox, $MsgNumber );    
                $parts = $structure->parts;
                $m = array();
                $EmailDetail = imap_fetch_overview($mbox,$MsgNumber, 0);   /* Objeto con detalle de correo */                                        
                preg_match_all($regexp, $EmailDetail[0]->from, $m,PREG_PATTERN_ORDER);/* Se busca la estructura de correo */
                $Sender = $m[0][0];                    
                $TempPath = "$RootPath/EmailEngine/$EnterpriseAlias/$UserNameEmail/$Sender/"; 
                
                for($i = 1; $i < count($parts); $i++)
                {
                    /* Se ignoran otros formatos que no sean XML y PDF */
                    $m = array();
                    $Extension = $structure->parts[$i]->subtype;

                    if(!(strcasecmp($Extension, "xml")==0 or strcasecmp($Extension, "pdf")==0))
                    continue;

                    $attachments[$i] = array('is_attachment' => false, 'filename' => '', 'name' => '', 'attachment' => '');

                    if($structure->parts[$i]->ifdparameters)
                    {
                        foreach($structure->parts[$i]->dparameters as $object) {
                            if(strtolower($object->attribute) == 'filename') {
                                $filename = $object->value;
                                
                                $attachments[$i]['is_attachment'] = true;
                                $attachments[$i]['filename'] = $object->value;
                                
                                $attachments[$i]['attachment'] = imap_fetchbody($mbox, $MsgNumber, $i+1);
                                
                                if($structure->parts[$i]->encoding == 3) { // 3 = BASE64
                                    $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
                                }
                                else if($structure->parts[$i]->encoding == 4) { // 4 = QUOTED-PRINTABLE
                                $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
                                }                                
                            }
                        }
                    }

                    /* Path de destino para los documentos extraido EmailEngine/correo@Emisor.com */
                    
                    if(!file_exists($TempPath))
                        if(!($mkdir = mkdir($TempPath,0777, true)))
                        {
                            echo "\n Error al crear la ruta destino del remitente $Sender";
                            continue;
                        }                        
                }
                
                /* Se almacenan los archivos adjuntos del mensaje actual */
                foreach($attachments as $at)
                {                                     
                    if($at['is_attachment']==1)
                    {              
                        $filename = $at['filename'];      
                        if(file_exists($TempPath.$filename))
                        {
                            $FileExtension = pathinfo($filename, PATHINFO_EXTENSION);
                            $filename = pathinfo($this->RenameFile(dirname($TempPath.$filename),basename($TempPath.$filename)), PATHINFO_FILENAME).".".$FileExtension;
//                            echo "\n Nuevo nombre $filename";
                        }

                        if(!($PutContent = file_put_contents($TempPath.$filename,$at['attachment'])))
                        {
                            echo "\n Error al escribir contenido en el documento $filename del correo $UserNameEmail y emisor $Sender.";
                            continue 3;  /* Siguiente correo */
                        }
                        else
                            echo "\n Se descargó  $filename del correo $UserNameEmail y emisor $Sender almacenamiento temporal correcto $PutContent bytes";                                
                    }                                                                                                                                                              
                }
            }
    //            imap_mail_move($mbox, $MsgNumber, $buzon_destino);
    //imap_delete tags a message for deletion
                        
//            imap_delete($mbox,$MsgNumber);
        }
        
// imap_expunge deletes all tagged messages
//                    imap_expunge($mbox);
//        imap_close($mbox,CL_EXPUNGE);           
        imap_close($mbox); 
        
        echo "\n Conexión finalizada";
        return 1;
    }    
        
    private function RenameFile($destination,$NewRouteDestinationXml)
    {
        $increment = 1; //start with no suffix
        $name = pathinfo($NewRouteDestinationXml, PATHINFO_FILENAME);
        $extension = pathinfo($NewRouteDestinationXml, PATHINFO_EXTENSION);
        while(file_exists($destination."/".$name . $increment . '.' . $extension)) {
            $increment++;
        }

        $basename = $name . $increment . '.' . $extension;
        return $basename;
    }
    
    function ExploreDownloadCFDI($EnterpriseAlias, $addressee)
    {
        $RootPath = dirname(getcwd());   /* /volume/web/ */
        $DirectoryPath = '';
        
        $DirectoryPath = $RootPath."/EmailEngine/$EnterpriseAlias/$addressee";
        
        $FilesArray = array();
        
        if(!file_exists($DirectoryPath))
        {
            echo "\n No se encontrarón CFDI's descargados desde correo electrónico para la empresa '$EnterpriseAlias'";
            return 0;
        }
        
        $escaneo = scandir($DirectoryPath);     
         
        foreach ($escaneo as $scan) 
        {             
            if ($scan != '.' and $scan != '..')
                if(is_dir($DirectoryPath."/".$scan))
                    foreach (scandir($DirectoryPath."/".$scan) as $File)
                    {
                        if ($File != '.' and $File != '..')
                            $FilesArray[] = array("CfdiName"=>$File, "CfdiPath"=>"$DirectoryPath/$scan/$File", "Sender"=>$scan);
                    }
        }
         
         return $FilesArray;
    }
    
    private function GetEmial($EnterpriseAlias = null, $idUser = 0, $UserName = null, $IdEmail = 0)
    {
        $DB = new DataBase();
       
        if($EnterpriseAlias == null)        
            $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        if($idUser == 0)
            $IdUser = filter_input(INPUT_POST, "IdUser");
        if($UserName == null)
            $UserName = filter_input(INPUT_POST, "UserName");
        if($IdEmail == 0)
            $IdEmail = filter_input(INPUT_POST, "IdEmail");
                
        $SelectEmailQ = "SELECT *FROM EmailEngine WHERE Idemail = $IdEmail";
        $SelectResult = $DB->ConsultaSelect($EnterpriseAlias, $SelectEmailQ);
        if($SelectResult['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar la información del correo electrónico seleccionado</p><br>Detalles:<br><br>".$SelectResult['Estado']);
            return 0;
        }
        /* Sí la petición fué tipo post, se devuelve el array */
        $option = filter_input(INPUT_POST, "option");
        
        if(strcasecmp($option, "GetEmail")==0)
            XML::XmlArrayResponse("EmailInfo", "Email", $SelectResult['ArrayDatos']);
        else
            return $SelectResult['ArrayDatos'][0];
    }
    
    private function ModifyEmail()
    {        
        $EmailType = filter_input(INPUT_POST, "EmailType");
        if(strcasecmp($EmailType, "CommonEmail")==0)
            $this->ModifyCommonEmail();
        else if(strcasecmp($EmailType, "EnterpriseEmail")==0)
            $this->ModifyEnterpriseEmail();
        else
            XML::XmlResponse ("Error", 0, "<p><b>Error.</b> No se reconoce el tipo de correo electrónico</p>");
    }
    
    private function ModifyEnterpriseEmail()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdEmail = filter_input(INPUT_POST, "IdEmail");
        $UserNameEmail = filter_input(INPUT_POST, "UserNameEmail");
        $EmailTitle = filter_input(INPUT_POST, "EmailTitle");
        $EmailPassword = filter_input(INPUT_POST, "EmailPassword");
        $Smtp = filter_input(INPUT_POST, "Smtp");
        $SmtpPort = filter_input(INPUT_POST, "SmtpPort");
        $SmtpAuth = filter_input(INPUT_POST, "SmtpAuth");
        $SmtpSecure = filter_input(INPUT_POST, "SmtpSecure");
        $Imap = filter_input(INPUT_POST, "Imap");
        $ImapPort = filter_input(INPUT_POST, "ImapPort");
        $ImapSecure = filter_input(INPUT_POST, "ImapSecure");
        $FlagModifiedEmailName = filter_input(INPUT_POST, "FlagModifiedEmailName");
        
        if(strcasecmp($ImapSecure, "ssl")==0 or strcasecmp($ImapSecure, "tls")==0)
            $ImapSecure.="/" ;
        else
            $ImapSecure = '';
        
        $Email = array
        (
            "EnterpriseAlias"=>$EnterpriseAlias, "IdUser"=>$IdUser, "UserName"=>$UserName,
            "UserNameEmail"=>$UserNameEmail, "EmailPassword"=>$EmailPassword, "Smtp"=>$Smtp,
            "EmailTitle"=>$EmailTitle, "SmtpPort"=>$SmtpPort,
            "SmtpAuth"=>$SmtpAuth, "SmtpSecure"=>$SmtpSecure, "Imap"=>$Imap, "ImapPort"=>$ImapPort,
            "ImapSecure"=>$ImapSecure
        );
        
        /* Sí el correo se cambia se verifica que no exista  */
        if(strcasecmp($FlagModifiedEmailName, "true")==0)
        {
            $CheckIfExist = "SELECT *FROM EmailEngine WHERE User COLLATE utf8_bin = '$UserNameEmail'";
            $CheckIfExistRes = $DB->ConsultaSelect($EnterpriseAlias, $CheckIfExist);
            if($CheckIfExistRes['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar existencia del nuevo correo electrónico</p><br>Detalles:<br><br>".$CheckIfExistRes['Estado']);
                return 0;
            }
            if(count($CheckIfExistRes['ArrayDatos'])>0)
            {
                XML::XmlResponse("Duplicated", 1 , "<p>El correo electrónico $UserNameEmail ya se encuentra registrado</p>");
                return ;
            }        
        }
        
        /* Prueba de envio (Envió de email) */
        $Recipients = array();
        $Recipients[] = array("Addressee"=>$Email['UserNameEmail'], "Title"=>$Email['EmailTitle']);
        $Subject = "Modificación de datos del correo electrónico en CSDocs CFDI";
        $Message = "Ha modificado la información de su cuenta de correo en el sistema CSDocs CFDI, ya puede realizar descargas de <b>Comprobantes Fiscales Digitales por Internet</b> y almacenarlos de forma segura.";
        
        if(($SendEmail = $this->SendEmail($Email, $Recipients, $Subject, $Message))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al realizar la prueba de envio de correo electrónico: <br><br>$SendEmail</p>");
            return 0;
        }
              
        $ImapPath = "{".$Imap.":".$ImapPort."/imap/".$ImapSecure."novalidate-cert}";        

        if(($mbox = imap_open ($ImapPath,  $UserNameEmail, $EmailPassword)))
             imap_close($mbox);             
        else
        {
            XML::XmlResponse("Error", 0, "<p>Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>");
            return 0;
        }         
        
        $Update = "UPDATE EmailEngine SET User = '$UserNameEmail', Title = '$EmailTitle', "
                . "Password = '$EmailPassword', Smtp = '$Smtp', SmtpPort = '$SmtpPort', SmtpAuth = '$SmtpAuth', "
                . "SmtpSecure = '$SmtpSecure', Imap = '$Imap', ImapSecure = '$ImapSecure' WHERE IdEmail = $IdEmail";
        
        if(($DB->ConsultaQuery($EnterpriseAlias, $Update))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar la información</p>");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("ModifiedEmail");
        $doc->appendChild($root);         
        $Mensaje = $doc->createElement("Mensaje", "Información actualizada del correo $UserNameEmail");
        $root->appendChild($Mensaje);
        $EmailXml = $doc->createElement("UserNameEmail", $UserNameEmail);
        $root->appendChild($EmailXml);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
    
    private function ModifyCommonEmail()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdEmail = filter_input(INPUT_POST, "IdEmail");
        $UserNameEmail = filter_input(INPUT_POST, "UserNameEmail");
        $EmailServer = filter_input(INPUT_POST, "EmailServer");
        $EmailPassword = filter_input(INPUT_POST, "Password");
        $EmailTitle = filter_input(INPUT_POST, "EmailTitle");
        $FlagModifiedEmailName = filter_input(INPUT_POST, "FlagModifiedEmailName");
        
        $EmailParameters = $this->GetCommonEmailParameters($EmailServer);
        if(!is_array($EmailParameters))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> no se encontraron los parámetros necesarios para realizar la conexión a su correo");
            return 0;
        }
        
        $Email = array
        (
            "EnterpriseAlias"=>$EnterpriseAlias, "IdUser"=>$IdUser, "UserName"=>$UserName,
            "UserNameEmail"=>$UserNameEmail.$EmailParameters['Server'], "EmailPassword"=>$EmailPassword, "Smtp"=>$EmailParameters['Smtp'],
            "EmailTitle"=>$EmailTitle, "SmtpPort"=>$EmailParameters['SmtpPort'],
            "SmtpAuth"=>$EmailParameters['SmtpAuth'], "SmtpSecure"=>$EmailParameters['SmtpSecure'],
            "Imap"=>$EmailParameters['Imap'], "ImapPort"=>$EmailParameters['ImapPort'], 
            "ImapSecure"=>$EmailParameters['ImapSecure'], "ImapPath"=>$EmailParameters['ImapPath']
        );        
        
        /* Sí el correo se cambia se verifica que no exista  */
        if(strcasecmp($FlagModifiedEmailName, "true")==0)
        {
            $CheckIfExist = "SELECT *FROM EmailEngine WHERE User COLLATE utf8_bin = '".$Email['UserNameEmail']."'";
            $CheckIfExistRes = $DB->ConsultaSelect($EnterpriseAlias, $CheckIfExist);
            if($CheckIfExistRes['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar existencia del nuevo correo electrónico</p><br>Detalles:<br><br>".$CheckIfExistRes['Estado']);
                return 0;
            }
            if(count($CheckIfExistRes['ArrayDatos'])>0)
            {
                XML::XmlResponse("Duplicated", 1 , "<p>El correo electrónico ".$Email['UserNameEmail']." ya se encuentra registrado</p>");
                return ;
            }        
        }
        
                /* Prueba de envio (Envió de email) */
        $Recipients = array();
        $Recipients[] = array("Addressee"=>$Email['UserNameEmail'], "Title"=>$Email['EmailTitle']);
        $Subject = "Modificación de datos del correo electrónico en CSDocs CFDI";
        $Message = "Ha modificado la información de su cuenta de correo en el sistema CSDocs CFDI, ya puede realizar descargas de <b>Comprobantes Fiscales Digitales por Internet</b> y almacenarlos de forma segura.";
        
        
        if(($SendEmail = $this->SendEmail($Email, $Recipients, $Subject, $Message))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al realizar la prueba de envio de correo electrónico: <br><br>$SendEmail</p>");
            return 0;
        }        
        
        if(($mbox = imap_open ($EmailParameters['ImapPath'],  $Email['UserNameEmail'], $EmailPassword)))
             imap_close($mbox);             
        else
        {
            XML::XmlResponse("Error", 0, "<p>Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>");
            return 0;
        }    
        
        $Update = "UPDATE EmailEngine SET User = '".$Email['UserNameEmail']."', Title = '$EmailTitle', "
                . "Password = '$EmailPassword' WHERE IdEmail = $IdEmail";
        
        if(($DB->ConsultaQuery($EnterpriseAlias, $Update))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar la información</p>");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("ModifiedEmail");
        $doc->appendChild($root);         
        $Mensaje = $doc->createElement("Mensaje", "Información actualizada del correo ".$Email['UserNameEmail']);
        $root->appendChild($Mensaje);
        $EmailXml = $doc->createElement("UserNameEmail", $Email['UserNameEmail']);
        $root->appendChild($EmailXml);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function DeleteEmail()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdEmail = filter_input(INPUT_POST, "IdEmail");
        $UserNameEmail = filter_input(INPUT_POST, "UserNameEmail");
        
        $DeletedQuery = "DELETE FROM EmailEngine WHERE IdEmail = $IdEmail";
        if(($DeletedResult = $DB->ConsultaQuery($EnterpriseAlias, $DeletedQuery))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al eliminar el correo electrónico seleccionado</p><br>Detalles:<br><br>$DeletedResult");
            return 0;
        }
        
        XML::XmlResponse("DeletedEmail", 1, "<p>Se eliminó a $UserNameEmail</p>");
    }
    
    /* Nuevo Correo */
    private function CheckEmail()
    {
        $EmailType = filter_input(INPUT_POST, "EmailType");
        if(strcasecmp($EmailType, "EnterpriseEmail")==0)
            $this->ProcessingEnterpriseEmail();
        else if(strcasecmp($EmailType, "CommonEmail")==0)
            $this->ProcessingCommonEmail();
        else
            XML::XmlResponse ("Error", 0, "<p>No se reconoce el tipo de email ingresado</p>");

    }
    
    private function ProcessingCommonEmail()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $UserNameEmail = filter_input(INPUT_POST, "UserNameEmail");
        $EmailServer = filter_input(INPUT_POST, "EmailServer");
        $EmailPassword = filter_input(INPUT_POST, "Password");
        $EmailTitle = filter_input(INPUT_POST, "EmailTitle");
        
        $EmailParameters = $this->GetCommonEmailParameters($EmailServer);
        if(!is_array($EmailParameters))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> no se encontraron los parámetros necesarios para realizar la conexión a su correo");
            return 0;
        }
        
        $Email = array
        (
            "EnterpriseAlias"=>$EnterpriseAlias, "IdUser"=>$IdUser, "UserName"=>$UserName,
            "UserNameEmail"=>$UserNameEmail.$EmailParameters['Server'], "EmailPassword"=>$EmailPassword, "Smtp"=>$EmailParameters['Smtp'],
            "EmailTitle"=>$EmailTitle, "SmtpPort"=>$EmailParameters['SmtpPort'],
            "SmtpAuth"=>$EmailParameters['SmtpAuth'], "SmtpSecure"=>$EmailParameters['SmtpSecure'],
            "Imap"=>$EmailParameters['Imap'], "ImapPort"=>$EmailParameters['ImapPort'], 
            "ImapSecure"=>$EmailParameters['ImapSecure'], "ImapPath"=>$EmailParameters['ImapPath']
        );        

        $CheckIfExist = "SELECT *FROM EmailEngine WHERE User COLLATE utf8_bin = '".$Email['UserNameEmail']."'";
        $CheckIfExistRes = $DB->ConsultaSelect($EnterpriseAlias, $CheckIfExist);
        if($CheckIfExistRes['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar existencia del nuevo correo electrónico</p><br>Detalles:<br><br>".$CheckIfExistRes['Estado']);
            return 0;
        }
        if(count($CheckIfExistRes['ArrayDatos']))
        {
            XML::XmlResponse("Duplicated", 1 , "<p>El correo electrónico ".$Email['UserNameEmail']." ya se encuentra registrado</p>");
            return ;
        }        
        
                /* Prueba de envio (Envió de email) */
        $Recipients = array();
        $Recipients[] = array("Addressee"=>$Email['UserNameEmail'], "Title"=>$Email['EmailTitle']);
        $Subject = "Alta de correo electrónico en CSDocs CFDI";
        $Message = "Ha dado de alta su correo electrónico en el sistema CSDocs CFDI, ya puede realizar descargas de <b>Comprobantes Fiscales Digitales por Internet</b> y almacenarlos de forma segura.";
        
        if(($SendEmail = $this->SendEmail($Email, $Recipients, $Subject, $Message))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al realizar la prueba de envio de correo electrónico: <br><br>$SendEmail</p>");
            return 0;
        }        

        if(($mbox = imap_open ($EmailParameters['ImapPath'],  $Email['UserNameEmail'], $EmailPassword)))
             imap_close($mbox);             
        else
        {
            XML::XmlResponse("Error", 0, "<p>Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>");
            return 0;
        }    
        
        $InsertEmail = "INSERT INTO EmailEngine "
                . "(User, Password, Title, Smtp, SmtpPort, SmtpAuth, SmtpSecure, Imap, ImapPort, ImapSecure, EmailType, EmailServerName) "
                . "VALUES ('".$Email['UserNameEmail']."', '$EmailPassword', '$EmailTitle', '".$Email['Smtp']."', ".$Email['SmtpPort'].", "
                . "'".$Email['SmtpAuth']."', '".$Email['SmtpSecure']."', '".$Email['Imap']."', "
                . $Email['ImapPort'].", '".$Email['ImapSecure']."', 'Common', '$EmailServer')";
        
        $InsertEmailResult = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertEmail);
        if(!($InsertEmailResult>0))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar el correo electrónico</p><br>Detalles:<br><br>$InsertEmailResult");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("NewEmail");
        $doc->appendChild($root);         
        $Mensaje = $doc->createElement("Mensaje", "El correo ".$Email['UserNameEmail']." fué dado de alta con éxito");
        $root->appendChild($Mensaje);
        $EmailXml = $doc->createElement("UserNameEmail", $Email['UserNameEmail']);
        $root->appendChild($EmailXml);
        $IdEmail = $doc->createElement("IdEmail",$InsertEmailResult);
        $root->appendChild($IdEmail);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function ProcessingEnterpriseEmail()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $UserNameEmail = filter_input(INPUT_POST, "UserNameEmail");
        $EmailTitle = filter_input(INPUT_POST, "EmailTitle");
        $EmailPassword = filter_input(INPUT_POST, "EmailPassword");
        $Smtp = filter_input(INPUT_POST, "Smtp");
        $SmtpPort = filter_input(INPUT_POST, "SmtpPort");
        $SmtpAuth = filter_input(INPUT_POST, "SmtpAuth");
        $SmtpSecure = filter_input(INPUT_POST, "SmtpSecure");
        $Imap = filter_input(INPUT_POST, "Imap");
        $ImapPort = filter_input(INPUT_POST, "ImapPort");
        $ImapSecure = filter_input(INPUT_POST, "ImapSecure");
        
        if(strcasecmp($ImapSecure, "ssl")==0 or strcasecmp($ImapSecure, "tls")==0)
            $ImapSecure.="/" ;
        else
            $ImapSecure = '';
        
        $Email = array
        (
            "EnterpriseAlias"=>$EnterpriseAlias, "IdUser"=>$IdUser, "UserName"=>$UserName,
            "UserNameEmail"=>$UserNameEmail, "EmailPassword"=>$EmailPassword, "Smtp"=>$Smtp,
            "EmailTitle"=>$EmailTitle, "SmtpPort"=>$SmtpPort,
            "SmtpAuth"=>$SmtpAuth, "SmtpSecure"=>$SmtpSecure, "Imap"=>$Imap, "ImapPort"=>$ImapPort,
            "ImapSecure"=>$ImapSecure
        );
        
        $CheckIfExist = "SELECT *FROM EmailEngine WHERE User COLLATE utf8_bin = '$UserNameEmail'";
        $CheckIfExistRes = $DB->ConsultaSelect($EnterpriseAlias, $CheckIfExist);
        if($CheckIfExistRes['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar existencia del nuevo correo electrónico</p><br>Detalles:<br><br>".$CheckIfExistRes['Estado']);
            return 0;
        }
        if(count($CheckIfExistRes['ArrayDatos']))
        {
            XML::XmlResponse("Duplicated", 1 , "<p>El correo electrónico $UserNameEmail ya se encuentra registrado</p>");
            return ;
        }        
                      
        /* Prueba de envio (Envió de email) */
        $Recipients = array();
        $Recipients[] = array("Addressee"=>$Email['UserNameEmail'], "Title"=>$Email['EmailTitle']);
        $Subject = "Alta de correo electrónico en CSDocs CFDI";
        $Message = "Ha dado de alta su correo electrónico en el sistema CSDocs CFDI, ya puede realizar descargas de <b>Comprobantes Fiscales Digitales por Internet</b> y almacenarlos de forma segura.";
        
        if(($SendEmail = $this->SendEmail($Email, $Recipients, $Subject, $Message))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al realizar la prueba de envio de correo electrónico: <br><br>$SendEmail</p>");
            return 0;
        }
              
        $ImapPath = "{".$Imap.":".$ImapPort."/imap/".$ImapSecure."novalidate-cert}";        

        if(($mbox = imap_open ($ImapPath,  $UserNameEmail, $EmailPassword)))
             imap_close($mbox);             
        else
        {
            XML::XmlResponse("Error", 0, "<p>Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>");
            return 0;
        }                
        
        $InsertEmail = "INSERT INTO EmailEngine "
                . "(User, Password, Title, Smtp, SmtpPort, SmtpAuth, SmtpSecure, Imap, ImapPort, ImapSecure, EmailType, EmailServerName) "
                . "VALUES ('$UserNameEmail', '$EmailPassword', '$EmailTitle', '$Smtp', $SmtpPort, '$SmtpAuth', '$SmtpSecure', '$Imap', $ImapPort, '$ImapSecure', 'Enterprise', 'otro')";
        
        $InsertEmailResult = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertEmail);
        if(!($InsertEmailResult>0))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar el correo electrónico</p><br>Detalles:<br><br>$InsertEmailResult");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("NewEmail");
        $doc->appendChild($root);         
        $Mensaje = $doc->createElement("Mensaje", "El correo $UserNameEmail fué dado de alta con éxito");
        $root->appendChild($Mensaje);
        $EmailXml = $doc->createElement("UserNameEmail", $UserNameEmail);
        $root->appendChild($EmailXml);
        $IdEmail = $doc->createElement("IdEmail",$InsertEmailResult);
        $root->appendChild($IdEmail);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }        
    
    public static function SendEmail(array $Email, array $Recipients, $Subject, $Message)
    {        
        $mail = new PHPMailer;

//        $mail->SMTPDebug = 3;                               // Enable verbose debug output

        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->Host = $Email['Smtp'];  // Specify main and backup SMTP servers
        $mail->SMTPAuth = $Email['SmtpAuth'];                               // Enable SMTP authentication
        $mail->Username = $Email['UserNameEmail'];                 // SMTP username
        $mail->Password = $Email['EmailPassword'];                           // SMTP password
        $mail->SMTPSecure = $Email['SmtpSecure'];                            // Enable TLS encryption, `ssl` also accepted
        $mail->Port = $Email['SmtpPort'];                                    // TCP port to connect to

        $mail->From = $Email['UserNameEmail'];
        $mail->FromName = utf8_decode($Email['EmailTitle']);
        
        for($cont=0; $cont < count($Recipients); $cont++)
        {
            $mail->addAddress($Recipients[$cont]['Addressee'], $Recipients[$cont]['Title']);     // Add a recipient  $mail->addAddress('joe@example.net', 'Joe User');
                                                              // Name is optional $mail->addAddress('ellen@example.com');
        }        
        
//        $mail->addReplyTo('info@example.com', 'Information');
//        $mail->addCC('cc@example.com');
//        $mail->addBCC('bcc@example.com');

//        $mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
//        $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
        $mail->isHTML(true);                                  // Set email format to HTML

        $mail->Subject = utf8_decode($Subject);
        $mail->Body    = utf8_decode($Message);
//        $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

        if(!$mail->send())            
            return  '<p><b>Error.</b> No pudo ser enviado el correo, verifique que su información sea correcta. </p><br> Detalles:<br><br> ' . $mail->ErrorInfo;
        else 
            return 1;        
    }
    
    private function GetCommonEmailParameters($host)
    {
        
        $Smtp = ''; $SmtpPort = ''; $SmtpAuth = ''; $SmtpSecure = ''; $Imap = ''; $ImapPort = ''; $ImapSecure = '';
        $ImapPath = ''; $Server = '';
        
        switch ($host)
        {
            case 'gmail':
                
                $Smtp = "smtp.gmail.com";
                $SmtpPort = 465;
                $SmtpSecure = "ssl";
                $SmtpAuth = "true";
                $Server = "@gmail.com";
                $ImapPort = 993;
                $Imap = 'imap.gmail.com';
                $ImapSecure = 'ssl';
                $ImapPath = "{".$Imap.":$ImapPort/imap/$ImapSecure/novalidate-cert}INBOX"; 
                                                
                break;
            
            case 'hotmail':
                
                $Smtp = "smtp-mail.outlook.com";
                $SmtpPort = 587;
                $SmtpSecure = "tls";
                $SmtpAuth = "true";
                $Server = "@hotmail.com";
                $ImapPort = 993;
                $Imap = 'imap-mail.outlook.com';
                $ImapSecure = 'ssl';
                $ImapPath="{".$Imap.":$ImapPort/imap/$ImapSecure/novalidate-cert}INBOX";
                break;
            
            case 'yahoo':
                $Smtp = "plus.smtp.mail.yahoo.com";
                $SmtpPort = 465;
                $SmtpSecure = "ssl";
                $SmtpAuth = "true";
                $Server = "@yahoo.com";
                $ImapPort = 993;
                $Imap = 'imap.mail.yahoo.com';
                $ImapSecure = 'ssl';
                $ImapPath="{".$Imap.":$ImapPort/imap/$ImapSecure/novalidate-cert}INBOX";
                break;
            
            case 'live':
                $Smtp = "smtp-mail.outlook.com";
                $SmtpPort = 587;
                $SmtpAuth = "true";
                $SmtpSecure = "tls";
                $Server = "@live.com";
                $ImapPort = 993;
                $Imap = 'imap-mail.outlook.com';
                $ImapSecure = "ssl";
                $ImapPath="{".$Imap.":$ImapPort/imap/$ImapSecure/novalidate-cert}INBOX";
                break;            
            
            default: return 0;                           
        }
        
        return array(
                    "Smtp"=>$Smtp, "SmtpPort"=>$SmtpPort, "SmtpAuth"=>$SmtpAuth, "SmtpSecure"=>$SmtpSecure, 
                    "Imap"=>$Imap, "ImapPort"=>$ImapPort, "ImapSecure"=>$ImapSecure, "ImapPath" => $ImapPath,
                    "Server"=>$Server
                        );
                 
    }
    
    private function GetActiveEmails()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        
        
        $ActiveEmailsQuery = "SELECT IdEmail, User FROM EmailEngine";
        $ActiveEmailResult = $DB->ConsultaSelect($EnterpriseAlias, $ActiveEmailsQuery);
        if($ActiveEmailResult['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar los correos activos</p><br>Detalles:<br><br>".$ActiveEmailResult['Estado']);
            return 0;
        }
        
        XML::XmlArrayResponse("ActiveEmails", "Email", $ActiveEmailResult['ArrayDatos']);
        
    }    
}

$Email = new EmailEngine();