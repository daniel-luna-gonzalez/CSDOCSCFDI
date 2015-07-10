<?php
/**
 * Description of CFDI
 *
 * @author Daniel
 */

$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
if(!file_exists($filename))
    $RoutFile = dirname(getcwd());

require_once 'XML.php';
require_once "$RoutFile/DAO/Log.php";
require_once "$RoutFile/Transaction/Read_factura_cliente.php";
require_once 'DataBase.php';
require_once "$RoutFile/Transaction/webservice_sat.php";
require_once "Receipt.php";
require_once "Historical.php";
require_once 'ReadCFDI.php';

class CFDI {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'GetXmlStructure': $this->GetXmlStructure();  break; 
            case 'GetFiles': $this->GetFiles();  break; 
            case 'UpdateCfdi': $this->UpdateCfdi(); break;
        }        
    }   
    /* Carga de CFDI's al sistema, método invocado desde EmailEngine.php.
     * 
     * @CFDIStack : Pila de documentos encontrados en el directorio temporal de 
     * descarga de CFDI's desde correo electrónico
     * @StackPath: Ruta de los archivos encontrados en la pila de CFDI's
     * @AliasPath: Ruta en el disco duto donde serán almacenados los documentos de la empresa 
     */
    function UploadCFDI($EnterpriseAlias, array $CFDIStack,  $AliasPath, $FromEmail)
    {        
        $ReadCfdi = new ReadCFDI();
        
        for($cont = 0; $cont < count($CFDIStack); $cont++)
        {
            $CfdiPath = $CFDIStack[$cont]['CfdiPath']; 
            $CfdiName = $CFDIStack[$cont]['CfdiName'];
            $Sender = $CFDIStack[$cont]['Sender'];

            $CfdiExtension = pathinfo($CFDIStack[$cont]['CfdiName'], PATHINFO_EXTENSION);
            $search = 0;
            
            if(strcasecmp($CfdiExtension, "xml")!=0)
                    continue;
            
            echo "\n\n Preparando para insertar a $CfdiName"; 
            
            $PdfName = pathinfo($CFDIStack[$cont]['CfdiName'], PATHINFO_FILENAME).".pdf";
            
            /* Se busca par Pdf */
            for($search = 0; $search < count($CFDIStack); $search++)
            {
                if(strcasecmp($PdfName, $CFDIStack[$search]['CfdiName'])==0)
                {
                    $PdfName = $CFDIStack[$search]['CfdiName']; 
                    echo "\n pdf = $PdfName";
                    unset($CFDIStack[$search]);
                    break 1;                     
                }                    
            }   
            
            unset($CFDIStack[$cont]);
            $CFDIStack = array_values($CFDIStack);  /* Reajuste de índices */
            $cont = 0;/* Reinicio de ciclo */
                                    
            if(!($ValidateCfdi = $ReadCfdi->ValidateCfdi($CfdiPath)))
            {
                    echo "\n CFDI inválido ".$CfdiName." remitente = $Sender";
                    continue;
            }
            
            $this->PrepareInsertion($AliasPath,$EnterpriseAlias, $CfdiPath, dirname($CfdiPath)."/$PdfName", $FromEmail);
                                    
        }
        
        return 1;
    }
    
    function PrepareInsertion($AliasPath, $EnterpriseAlias,$CfdiPath, $PdfPath, $FromEmail)
    {
        $ReadCfdi = new ReadCFDI();
        
        $CfdiType = $ReadCfdi->GetCfdiType($CfdiPath);

        if(strcasecmp($CfdiType, "0")==0)
        {
            echo "\n PrepareInsertion() Xml desconocido ".  basename($CfdiPath);
            return 0;
        }
        
        $CfdiDetail = $ReadCfdi->GetDetail($CfdiPath);
        if(!is_array($CfdiDetail))
            return 0;
        
        switch ($CfdiType)
        {
            /* Factura de Proveedores y Clientes */
            case 'Factura':                
                $InsertReceipt = $this->InsertReceiptCfdi($CfdiType, $AliasPath, $EnterpriseAlias, 'proveedor' , $CfdiDetail, $CfdiPath, $PdfPath, $FromEmail);
                return $InsertReceipt;
                
            case 'Nomina':
                $InsertReceipt = $this->InsertReceiptCfdi($CfdiType, $AliasPath, $EnterpriseAlias, 'nomina' , $CfdiDetail, $CfdiPath, $PdfPath, $FromEmail);
                return $InsertReceipt;
            default : echo "\n PrepareInsertion:: No se reconoció el tipo de comprobante ".  basename($CfdiPath)." "; return 0;
        }
    }
    
    
    /* Comprobantes cuyo Xml contiene los siguientes campos:
     *      Datos de Emisor 
     *      Datos de Receptor
     *      Detalle de Comprobante
     */
    private function InsertReceiptCfdi($CfdiType,$AliasPath, $EnterpriseAlias, $Repository, array $CfdiDetail, $CfdiPath, $PdfPath, $FromEmail = 0)
    {
        echo "\n Repositorio = $Repository";
        $DB = new DataBase();
        $Receipt = new Receipt();
        
        $SenderName = $CfdiDetail['emisor']['nombre'];
        $SenderRfc = $CfdiDetail['emisor']['rfc'];
        $ReceiverName = $CfdiDetail['receptor']['nombre'];
        $ReceiverRfc = $CfdiDetail['receptor']['rfc'];
        $SenderRfc = $CfdiDetail['emisor']['rfc'];
        $rfc = $CfdiDetail['receptor']['rfc'];
        $UuidMd5 = md5($CfdiDetail['timbreFiscalDigital']['UUID']);
        $CfdiName = basename($CfdiPath);       
        $Year = date("Y");     
               
        $FinalCfdiDirectory = "$AliasPath/CFDI/$Year/$rfc"; /* Ruta final del CFDI */        
            
        $FinalCfdiPath = "$FinalCfdiDirectory/$CfdiName";
//        echo "\n FinalCfdiPath = $FinalCfdiPath";
        
        if(!file_exists($FinalCfdiDirectory))
            if(!($mkdir = mkdir($FinalCfdiDirectory, 0777, true)))
            {
                echo "\n Error al crear el directorio destino del CFDI ".basename($CfdiPath);
                return 0;
            }                
        
        if(file_exists($FinalCfdiPath))
        {
            $FileExtension = pathinfo($FinalCfdiPath, PATHINFO_EXTENSION);
            $CfdiName = pathinfo($this->RenameFile($FinalCfdiPath,$CfdiPath), PATHINFO_FILENAME).".".$FileExtension;
            echo "\n Nuevo nombre $CfdiName";
        }
        
        $CfdiNameWithoutExtension = pathinfo($CfdiName,PATHINFO_FILENAME);
        $ValidationReceiptPath = "$FinalCfdiDirectory/".$CfdiNameWithoutExtension."SAT.xml";
                
        
        $FinalPdfPath = '';
        if(file_exists($PdfPath))
        {
            $PdfExtension = pathinfo($PdfPath,PATHINFO_EXTENSION);
            $FinalPdfPath = "$FinalCfdiDirectory/$CfdiNameWithoutExtension.$PdfExtension";
        }
                
        $CfdiDetail['CfdiPath'] = $FinalCfdiPath;  /* Ruta actual a donde fué descargado el CFDI desde el correo */
        
        if(file_exists($PdfPath))
            $CfdiDetail['PdfPath'] = $FinalPdfPath;    /* Ruta actual a donde fué descargado el PDF desde el correo */
        else
            $CfdiDetail['PdfPath'] = null;
        
        $CheckIfExist = "SELECT IdDetalle FROM detalle_$Repository WHERE MATCH (Full) AGAINST ('$UuidMd5' IN BOOLEAN MODE)";
        $CheckIfExistResult = $DB->ConsultaSelect($EnterpriseAlias, $CheckIfExist);
        if($CheckIfExistResult['Estado']!=1)
        {
            echo "\n Error al comprobar existencia previa del CFDI ".  basename($CfdiPath).". Detalles: ".$CheckIfExistResult['Estado'];
            return 0;
        }
        
        if(count($CheckIfExistResult['ArrayDatos'])>0)
        {
            echo "\n Ya existe el CFDI ".  basename($CfdiPath);
            return 0;
        }
        
//        echo "\n ValidationReceiptPath = $ValidationReceiptPath";
        
        $WebServiceSat = Receipt::ValidateWithWebServiceSAT($CfdiDetail['emisor']['rfc'], $CfdiDetail['receptor']['rfc'], $CfdiDetail['encabezado']['total'], $CfdiDetail['timbreFiscalDigital']['UUID']);
        if(!is_object($WebServiceSat))
        {
            echo "\n El SAT no pudo validar el CFDI ".basename($FinalCfdiDirectory);
            return 0;
        }
                
        $IdValidation = $Receipt->InsertValidationCfdi($EnterpriseAlias, $Repository,$WebServiceSat, $ValidationReceiptPath);
//        echo "\n IdValidation = $IdValidation";
        $WebServiceSat->save($ValidationReceiptPath);
        
        $IdEmisor = $this->InsertEmisor($EnterpriseAlias, $SenderRfc, $SenderName, $CfdiPath);
        if(!($IdEmisor>0))
            return 0;    
//        echo "\n IdEmisor = $IdEmisor";
        $IdReceptor = $this->InsertReceptor($EnterpriseAlias, $ReceiverRfc, $ReceiverName, $CfdiPath);
        if(!($IdReceptor)>0)
            return 0;
//        echo "\n IdReceptor = $IdReceptor";                
        
        $CfdiDetail['IdEmisor'] = $IdEmisor;
        $CfdiDetail['IdReceptor'] = $IdReceptor;
        $CfdiDetail['IdValidacion'] = $IdValidation;
                
        if($FromEmail == 1 and strcasecmp($CfdiType, "Factura")==0)
        {
            $IdDetail = $this->InsertDetalleComprobante ($EnterpriseAlias, 'proveedor', $CfdiDetail);
        }
        else if(strcasecmp($CfdiType, "Nomina")==0)
        {
            $IdDetail = $this->InsertDetalleNomina ($EnterpriseAlias, $CfdiDetail);            
        }
        else
        {
            echo "\n No se reconoce el tipo de documento a insertar InsertReceiptCfdi::";
            return 0;
        }
        
        if(!($IdDetail)>0)
        {
            echo "\n No se inserto el detalle del CFDI ".basename($CfdiPath);
            return 0;
        }
            
//        echo "\n Moviendo CFDI de $CfdiPath a $FinalCfdiPath";
        
        if(!($RenameCfdi = rename($CfdiPath, $FinalCfdiPath)))
        {
            echo "\n Error al mover el CFDI a su ruta destino $RenameCfdi";
        }
        
        if(file_exists($PdfPath))
        {
            echo "\n Moviendo Pdf de $PdfPath a $FinalPdfPath";
            if(!($RenamePdf = rename($PdfPath, $FinalPdfPath)))
            {
                echo "\n Error al mover el Pdf a su destino. $RenamePdf";
            }
        }
        
        echo  "\n IdDetail = $IdDetail";
    }        
    
    private function InsertDetalleNomina($EnterpriseAlias, array $CfdiDetail)
    {
        $DB = new DataBase();
        
        $IdEmisor = $CfdiDetail['IdEmisor'];
        $IdReceptor = $CfdiDetail['IdReceptor'];
        $IdValidation = $CfdiDetail['IdValidacion'];
        $UuidMd5 = md5($CfdiDetail['timbreFiscalDigital']['UUID']);
        $CfdiPath = $CfdiDetail['CfdiPath'];
        $PdfPath = $CfdiDetail['PdfPath'];
        $Full_ = " $UuidMd5 ";
        $Full = $this->string2url($this->GetFullText($CfdiDetail, $Full_));       
        $RfcReceptor = $CfdiDetail['receptor']['rfc'];
        $RfcEmisor = $CfdiDetail['emisor']['rfc'];
        $fecha = $CfdiDetail['encabezado']['fecha'];
        $subTotal = $CfdiDetail['encabezado']['subTotal'];
        $descuento = $CfdiDetail['encabezado']['descuento'];
        $total = $CfdiDetail['encabezado']['total'];
        
        if(!(is_numeric("$descuento")))
            $descuento = 0;
        if(!(is_numeric("$total")))
            $total = 0;
        if(!(is_numeric("$subTotal")))
            $subTotal = 0;                  
        
        $InsertDetail = "INSERT INTO detalle_nomina (IdEmisor, IdReceptor, id_validacion, RfcEmisor, RfcReceptor, fecha,
        subTotal, descuento, total,ruta_xml, ruta_pdf, Full)
        VALUES ($IdEmisor, $IdReceptor, $IdValidation, '$RfcEmisor', '$RfcReceptor' , '$fecha',
        $subTotal, $descuento, $total,'$CfdiPath', '$PdfPath', '$Full')";                
        
        $IdDetail = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertDetail);
        if(!($IdDetail>0))
        {
            echo "\n Error al insertar el detalle del documento ".basename($CfdiPath).". Detalles: $IdDetail";
            return 0;
        }
        
        return $IdDetail;
        
    }
    
    private function InsertDetalleComprobante($EnterpriseAlias, $Repository, array $CfdiDetail)
    {
        $DB = new DataBase();
        
        $IdEmisor = $CfdiDetail['IdEmisor'];
        $IdReceptor = $CfdiDetail['IdReceptor'];
        $IdValidation = $CfdiDetail['IdValidacion'];
        $UuidMd5 = md5($CfdiDetail['timbreFiscalDigital']['UUID']);
        $CfdiPath = $CfdiDetail['CfdiPath'];
        $PdfPath = $CfdiDetail['PdfPath'];
        $Full_ = " $UuidMd5 ";
        $Full = $this->string2url($this->GetFullText($CfdiDetail, $Full_));        
        echo "\n Full = $Full";
        $RfcReceptor = $CfdiDetail['receptor']['rfc'];
        $RfcEmisor = $CfdiDetail['emisor']['rfc'];
        $serie = $CfdiDetail['encabezado']['serie'];
        $folio = $CfdiDetail['encabezado']['folio'];
        $fecha = $CfdiDetail['encabezado']['fecha'];
        $formaDePago = $CfdiDetail['encabezado']['formaDePago'];
        $subTotal = $CfdiDetail['encabezado']['subTotal'];
        $descuento = $CfdiDetail['encabezado']['descuento'];
        $total = $CfdiDetail['encabezado']['total'];
        $metodoDePago = $CfdiDetail['encabezado']['metodoDePago'];
        $tipoCambio = $CfdiDetail['encabezado']['TipoCambio'];
        $moneda = $CfdiDetail['encabezado']['Moneda'];
        
        
        if(!(is_numeric("$descuento")))
            $descuento = 0;
        if(!(is_numeric("$total")))
            $total = 0;
        if(!(is_numeric("$subTotal")))
            $subTotal = 0;
        if(!(is_numeric("$tipoCambio")))
            $tipoCambio=0;                
        
        $InsertDetail = "INSERT INTO detalle_$Repository (IdEmisor, IdReceptor, id_validacion, RfcEmisor, RfcReceptor, serie, folio, fecha,
        formaDePago, subTotal, descuento, total, metodoDePago, TipoCambio, Moneda,ruta_xml, ruta_pdf, Full)
        VALUES ($IdEmisor, $IdReceptor, $IdValidation, '$RfcEmisor', '$RfcReceptor' , '$serie', '$folio', '$fecha',
        '$formaDePago', $subTotal, $descuento, $total, '$metodoDePago', '$tipoCambio', '$moneda','$CfdiPath', '$PdfPath', '$Full')";                
        
        $IdDetail = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertDetail);
        if(!($IdDetail>0))
        {
            echo "\n Error al insertar el detalle del documento ".basename($CfdiPath).". Detalles: $IdDetail";
            return 0;
        }
        
        return $IdDetail;
    }        
    
    private function InsertEmisor($EnterpriseAlias, $SenderRfc, $SenderName, $CfdiPath)
    {
        $DB = new DataBase();
        $IdEmisor = 0;
        $CheckExistSender = "SELECT IdEmisor FROM Emisor WHERE RFC COLLATE utf8_bin = '$SenderRfc'";
        $CheckExistSenderResult = $DB->ConsultaSelect($EnterpriseAlias, $CheckExistSender);
        if($CheckExistSenderResult['Estado']!=1)
        {
            echo "\n Error al insertar el emisor del documento ".basename($CfdiPath).". Error: ".$CheckExistSenderResult['Estado'];
            return 0;
        }
        if(count($CheckExistSenderResult['ArrayDatos'])==0)
        {
            $InsertEmisor = "INSERT INTO Emisor (RFC, Nombre) VALUES ('$SenderRfc', '$SenderName')";
            if(!($InsertEmisorResult = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertEmisor))>0)
            {
                echo "\n Error al insertar el emisor del documento ".  basename($CfdiPath).". Error: $InsertEmisorResult";
                return 0;
            }     
            $IdEmisor = $InsertEmisorResult;
        }
        else
        {
            $IdEmisor = $CheckExistSenderResult['ArrayDatos'][0]['IdEmisor'];
        }
        
        return $IdEmisor;
    }
    
    private function InsertReceptor($EnterpriseAlias, $ReceiverRfc, $ReceiverName, $CfdiPath)
    {
        $DB = new DataBase();
        
        $IdReceptor = 0;
        $CheckExistReceiver = "SELECT IdReceptor FROM Receptor WHERE RFC COLLATE utf8_bin = '$ReceiverRfc'";
        $CheckExistReceiverResult = $DB->ConsultaSelect($EnterpriseAlias, $CheckExistReceiver);
        if($CheckExistReceiverResult['Estado']!=1)
        {
            echo "\n Error al comprobar existencia del receptor en el documento ".basename($CfdiPath).". Error: ".$CheckExistReceiverResult['Estado'];
            return 0;
        }
        
        if(count($CheckExistReceiverResult['ArrayDatos'])==0)
        {
            $InsertReceiver = "INSERT INTO Receptor (RFC, Nombre) VALUES ('$ReceiverRfc', '$ReceiverName')";
            if(!($InsertReceiverResult = $DB->ConsultaInsertReturnId($EnterpriseAlias, $InsertReceiver))>0)
            {
                echo "\n Error al intentar insertar el Receptor del documento ".basename($CfdiPath).". Error: $InsertReceiverResult";
                return 0;
            }
        }
        else
        {
            $IdReceptor = $CheckExistReceiverResult['ArrayDatos'][0]['IdReceptor'];
        }
        
        return $IdReceptor;
    }
    
    private function UpdateCfdi()
    {
        $receipt = new Receipt();
        
        $content = filter_input(INPUT_POST, "content");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $PdfPath = filter_input(INPUT_POST, "PdfPath");
        $XmlPath = filter_input(INPUT_POST, "XmlPath");
        $IdCfdi = filter_input(INPUT_POST, "IdCfdi");
        $FileState = filter_input(INPUT_POST, "FileState");
        $key = 0;
        $TableName = '';
        
        if(strcasecmp($content, "provider")==0)
        {
            $TableName = "proveedor";
            $key = 3;
        }
        if(strcasecmp($content, "client")==0)
        {
            $TableName = "cliente";
            $key = 2;
        }
        if(strcasecmp($content, "payroll")==0)
        {
            $TableName = "nomina";
            $key = 1;
        }

        $PdfNewName = $_FILES['pdf']['name'];
        $PdfNewPath = $_FILES['pdf']['tmp_name'];
        $XmlNewName = $_FILES['xml']['name'];
        $XmlNewPath = $_FILES['xml']['tmp_name'];    
        
        $NewPdfName = pathinfo($PdfNewName, PATHINFO_FILENAME);
        $NewXmlName = pathinfo($XmlNewName, PATHINFO_FILENAME);   
        
        $NewPdfExtension = pathinfo($PdfNewName, PATHINFO_EXTENSION);    
        
        $OldXmlName = pathinfo($XmlPath, PATHINFO_FILENAME);        
        $OldExtensionXml = pathinfo($XmlPath, PATHINFO_EXTENSION);
        $oldSatReceiptName = pathinfo($XmlPath, PATHINFO_FILENAME);        
        
        $OldPdfName = pathinfo($PdfPath, PATHINFO_FILENAME);        
        $OldExtensionPdf = pathinfo($PdfPath, PATHINFO_EXTENSION);
        
        $OldPathSatReceipt = dirname($XmlPath)."/".$OldXmlName."SAT.".$OldExtensionXml;
        
        if($_FILES['xml']['error'] != UPLOAD_ERR_OK )
        {
            XML::XmlResponse ("Error", 0, "<p>".$_FILES['xml']['error'] .'</p>');
            return;
        }
        if($_FILES['xml']['pdf'] != UPLOAD_ERR_OK )
        {
            XML::XmlResponse ("Error", 0, "<p>".$_FILES['xml']['error'] .'</p>');
            return;
        }
        
        if(!file_exists($XmlPath))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> no existe el Xml a reemplazar</p>");
            return 0;
        }
        
        if(!file_exists($OldPathSatReceipt))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> no existe el comprobante de validación del Xml</p>");
            return 0;
        }
        
        /* Validación del mismo nombre del xml y el pdf */
        if(file_exists($PdfNewPath) and file_exists($XmlNewPath))
        {
            if(strcasecmp($NewPdfName, $NewXmlName)!=0)
            {
                XML::XmlResponse("Error", 0, "<p>El Pdf y el Xml deben tener el mismo nombre</p>");                
                return 0;
            }
        }
        
        $ReadXml = new Read_factura_cliente();
        $Validation = new webservice_sat();
        
        $ValidationXml = $ReadXml->validacion_estructura($XmlPath);
        if($ValidationXml!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> el xml es inválido</p>");
            return 0;
        }
        
        $XmlDetail = $ReadXml->GetDetail($XmlNewPath);
        
        $ValidateXml = $Validation->valida_cfdi($XmlDetail['emisor']['rfc'], $XmlDetail['receptor']['rfc'], $XmlDetail['encabezado']['total'], $XmlDetail['timbreFiscalDigital']['UUID']);
        if(!is_object($ValidateXml))
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> el xml es inválido</p>");
            return 0;
        }                
        
        /* Se crea el directorio donde se almacenan las actualizaciones de un CFDI */
        if(!file_exists(dirname($XmlPath) ."/copias"))
        {
            mkdir(dirname($XmlPath)."/copias",0777,true);
        }
        
        /* Se mueve el antiguo xml y se sube el nuevo reemplazando la ruta del antiguo xml */
        $NewRouteDestinationXml = dirname($XmlPath)."/copias/".  basename($XmlPath);

        if(file_exists($NewRouteDestinationXml))
        {
//                echo "ya existe el xml en la ruta destino<br><br>";
                $OldXmlName = pathinfo($this->RenameFile(dirname($NewRouteDestinationXml),basename($NewRouteDestinationXml)), PATHINFO_FILENAME);
//                echo "<p>Nuevo nombre $NewName</p>";
                $NewRouteDestinationXml = dirname($NewRouteDestinationXml)."/$OldXmlName.$OldExtensionXml";
        }
        
        if(!rename($XmlPath, $NewRouteDestinationXml))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b>al trasladar el xml antiguo al histórico de copias</p>");
                return 0;
        }
        
        if(!move_uploaded_file($XmlNewPath, $XmlPath))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b>al trasladar el nuevo Xml a su ruta correspondiente</p>");
                return 0;
        }
        
        /* Se mueve el comprobante SAT al directorio de copias */                
        $NewPathSatReceipt = dirname($NewRouteDestinationXml)."/".$OldXmlName."SAT.xml";

        if(!rename($OldPathSatReceipt,$NewPathSatReceipt ))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b>al trasladar el comprobante de validación antiguo al histórico de copias</p>");
                return 0;
        }        
        
        $NewSatReceipt = dirname($XmlPath)."/".$oldSatReceiptName."SAT.$OldExtensionXml";

        $ValidateXml->save($NewSatReceipt);
        
        /* Sí existe un PDF este se mueve a copias */
        $NewRouteDestinationPdf = dirname($XmlPath)."/copias";        
        if(file_exists($PdfPath))
        {
            $NewPdfPath = $NewRouteDestinationPdf."/". $OldXmlName ."." .$OldExtensionPdf;
            if(!rename($PdfPath, $NewPdfPath))
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b>al trasladar el xml antiguo al histórico de copias</p>");
                    return 0;
            }
        }
                    
        /* Sí se adjunta un nuevo pdf se introduce en la ruta del XML */
        if(file_exists($PdfNewPath))
        {
            $NewPdfPath = dirname($XmlPath)."/".$OldPdfName.".$OldExtensionPdf";
            if(!move_uploaded_file($PdfNewPath, $NewPdfPath))
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b>al trasladar el nuevo PDF a su ruta correspondiente</p>");
                    return 0;
            }                       
        }               
        $NewIdReceipt = $receipt->InsertValidationCfdi($TableName, $ValidateXml, $NewPathSatReceipt); 
        
        $historical = new Historical();
        $NewIdHistorical = $historical->InsertHistorical($TableName, $IdUser, $IdCfdi, $NewIdReceipt, $NewRouteDestinationXml, $NewRouteDestinationPdf."/". $OldXmlName ."." .$OldExtensionPdf, $FileState);
        
        if($NewIdHistorical==0)
            return 0;
        
        if($this->UpdateMetadatas($TableName, $IdCfdi, $XmlDetail, $XmlPath, $PdfPath)!=1)
            return 0;
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Update');
        $doc->appendChild($root);       
        $mensaje_=$doc->createElement('Mensaje','<p>Datos actualizados con éxito</p>');
        $root->appendChild($mensaje_);
        $Fecha = $doc->createElement("Fecha", $XmlDetail['encabezado']['fecha']);
        $root->appendChild($Fecha);
        $Folio = $doc->createElement("Folio", $XmlDetail['encabezado']['folio']);
        $root->appendChild($Folio);
        $Subtotal = $doc->createElement("subTotal", $XmlDetail['encabezado']['subTotal']);
        $root->appendChild($Subtotal);
        $Total = $doc->createElement("Total", $XmlDetail['encabezado']['total']);
        $root->appendChild($Total);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
           
//        $log = new Log();        
//        $log->write_line(8,$IdUser,$IdCfdi,$key);/* Registro Log */
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
    
    private function UpdateMetadatas($TableName, $IdCfdi, $Array, $XmlPath, $PdfPath)
    {
        $DB = new DataBase();
        $Full = $this->GetFullText($Array, '');        
        $Update = '';
        $serie = $Array['encabezado']['serie'];
        $folio = $Array['encabezado']['folio'];
        $fecha = $Array['encabezado']['fecha'];
        $formaDePago = $Array['encabezado']['formaDePago'];
        $subTotal = $Array['encabezado']['subTotal'];
        $descuento = $Array['encabezado']['descuento'];
        $total = $Array['encabezado']['total'];
        $metodoDePago = $Array['encabezado']['metodoDePago'];
        $tipoDeComprobante = $Array['encabezado']['tipoDeComprobante'];
        $tipoCambio = $Array['encabezado']['TipoCambio'];
        $moneda = $Array['encabezado']['Moneda'];
        
//        echo ($subTotal);
//        return;
        
        if(!(is_numeric("$descuento")))
            $descuento = 0;
        if(!(is_numeric("$total")))
            $total = 0;
        if(!(is_numeric("$subTotal")))
            $subTotal = 0;
        if(!(is_numeric("$tipoCambio")))
            $tipoCambio=0;
        
        if(strcasecmp($TableName, 'proveedor')==0 or strcasecmp($TableName, 'cliente')==0)
            $Update = "UPDATE detalle_$TableName SET "
                . "serie = '$serie', folio = '$folio', fecha = '$fecha', subTotal = $subTotal,"
                . "descuento = $descuento, total = $total, metodoDePago = '$metodoDePago', tipoDeComprobante = '$tipoDeComprobante',"
                . "TipoCambio =$tipoCambio, Moneda='$moneda', ruta_pdf = '$PdfPath', ruta_xml ='$XmlPath', tipo_archivo='copia', Full = '$Full' "  
                . " WHERE Id_detalle = $IdCfdi";
        
        if(strcasecmp($TableName, 'nomina')==0)
            $Update = "UPDATE detalle_$TableName SET "
                . "serie = '$serie', folio = '$folio', fecha = '$fecha', formapago = '$formaDePago', subTotal = $subTotal,"
                . "descuento = $descuento, total = $total, metodoDePago = '$metodoDePago', tipoDeComprobante = '$tipoDeComprobante',"
                . "TipoCambio =$tipoCambio, Moneda='$moneda', ruta_pdf = '$PdfPath', ruta_xml ='$XmlPath', tipo_archivo='copia', Full = '$Full' "  
                . " WHERE Id_detalle = $IdCfdi";
        
        
        if(($result = $DB->ConsultaQuery("CFDI", $Update))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar los datos del nuevo CFDI</p><br>Detalles:<br><br>$result");
            return 0;
        }
        
        return 1;
    }
    
    /* @array: Array asociativo con toda la estructura de campos de un CFDI
     * @Full: Variable de tipo Full = ''; 
     * @return : Regresa el parámetro Full con la cadena de campos del array */
    function GetFullText($array, $Full)
    {
        foreach ($array as  $value)
        {
            if(is_array($value))
            {
                $Full = $this->GetFullText($value,$Full);
            }
            else
                $Full.= $value."  ";
        }    
    
        return $Full;
    }
    
    function string2url($String)
    {
        $RegularExpression = "~[^a-zA-Z0-9\_\*\$\#\@\!\¡\?\¿\=\<\>\.\,\;\:\-\"\°\+\%\\\/\sáéíóúñÁÉÍÓÚÑ]~";
        $cadena = preg_replace($RegularExpression,' ',$String);
        
        return $cadena;
    }
    
    private function GetRelativePath($Path)
    {
        $directorio = explode("/", $Path); 
        $ruta_nueva_pdf='';
        for ($cont=0;$cont<count($directorio);$cont++)/* desde el nodo 3 para quitar /volume1/web/ */
        {
            if($cont+1!=(count($directorio)))
            {
                $ruta_nueva_pdf.=$directorio[$cont].'/';        
            }                               
        }
        
        $ruta=$ruta_nueva_pdf;             
        return $ruta;
    }
    
    private function GetFiles()
    {
        $DB = new DataBase();
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $IdUserName = filter_input(INPUT_POST, "UserName");
        $content = filter_input(INPUT_POST, "content");
        $IdReceiver = filter_input(INPUT_POST, "IdReceiver");
        $StartDate = filter_input(INPUT_POST, "StartDate");
        $EndDate = filter_input(INPUT_POST, "EndDate");
        $IdTransmiter = filter_input(INPUT_POST, "IdTransmiter");
        $SearchWord = trim(filter_input(INPUT_POST, "SearchWord"),' ');
        $WhereTransmiter = '';
        $Match = '';
        $Key = 0;
        $TableName = '';
        $q = '';
        
        if($IdTransmiter>0)
            $WhereTransmiter = "AND det.id_emisor = $IdTransmiter";
        
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
        if(strlen($SearchWord)>0)
            $Match = " AND MATCH (det.Full) AGAINST ('$SearchWord' IN BOOLEAN MODE) ";
        
        if(strcasecmp($content, 'Provider')==0 or strcasecmp($content, 'Client')==0)
        {
            if($StartDate=="" and $EndDate=="")
                $q="SELECT det.id_detalle, det.fecha, det.folio, det.subTotal, det.descuento, det.total,ruta_xml, det.ruta_pdf, det.id_validacion, det.tipo_archivo, val.ruta_acuse FROM detalle_$TableName det inner join validacion_$TableName val on det.id_validacion=val.id_validacion WHERE det.id_receptor=$IdReceiver $WhereTransmiter $Match";
            if($StartDate!="" and $EndDate!="")
                $q="SELECT det.id_detalle, det.fecha, det.folio, det.subTotal, det.descuento, det.total,ruta_xml, det.ruta_pdf, det.id_validacion, det.tipo_archivo, val.ruta_acuse FROM detalle_$TableName det inner join validacion_$TableName val on det.id_validacion=val.id_validacion WHERE id_receptor=$IdReceiver $WhereTransmiter AND (det.fecha BETWEEN '$StartDate' AND '$EndDate') $Match";
            if($StartDate!="" and $EndDate=="")
                $q="SELECT det.id_detalle, det.fecha, det.folio, det.subTotal, det.descuento, det.total,ruta_xml, det.ruta_pdf, det.id_validacion, det.tipo_archivo, val.ruta_acuse FROM detalle_$TableName det inner join validacion_$TableName val on det.id_validacion=val.id_validacion WHERE det.fecha>='$StartDate' AND id_receptor=$IdReceiver $WhereTransmiter $Match";
            if($StartDate=="" and $EndDate!="")
                $q="SELECT det.id_detalle, det.fecha, det.folio, det.subTotal, det.descuento, det.total,ruta_xml, det.ruta_pdf, det.id_validacion, det.tipo_archivo, val.ruta_acuse FROM detalle_$TableName det inner join validacion_$TableName val on det.id_validacion=val.id_validacion WHERE det.fecha<='$EndDate' AND id_receptor=$IdReceiver $WhereTransmiter $Match";
        }
        
        
        if(strcasecmp($content, 'PayRoll')==0)
        {
            if($StartDate=="" and $EndDate=="")
                $q="SELECT det.id_detalle, det.fecha, det.folio, det.subTotal, det.descuento, det.total,ruta_xml, det.ruta_pdf, det.id_validacion, det.tipo_archivo, val.ruta_acuse FROM detalle_cliente det inner join validacion_cliente val on det.id_validacion=val.id_validacion WHERE det.id_receptor=$IdReceiver and det.id_emisor=$IdTransmiter";
            if($StartDate!="" and $EndDate!="")
                $q="SELECT id_detalle,FechaPago,SalarioBaseCotApor,SalarioDiarioIntegrado,xml_ruta,pdf_ruta FROM detalle_nomina WHERE id_receptor=$IdReceiver AND id_emisor=$IdTransmiter AND (FechaPago BETWEEN '$StartDate' AND '$EndDate')";
            if($StartDate!="" and $EndDate=="")
                $q="SELECT id_detalle,FechaPago,SalarioBaseCotApor,SalarioDiarioIntegrado,xml_ruta,pdf_ruta FROM detalle_nomina WHERE FechaPago>='$StartDate' AND id_receptor=$IdReceiver AND id_emisor=$IdTransmiter";
            if($StartDate=="" and $EndDate!="")
                $q="SELECT id_detalle,FechaPago,SalarioBaseCotApor,SalarioDiarioIntegrado,xml_ruta,pdf_ruta FROM detalle_nomina WHERE FechaPago<='$EndDate' AND id_receptor=$IdReceiver AND id_emisor=$IdTransmiter";
        }
        $ResultGetFiles = $DB->ConsultaSelect("CFDI", $q);
        if($ResultGetFiles['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al intentar recuperar los CFDI's</p><br>Detalles:<br><br>".$ResultGetFiles['Estado']);
            return 0;
        }
        
        $FilesArray = $ResultGetFiles['ArrayDatos'];
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Files');

        for($cont = 0; $cont < count($FilesArray); $cont++)
        {
            $Cfdi = $doc->createElement("File");
            $IdCfdi = $doc->createElement("IdCfdi", $FilesArray[$cont]['id_detalle']);
            $Cfdi->appendChild($IdCfdi);
            $Fecha = $doc->createElement("Date", $FilesArray[$cont]['fecha']);
            $Cfdi->appendChild($Fecha);
            $folio = $doc->createElement("Folio", $FilesArray[$cont]['folio']);
            $Cfdi->appendChild($folio);
            $CfdiSubtotal = $doc->createElement("subTotal", $FilesArray[$cont]['subTotal']);
            $Cfdi->appendChild($CfdiSubtotal);
            $CfdiTotal = $doc->createElement("Total", $FilesArray[$cont]['total']);
            $Cfdi->appendChild($CfdiTotal);
            $CfdiRutaXml = $doc->createElement("XmlPath", $FilesArray[$cont]['ruta_xml']);
            $Cfdi->appendChild($CfdiRutaXml);
            $CfdiPdf = $doc->createElement("PdfPath", $FilesArray[$cont]['ruta_pdf']);
            $Cfdi->appendChild($CfdiPdf);
            $CfdiState = $doc->createElement("StateCfdi", $FilesArray[$cont]['tipo_archivo']);
            $Cfdi->appendChild($CfdiState);
            $CfdiIdValidation = $doc->createElement("IdValidationReceipt", $FilesArray[$cont]['id_validacion']);
            $Cfdi->appendChild($CfdiIdValidation);
            $CfdiReceiptPath = $doc->createElement("ReceiptValidationPath", $FilesArray[$cont]['ruta_acuse']);
            $Cfdi->appendChild($CfdiReceiptPath);
            $root->appendChild($Cfdi);
        }
        
        $doc->appendChild($root);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function GetXmlStructure()
    {
        
        $XmlPath = filter_input(INPUT_POST, "XmlPath");
        $content = filter_input(INPUT_POST, "content");
        $IdLogin = filter_input(INPUT_POST, "IdLogin");
        
        if (file_exists($XmlPath)) 
        {           
            $xml_contents = file_get_contents($XmlPath);
            $xml_ = preg_replace("/(<\/?)(\w+):([^>]*>)/", "$1$2$3", $xml_contents);
            $xml = simplexml_load_string($xml_);

            header('Content-Type: text/xml');
            echo $xml->saveXML();          
            
            $log=new Log();     
            if($content == 'nomina')
                $clave_log=1;
            if($content == 'cliente')
                $clave_log=2;
            if($content == 'proveedor')
                $clave_log=3;
            
//            $log->write_line(18, $IdLogin, 0 , $clave_log);/* Registro Log */ 
        }
        else
            XML::XMLReponse ("Error", 0, "<p><b>Error</b>, no existe el documento solicitado.</p>");
    }
    
}

$CFDI = new CFDI();