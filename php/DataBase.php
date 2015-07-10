<?php

/*
 * Clase que administra la Base de Datos
 */

/**
 *
 * @author daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once "XML.php";
require_once 'Encrypter.php';
class DataBase {
    
    public function __construct()
    {        
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'CreateInstanciaCSDOCS': $this->CreateInstanciaCSDOCS(); break;
            case 'CreateCfdiDataBase': $this->CreateCfdiDb(); break;
        }
    }
    
    public function Conexion($EnterpriseAlias)
    {        
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        $RoutFile.="/Config/$EnterpriseAlias/BD.ini";

        if(!file_exists($RoutFile))
        {
            $RoutFile = dirname(getcwd());
            $RoutFile.="/Config/$EnterpriseAlias/BD.ini";            
            if(!file_exists($RoutFile))
            {
                echo "<p>No existe el archivo de Conexión Solicitado en <p>DataBase</p>.</p>"; 
                return 0;            
            }
        }
        
        $Conexion = parse_ini_file ($RoutFile,true);        
        $User_= $Conexion['User'];
        $Password_= $Conexion['Password'];
        $Port_ = $Conexion['Port'];
        $Host_ = $Conexion['Host'];
        $Schema_ = $Conexion['Schema'];
        
        $User = Encrypter::decrypt($User_);
        $Password = Encrypter::decrypt($Password_);
        $Port = Encrypter::decrypt($Port_);
        $Host = Encrypter::decrypt($Host_);
        $Schema = Encrypter::decrypt($Schema_);                

        error_reporting(E_ALL ^ E_DEPRECATED);
        if(!($enlace =  mysqli_connect("$Host:$Port", $User, $Password,$Schema)))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }
        mysqli_set_charset($enlace, 'utf8');
        return $enlace;
    }
    
    
    private function ManagerConnection($DataBaseName)
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        $RoutFile.="/Config/Manager/BD.ini";
        
        if(!file_exists($RoutFile))
        {
            echo "<p>No existe el archivo de Conexión.</p>"; 
            return 0;            
        }
        
        $Conexion = parse_ini_file ($RoutFile,true);        
        $User_= $Conexion['User'];
        $Password_= $Conexion['Password'];
        $Port_ = $Conexion['Port'];
        $Host_ = $Conexion['Host'];
        $Schema_ = $Conexion['Schema'];
        
        $User = Encrypter::decrypt($User_);
        $Password = Encrypter::decrypt($Password_);
        $Port = Encrypter::decrypt($Port_);
        $Host = Encrypter::decrypt($Host_);
        $Schema = Encrypter::decrypt($Schema_);                
        
        error_reporting(E_ALL ^ E_DEPRECATED);
        if(!($enlace =  mysqli_connect("$Host:$Port", $User, $Password,$DataBaseName)))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }
//        mysqli_set_charset('utf8');
        return $enlace;
    }   
    
    //drop USER 'Manager'@'localhost'
    
    /***************************************************************************
     * 
     * Se crea una Instancia llamada CS-DOCS la cual contiene una tabla llamada Instancias
     * Esta tabla se utiliza para llevar un registro de instancias creadas por el administrador.
     * 
     ***************************************************************************/
    function CreateInstanciaCSDOCS()
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");   
                
        if(strlen($EnterpriseAlias)==0)
            return;        
        
                
        if(!file_exists("$RoutFile/Config/Manager/BD.ini"))
            $this->CreateDataBaseFile ("Manager");
        
        if(strcasecmp($EnterpriseAlias, "Manager")==0)
        {
            $ResultCreateUser = $this->CreateMySqlUser("CSDOCS_CFDI","Manager", "Admcs1234567");
            if($ResultCreateUser==0)
                return;
        }
        
        $FileConnection = $this->GetConnectionFile("root");
        if(!is_array($FileConnection))
            return 0;
        
        error_reporting(E_ALL ^ E_DEPRECATED);
        
        if(!($enlace =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'])))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }       
                             
        $CreateCsDocs = "CREATE DATABASE IF NOT EXISTS `CSDOCS_CFDI` /*!40100 DEFAULT CHARACTER SET utf8 */";
        
        $CreateDataBase = mysqli_query($enlace,$CreateCsDocs);
                        
        if($CreateDataBase==FALSE)
        {
            mysqli_close($enlace);
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la instancia CSDocs ".mysqli_error($enlace)."</p>");            
            return 0;
        }   
        
        mysqli_close($enlace);
        
        if(!($enlace =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'], $FileConnection['Schema'])))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }    
        
        $CreateVolumesTable = "CREATE TABLE IF NOT EXISTS Volumes ("
                . "IdVolume INT AUTO_INCREMENT,"
                . "VolumeName VARCHAR(50) NOT NULL,"
                . "Used FLOAT NOT NULL,"
                . "Available FLOAT NOT NULL,"
                . "TotalMemory FLOAT NOT NULL,"
                . "PRIMARY KEY (IdVolume)"
                . ")ENGINE=InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($ResultVolumesTable = mysqli_query($enlace, $CreateVolumesTable))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear control de volúmenes</p><br>Detalles:<br><br>".mysqli_error($enlace));
            mysqli_close($enlace);
            return 0;
        }
            
       $CreateInstances = "CREATE TABLE IF NOT EXISTS `Enterprises` (IdEnterprise INT NOT NULL AUTO_INCREMENT,"
               . "EnterpriseName VARCHAR(100) NOT NULL,"
               . "Alias VARCHAR(50) NOT NULL,"
               . "RFC VARCHAR(50) NOT NULL,"
               . "Password VARCHAR(20) NOT NULL,"
               . "PublicFile TEXT,"
               . "PrivateFile TEXT,"
               . "DischargeDate DATE NOT NULL,"
               . "IdVolume INT NOT NULL,"
               . "UsedMemory FLOAT NOT NULL DEFAULT '0',"
               . "AvailableMemory FLOAT NOT NULL DEFAULT '0',"
               . "TotalMemory FLOAT NOT NULL,"
               . "PRIMARY KEY (`IdEnterprise`)) ENGINE=InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
       
       if(($ResultCreateInstances = mysqli_query($enlace, $CreateInstances))==FALSE)
        {           
           XML::XmlResponse("Error", 0,"<p><b>Error</b> al crear la Tabla Instancias en CSDocs. </p><br>Detalles:<br><br>".mysqli_error($enlace));
           mysqli_close($enlace);
            return 0;
        }               
                   
       $CreateUsers="CREATE TABLE IF NOT EXISTS `Users` (IdUser INT(11) NOT NULL AUTO_INCREMENT,"
               . "IdEnterprise INT NOT NULL,"
               . "UserName VARCHAR(50) NOT NULL,"
               . "Password VARCHAR(50) NOT NULL,"
               . "PRIMARY KEY (`IdUser`)) ENGINE=InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
       
       if(($ResultCreateUsers = mysqli_query($enlace, $CreateUsers))==FALSE)
        {
            mysqli_close($enlace);
            XML::XmlResponse("Error", 0,"<p><b>Error</b> al crear la Tabla Usuarios en CSDocs </p><br>Detalles:<br><br>".mysqli_error($enlace));
            return 0;
        }
                       
        mysqli_close($enlace);
        
        $ExistRoot = $this->ExistRootUser();
        if($ExistRoot==0)
        {
            $this->InsertRootUser();
        }
        else if($ExistRoot!=1)
        {
            echo $ExistRoot;
            return;
        }
                   
        XML::XmlResponse("InsertRoot", 1, "");             
    }  
    
    private function GetConnectionFile($DataBaseName)
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        
        $RoutFile.="/Config/$DataBaseName/BD.ini";

        if(!file_exists($RoutFile))
        {
            echo "<p>No existe el archivo de Conexión $DataBaseName</p>"; 
            return 0;            
        }
        
        $Conexion = parse_ini_file ($RoutFile,true);   
        
        $User_= $Conexion['User'];
        $Password_= $Conexion['Password'];
        $Port_ = $Conexion['Port'];
        $Host_ = $Conexion['Host'];
        $Schema_ = $Conexion['Schema'];
        
        $User = Encrypter::decrypt($User_);
        $Password = Encrypter::decrypt($Password_);
        $Port = Encrypter::decrypt($Port_);
        $Host = Encrypter::decrypt($Host_);
        $Schema = Encrypter::decrypt($Schema_);                
        
        return array("Host"=>$Host, "Port"=>$Port,"User"=>$User, "Password"=>$Password, "Schema"=>$Schema);
    }
    
    /* drop USER 'Manager'@'localhost' */
    private function CreateMySqlUser($DataBaseName,$UserName, $UserPassword)
    {
        $FileConnection = $this->GetConnectionFile("root");
        if(!is_array($FileConnection))
            return 0;
        
        error_reporting(E_ALL ^ E_DEPRECATED);
        
        if(!($enlace =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'], 'mysql')))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }
        
        $SelecUser = "SELECT User FROM user WHERE User COLLATE utf8_bin = '$UserName'";
                
        $select = mysqli_query($enlace,$SelecUser);
        if(!$select)
        {
            echo mysqli_error($enlace); 
            return 0;
        }
        else
            while(($ResultSelect[] = mysqli_fetch_assoc($select)) || array_pop($ResultSelect));       
        
        mysqli_free_result($select);           
        
        
        if(count($ResultSelect)>0)
        {
            mysqli_close($enlace);
             return 1;
        }

        $InsertUser = "CREATE USER '$UserName'@'localhost' IDENTIFIED BY '$UserPassword'";
                
        $ResultInsert = mysqli_query($enlace, $InsertUser);
        
        if(!$ResultInsert)
        {
            echo $estado= mysqli_error($enlace); 
            return 0;
        }
//        else
//            while(($ResultSelect[] = mysqli_fetch_assoc($select)) || array_pop($ResultSelect));        
        
        if(strcasecmp($UserName, "Manager")==0)
        {
            $PermissionAll = "GRANT ALL PRIVILEGES ON *.* TO '$UserName'@'localhost'";
             mysqli_query($enlace, $PermissionAll);     
        }
        else
        {
            $PermissionDelete = "GRANT DELETE ON $DataBaseName.* TO '$UserName'@'localhost'";
            mysqli_query($enlace, $PermissionDelete);       
            $PermissionInsert = "GRANT INSERT ON $DataBaseName.* TO '$UserName'@'localhost'";
            mysqli_query($enlace, $PermissionInsert);
            $PermissionSelect = "GRANT SELECT ON $DataBaseName.* TO '$UserName'@'localhost'";
            mysqli_query($enlace, $PermissionSelect);
            $PermissionUpdate = "GRANT UPDATE ON $DataBaseName.* TO '$UserName'@'localhost'";
            mysqli_query($enlace, $PermissionUpdate);
        }
        
        mysqli_close($enlace);
        
        return 1;                      
    }
        
    public function CreateEnterpriseInstance($DataBaseName)
    {                        
        if(($ResultCreateDBFile = $this->CreateDataBaseFile($DataBaseName))==0)
            return 0;
        
        $FileConnection = $this->GetConnectionFile("root");
        if(!is_array($FileConnection))
            return 0;
        
        error_reporting(E_ALL ^ E_DEPRECATED);
                
        if(!($link =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'])))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }       
        
        $CreateDataBase = "CREATE DATABASE IF NOT EXISTS `$DataBaseName` /*!40100 DEFAULT CHARACTER SET utf8 */;";
        if(($ResultCreateDataBase = mysqli_query($link, $CreateDataBase))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la Instancia <b>$DataBaseName</b></p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
        
        mysqli_close($link);
        
        if(!($link =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'], $DataBaseName)))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return false;
        }  
        
        if($this->CreateMySqlUser($DataBaseName, $DataBaseName, "12345")==0)
            $this->DeleteDataBase($DataBaseName);
        
        $CreateEmisor = "CREATE TABLE IF NOT EXISTS Emisor("
                . "IdEmisor INT NOT NULL AUTO_INCREMENT,"
                . "RFC VARCHAR(50) NOT NULL,"
                . "Nombre VARCHAR(150) NOT NULL,"
                . "PRIMARY KEY (IdEmisor, RFC)"
                . ")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($CreateEmisorResult = mysqli_query($link, $CreateEmisor))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear el control de Emisores </p><br>Detalles:<br><br>".  mysqli_error($link));            
            mysqli_close($link);
            return 0;
        }
        
        $CreateReceptor = "CREATE TABLE IF NOT EXISTS Receptor("
                . "IdReceptor INT NOT NULL AUTO_INCREMENT,"
                . "RFC VARCHAR(50) NOT NULL,"
                . "Nombre VARCHAR(150) NOT NULL,"
                . "PRIMARY KEY (IdReceptor, RFC)"
                . ")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($CreateReceptorResult = mysqli_query($link, $CreateReceptor))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear el control de Receptores </p><br>Detalles:<br><br>".  mysqli_error($link));            
            mysqli_close($link);
            return 0;
        }
                        
            // SE CREA LA TABLA DETALLE DE RECIBO DE NOMINA
            
        $DetalleNomina = "CREATE TABLE IF NOT EXISTS `detalle_nomina` (
        `IdDetalle` int(11) NOT NULL AUTO_INCREMENT,
        `IdEmisor` int(11) NOT NULL,
        `IdReceptor` int(11) NOT NULL,
        `id_validacion` int(11) NOT NULL,
         RfcEmisor VARCHAR(50) NOT NULL,
         RfcReceptor VARCHAR(50) NOT NULL,
        `curp` varchar(60) NOT NULL,
        `NumEmpleado` int(11) DEFAULT NULL,
        `NumSegSocial` varchar(250) DEFAULT NULL,
        `fecha` date DEFAULT NULL,
        `subTotal` double DEFAULT NULL,
        `descuento` double DEFAULT NULL,
        `total` double DEFAULT NULL,
        `ruta_xml` TEXT DEFAULT NULL,
        `ruta_pdf` TEXT DEFAULT NULL,
        `tipo_archivo` varchar(45) DEFAULT 'original',
        `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
         Full TEXT, 
         PRIMARY KEY (`IdDetalle`,`curp`,`id_validacion`),
         FULLTEXT (Full),
         KEY `FK1` (`IdEmisor`),
         KEY `FK2_idx` (`IdReceptor`),
         CONSTRAINT `FK1` FOREIGN KEY (`IdEmisor`) REFERENCES `Emisor` (`IdEmisor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
         CONSTRAINT `FK2` FOREIGN KEY (`IdReceptor`) REFERENCES `receptor_recibo_nomina` (`IdReceptor`) ON DELETE NO ACTION ON UPDATE NO ACTION
         ) ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1
        ";
        
        if(($ResultDetalleNomina = mysqli_query($link, $DetalleNomina))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la Detalle Recibo de Nómina </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }

            /******************** Histórico Nomina*********************/
        $HistorialNomina = "CREATE TABLE IF NOT EXISTS `historial_nomina` (
        `id_historial` int(11) NOT NULL AUTO_INCREMENT,
        `id_validacion` int(11) NOT NULL,
        `id_detalle` int(11) NOT NULL,
        `id_usuario` int(11) DEFAULT NULL,
        `fecha_hora` datetime NOT NULL,
        `ruta_xml` varchar(250) NOT NULL,
        `ruta_pdf` varchar(250) DEFAULT NULL,
        `tipo_archivo` varchar(45) NOT NULL,
        PRIMARY KEY (`id_historial`,`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='tipo_archivo (original o copia)'";
        
        if(($ResultHistorialNomina = mysqli_query($link, $HistorialNomina))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la Historial Recibo de Nómina </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
            
        $ValidacionNomina = "CREATE TABLE IF NOT EXISTS `validacion_nomina` (
        `id_validacion` int(11) NOT NULL AUTO_INCREMENT,
        `FechaHora_envio` datetime NOT NULL,
        `FechaHora_respuesta` datetime NOT NULL,
        `emisor_rfc` varchar(100) NOT NULL,
        `receptor_rfc` varchar(100) NOT NULL,                
        `total_factura` double NOT NULL,
        `uuid` varchar(100) NOT NULL,
        `codigo_estatus` varchar(100) NOT NULL,
        `estado` varchar(100) NOT NULL,
        `md5` varchar(100) NOT NULL,
        `web_service` varchar(250) NOT NULL,
        `ruta_acuse` varchar(250) NOT NULL,
        PRIMARY KEY (`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
        if(($ResultValidacionNomina = mysqli_query($link, $ValidacionNomina))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la Validación Recibo de Nómina </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
                                                 
                /*      Validación  CFDI    */                
                
        $ValidacionProveedor = "CREATE TABLE IF NOT EXISTS `validacion_proveedor` (
        `id_validacion` int(11) NOT NULL AUTO_INCREMENT,
        `FechaHora_envio` datetime NOT NULL,
        `FechaHora_respuesta` datetime NOT NULL,
        `emisor_rfc` varchar(100) NOT NULL,
        `receptor_rfc` varchar(100) NOT NULL,                
        `total_factura` double NOT NULL,
        `uuid` varchar(100) NOT NULL,
        `codigo_estatus` varchar(100) NOT NULL,
        `estado` varchar(100) NOT NULL,
        `md5` varchar(100) NOT NULL,
        `web_service` varchar(250) NOT NULL,
        `ruta_acuse` varchar(250) NOT NULL,
        PRIMARY KEY (`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
        if(($ResultValidacionProveedor = mysqli_query($link, $ValidacionProveedor))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear la Validación Proveedor </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
        
            /* Tabla detalle factura cliente */
        $DetalleCliente = "CREATE TABLE IF NOT EXISTS `detalle_cliente` (
        `IdDetalle` int(11) NOT NULL AUTO_INCREMENT,
        `IdEmisor` int(11) NOT NULL DEFAULT '0',
        `IdReceptor` int(11) NOT NULL DEFAULT '0',
        `id_validacion` int(11) NOT NULL,
        `RfcEmisor` varchar(70) NOT NULL,
         RfcReceptor VARCHAR(50) NOT NULL,
        `serie` varchar(45) DEFAULT NULL,
        `folio` varchar(45) DEFAULT NULL,
        `fecha` date DEFAULT NULL,
        `formaDePago` varchar(200) DEFAULT NULL,
        `subTotal` double DEFAULT NULL,
        `descuento` double DEFAULT NULL,
        `total` double DEFAULT NULL,
        `metodoDePago` varchar(45) DEFAULT NULL,
        `tipoDeComprobante` varchar(100) DEFAULT NULL,
        `TipoCambio` decimal(10,0) DEFAULT NULL,
        `Moneda` varchar(45) DEFAULT NULL,
        `ruta_xml` TEXT DEFAULT NULL,
        `ruta_pdf` TEXT DEFAULT NULL,
        `tipo_archivo` varchar(45) DEFAULT 'original',
        `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
         Full TEXT,
         PRIMARY KEY (`IdDetalle`,`id_validacion`),  
         FULLTEXT (Full),
         KEY `fk1_idx` (`IdEmisor`),
         KEY `fk2_idx` (`IdReceptor`),
         CONSTRAINT `f2` FOREIGN KEY (`IdReceptor`) REFERENCES `Receptor` (`IdReceptor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
         CONSTRAINT `f1` FOREIGN KEY (`IdEmisor`) REFERENCES `Emisor` (`IdEmisor`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1";
        
        if(($ResultDetalleCliente = mysqli_query($link, $DetalleCliente))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Detalle Cliente </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
            
        $HistorialCliente = "CREATE TABLE IF NOT EXISTS `historial_cliente` (
        `id_historial` int(11) NOT NULL AUTO_INCREMENT,
        `id_validacion` int(11) NOT NULL,
        `id_detalle` int(11) NOT NULL,
        `id_usuario` int(11) DEFAULT NULL,
        `fecha_hora` datetime NOT NULL,
        `ruta_xml` TEXT NOT NULL,
        `ruta_pdf` TEXT DEFAULT NULL,
        `tipo_archivo` varchar(45) NOT NULL,
        PRIMARY KEY (`id_historial`,`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='tipo_archivo (original o copia)'";
        
        if(($ResultHistorialCliente = mysqli_query($link, $HistorialCliente))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Historial Cliente </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        } 
                
        $ValidacionCliente = "CREATE TABLE IF NOT EXISTS `validacion_cliente` (
        `id_validacion` int(11) NOT NULL AUTO_INCREMENT,
        `FechaHora_envio` datetime NOT NULL,
        `FechaHora_respuesta` datetime NOT NULL,
        `emisor_rfc` varchar(100) NOT NULL,
        `receptor_rfc` varchar(100) NOT NULL,                
        `total_factura` double NOT NULL,
        `uuid` varchar(100) NOT NULL,
        `codigo_estatus` varchar(100) NOT NULL,
        `estado` varchar(100) NOT NULL,
        `md5` varchar(100) NOT NULL,
        `web_service` TEXT NOT NULL,
        `ruta_acuse` TEXT NOT NULL,
        PRIMARY KEY (`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
        if(($ResultValidacionCliente = mysqli_query($link, $ValidacionCliente))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Validación Cliente </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }            
            
        $DetalleProveedor = "CREATE TABLE IF NOT EXISTS `detalle_proveedor` (
        `IdDetalle` int(11) NOT NULL AUTO_INCREMENT,
        `IdEmisor` int(11) NOT NULL DEFAULT '0',
        `IdReceptor` int(11) NOT NULL DEFAULT '0',
        `id_validacion` int(11) NOT NULL,
        `RfcEmisor` varchar(70) NOT NULL,
         RfcReceptor VARCHAR(50) NOT NULL,
        `serie` varchar(45) DEFAULT NULL,
        `folio` varchar(45) DEFAULT NULL,
        `fecha` date DEFAULT NULL,
        `formaDePago` varchar(200) DEFAULT NULL,
        `subTotal` double DEFAULT NULL,
        `descuento` double DEFAULT NULL,
        `total` double DEFAULT NULL,
        `metodoDePago` varchar(45) DEFAULT NULL,
        `tipoDeComprobante` varchar(100) DEFAULT NULL,
        `TipoCambio` decimal(10,0) DEFAULT NULL,
        `Moneda` varchar(45) DEFAULT NULL,
        `ruta_pdf` TEXT DEFAULT NULL,
        `ruta_xml` TEXT DEFAULT NULL,
        `tipo_archivo` varchar(45) DEFAULT 'original',
        `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
         Full TEXT,
         PRIMARY KEY (`IdDetalle`,`id_validacion`),
         FULLTEXT (Full),
         KEY `fk1_idx` (`IdEmisor`),
         KEY `fk2_idx` (`IdReceptor`),
         CONSTRAINT `f3` FOREIGN KEY (`IdEmisor`) REFERENCES `Emisor` (`IdEmisor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
         CONSTRAINT `f4` FOREIGN KEY (`IdReceptor`) REFERENCES `Receptor` (`IdReceptor`) ON DELETE NO ACTION ON UPDATE NO ACTION
        )  ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1";
        
        if(($ResultDetalleProveedor = mysqli_query($link, $DetalleProveedor))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Detalle Proveedor </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
            
        $HistorialProveedor = "CREATE TABLE IF NOT EXISTS `historial_proveedor` (
        `id_historial` int(11) NOT NULL AUTO_INCREMENT,
        `id_validacion` int(11) NOT NULL,
        `id_detalle` int(11) NOT NULL,
        `id_usuario` int(11) DEFAULT NULL,
        `fecha_hora` datetime NOT NULL,
        `ruta_xml` TEXT NOT NULL,
        `ruta_pdf` TEXT DEFAULT NULL,
        `tipo_archivo` varchar(45) NOT NULL,
        PRIMARY KEY (`id_historial`,`id_validacion`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='tipo_archivo (original o copia)'";
          
        if(($ResultHistorialProveedor = mysqli_query($link, $HistorialProveedor))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Historial Proveedor </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
        
          /*Registro de Usuarios */  
        $Users = "CREATE TABLE IF NOT EXISTS `Users` (
        `IdUser` int(11) NOT NULL AUTO_INCREMENT,
        `UserName` varchar(50) NOT NULL,
        `Password` varchar(45) NOT NULL,
        `Name` varchar(45) NOT NULL,
        `LastName` varchar(45) NOT NULL,
        `MLastName` varchar(45) DEFAULT NULL,
        `DischargeDate` DATETIME  DEFAULT NULL,
        PRIMARY KEY (`IdUser`,`UserName`)
        ) ENGINE=InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($ResultUsers = mysqli_query($link, $Users))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Usuarios </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
        
        $InsertAdmin = "INSERT INTO Users (IdUser, UserName, Password, Name, LastName, MLastName)"
                . " VALUES (1,'admin', 'admin', 'Administrador', 'Administrador', now())";
        
        if(($InsertAdminResult = mysqli_query($link, $InsertAdmin))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear el usuario admin de la instancia <b>$DataBaseName</b></p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
                           
        $Correo = "CREATE TABLE IF NOT EXISTS EmailEngine (
        IdEmail int(11) NOT NULL AUTO_INCREMENT,
        User VARCHAR(50) NOT NULL,
        Title VARCHAR(50) DEFAULT 'CSDocs CFDI',
        Password VARCHAR(50) NOT NULL,
        Smtp varchar(100),
        SmtpPort INT,
        SmtpAuth VARCHAR(5),
        SmtpSecure VARCHAR(10),
        Imap VARCHAR(100),   
        ImapPort INT,
        ImapSecure VARCHAR(5),
        EmailType varchar(10),
        EmailServerName VARCHAR(20),
        PRIMARY KEY (IdEmail)
        ) ENGINE=InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($ResultCorreo = mysqli_query($link, $Correo))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Correo </p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
            
        /* Vista utilizada en Carga_Nomina_XML */
//        $VistaExistDetalle = "CREATE OR REPLACE VIEW exist_detalle AS select id_detalle_recibo_nomina, id_emisor, id_receptor, FechaPago, curp from detalle_recibo_nomina";
        
//        if(($ResultVistaExistDetalle = mysqli_query($link, $VistaExistDetalle))!=1)
//        {
//            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Vista Existe Detalle </p><br>Detalles:<br><br>".  mysqli_error($link));
//            mysqli_close($link);
//            return 0;
//        }
            
            // SE CREA LA TABLA RECEPTOR DE RECIBO DE NOMINA
        $MotorCorreo = "CREATE TABLE IF NOT EXISTS `EmailEngineLog` (
        `IdEngineLog` int(11) NOT NULL AUTO_INCREMENT,
        `IdEmisor` int(11) DEFAULT NULL,
        `IdReceptor` int(11) DEFAULT NULL,
        `IdDetalle` int(11) DEFAULT NULL,
        `emisor_correo` varchar(100) DEFAULT NULL,
        `monto_factura` decimal(10,0) DEFAULT NULL,
        `fecha_factura` datetime DEFAULT NULL,
        `hora_recibido` datetime DEFAULT NULL,
        `fecha_ingreso` datetime DEFAULT NULL,
        `XmlPath` text,
        `PdfPath` text,
        `Status` varchar(100) DEFAULT NULL,
        PRIMARY KEY (`IdEngineLog`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Motor de Correo almacena los inserts realizados cuando se descarga, CFDI de cuentas de correo'";
        
        if(($ResultMotorCorreo = mysqli_query($link, $MotorCorreo))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear Motor Correo </p><br>Detalles:<br><br>".  mysqli_error($link));        
            mysqli_close($link);
            return 0;
        }                
        
        $CreateFiles = "CREATE TABLE IF NOT EXISTS Files ("
                . "IdFile INT NOT NULL AUTO_INCREMENT,"
                . "Content VARCHAR(15) NOT NULL,"
                . "FileName VARCHAR(100) NOT NULL,"
                . "Description VARCHAR(150) NULL,"
                . "Path TEXT NOT NULL,"
                . "PRIMARY KEY (IdFile)"
                . ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        if(($CreateFilesResult = mysqli_query($link, $CreateFiles))==FALSE)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear el control del documento en <b>$DataBaseName</b></p><br>Detalles:<br><br>".  mysqli_error($link));
            mysqli_close($link);
            return 0;
        }
        
        $CreatePolizas = "CREATE TABLE IF NOT EXISTS Polizas("
                . "IdPoliza NOT NULL AUTO_INCREMENT,"
                . ""
                . ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci";
        
        mysqli_close($link);
        
        return 1;
    }             
    
    private function CreateDataBaseFile($DataBaseName)
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

        if(!file_exists("$RoutFile/Config/$DataBaseName/"))
        {
            if(!($mkdir = mkdir("$RoutFile/Config/$DataBaseName", 0777, true)))
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al crear el directorio base de la nueva empresa </p><br>Detalles:<br><br>$mkdir");
                return 0;
            }
        }
        
        if(!($File = fopen("$RoutFile/Config/$DataBaseName/BD.ini", "w")))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al abrir el archivo config de BD</p>");
            return 0;
        }        
                
        if(strcasecmp($DataBaseName, "Manager")==0)       
        {
            $Password_ = "Admcs1234567";
            $DataBaseName = "CSDOCS_CFDI";
            $User_ = "Manager";
        }
        else
        {
            $Password_ = "12345";
            $User_ = $DataBaseName;
        }
               
        $localhost = Encrypter::encrypt("localhost");
        $Port = Encrypter::encrypt("3306");
        $User = Encrypter::encrypt($User_);     
        $Password = Encrypter::encrypt($Password_);
        $DataBaseName_ = Encrypter::encrypt($DataBaseName);                    
        
        fwrite($File, 'Host="'.$localhost.'"'.PHP_EOL);
        fwrite($File, 'Port="'.$Port.'"'.PHP_EOL);
        fwrite($File, 'User="'.$User.'"'.PHP_EOL);
        fwrite($File, 'Password="'.$Password.'"'.PHP_EOL);
        fwrite($File, 'Schema="'.$DataBaseName_.'"'.PHP_EOL);
        fclose($File);
                
        return 1;
    }
    
    function DeleteDataBase($DataBaseName)
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        
        $FileConnection = $this->GetConnectionFile("root");
        if(!is_array($FileConnection))
            return 0;
        
        error_reporting(E_ALL ^ E_DEPRECATED);
                
        if(!($link =  mysqli_connect($FileConnection['Host'].":".$FileConnection['Port'], $FileConnection['User'], $FileConnection['Password'])))
        {
                echo('No pudo conectarse: ' . mysqli_connect_error());
                return 0;
        }       
        
        $DropDataBase = "DROP DATABASE IF EXISTS $DataBaseName";
        if(($DropResult = mysqli_query($link, $DropDataBase))==FALSE)
            echo "<p>Error al eliminar la instancia $DataBaseName. ".mysqli_error($link)."</p>";
        
        $DeleteUser = "drop USER '$DataBaseName'@'localhost' ";
        if(($DeleteUserResult = mysqli_query($link, $DeleteUser))==FALSE)
                echo "<p>Error al eliminar el usuario $DataBaseName ".  mysqli_error($link)."</p>";
        
        mysqli_close($link);
        
        if(file_exists($RoutFile."/Config/$DataBaseName"))
            shell_exec("rm -R $RoutFile/Config/$DataBaseName");
        
        if(file_exists($RoutFile."/_root/$DataBaseName"))
            shell_exec("rm -R $RoutFile/_root/$DataBaseName");
        if(file_exists("$RoutFile/$DataBaseName.html"))
            unlink ("$RoutFile/$DataBaseName.html");
        
    }
    
    /*
     * Se comprueba la existencia del usuario Root en el sistema
     * return: true Sí existe el usuario Root ó false sino existe.
     */
    function ExistRootUser()
    {               
        $sql="SELECT *FROM Users WHERE Login='root'";
        $Result = $this->ConsultaSelect("Manager", $sql);
        if($Result['Estado']!=1)
        {
            return $Result['Estado'];
        }
        
        if(count($Result['ArrayDatos'])>0)
            return 1;
        else
            return 0;
    }
    
    /*
     * Al crear la Tabla Usuario se inserta por default el Usuario Root
     */
    function InsertRootUser()
    {
        $estado=false;
        $conexion=  $this->Conexion('Manager');
        if (!$conexion) {
//            $estado= mysqli_error();            
            return $estado;
        }
       
        $sql="INSERT INTO Users (IdUser , UserName, Password) VALUES(1, 'root','root')";
        $resultado=mysqli_query($conexion,$sql);
        if(!$resultado)
        {
            $estado= mysqli_error($conexion);  
            mysqli_close($conexion);
                return $estado;
        }                      
        mysqli_close($conexion);
            
        return $estado;
    }     
               
    /*
     * Se reciben dos cadenas:
     * 1.- Específica los campos a insertar
     * 2.- Especifica los valores a insertar en esos campos
     */        
    function ConsultaInsert($bd,$query)
    {
       $estado = true;
        $conexion=  $this->Conexion($bd);
        if (!$conexion) {
//            $estado= mysqli_error();            
            return $estado;
        }               

        $insertar=mysqli_query($conexion, $query);
        if(!$insertar)
            {
                $estado= mysqli_error($conexion);    
                mysqli_close($conexion);
                return $estado;
            }    
        mysqli_close($conexion);
            
        return $estado;
    }
    
    function ConsultaInsertReturnId($bd,$query)
    {        
        $conexion=  $this->Conexion($bd);
        if (!$conexion) {            
            return 0;
        }               

        $insertar = mysqli_query($conexion, $query);
        if(!$insertar)
        {
            $estado = mysqli_error($conexion);    
            mysqli_close($conexion);
            return $estado;
        }    
        
        $NewId = mysqli_insert_id($conexion);

        mysqli_close($conexion);            
        return $NewId;
    }   
    
    /*******************************************************************************
     * Regresa un array asociativo si la consulta tuvo éxito sino devuelve el error
     *                                                              
     *  Resultado = {
     * 
     *          Estado=> True/False ,
     *          ArrayDatos=>  'Resultado de Consulta'
     * 
     *******************************************************************************/
    function ConsultaSelect($bd,$query, $root = 0)
    {
        $estado=true;
        $ResultadoConsulta=array();
        if($root)
            $conexion = $this->ManagerConnection($bd);
        else
            $conexion=  $this->Conexion($bd);
        if (!$conexion) {
            $error=array("Estado"=>0, "ArrayDatos"=>0);
            return $error;
        }
      
        $select=mysqli_query($conexion, $query);
        if(!$select)
            {                
                $estado= mysqli_error($conexion); 
                mysqli_close($conexion);
                $error=array("Estado"=>$estado, "ArrayDatos"=>0);
                return $error;
            }
            else
            {
                while(($ResultadoConsulta[] = mysqli_fetch_array($select,MYSQLI_ASSOC)) || array_pop($ResultadoConsulta)); 
            }
        
        mysqli_free_result($select);
        mysqli_close($conexion);
            
        $Resultado=array("Estado"=>$estado, "ArrayDatos"=>$ResultadoConsulta);
        return $Resultado;
    }
    
    public  function QuerySelectArray($bd,$query)
    {

        $estado=true;
        $ResultadoConsulta=array();
        $conexion=  $this->Conexion($bd);
        if (!$conexion) {
            $error=array("Estado"=>$estado, "ArrayDatos"=>0);
            return $error;
        }

        $select=mysqli_query($conexion,$query);
        if(!$select)
            {
                $estado= mysqli_error($conexion); 
                mysqli_close($conexion);
                $error=array("Estado"=>$estado, "ArrayDatos"=>0);
                return $error;
            }
            else
                while($ResultadoConsulta[]=mysqli_fetch_array($select));
        
        mysqli_free_result($select);
        mysqli_close($conexion);
            
        $Resultado=array("Estado"=>$estado, "ArrayDatos"=>$ResultadoConsulta);
        return $Resultado;
    }
        
    /***************************************************************************
     * Realiza una consulta especifícando la instancia de BD y el query a ejecutar.
     *
     * @root = 1 ó 0
     *          1: Permisos de Manager
     *          0: Permisos del DataBaseName indicado
     */
    function ConsultaQuery($DataBasaName, $query, $root=0)
    {
        $estado=0;
        if($root)
            $conexion = $this->ManagerConnection($DataBasaName);
        else
            $conexion=  $this->Conexion($DataBasaName);
        if (!$conexion) {
            return $estado;
        }

        $select = mysqli_query($conexion, $query);
        if(!$select)
                $estado= mysqli_error($conexion); 
        else
            $estado = 1;
            
        mysqli_close($conexion);            
        return $estado;
    }
}

$database = new DataBase();
