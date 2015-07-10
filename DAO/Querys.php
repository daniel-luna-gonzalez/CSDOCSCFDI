<?php
class Querys {
    public $conexion;
    public function __construct() {               
    }
    function Conexion()
    {
//        $enlace =  mysql_connect('localhost', 'root', 'Admcs1234567');
//        mysql_set_charset('utf8');
//        return $enlace;
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        if(!file_exists("/volume1/web/Config/ConexionBD/BD.ini"))
        {
            echo "<p>No existe el archivo de Conexión.</p>"; return 0;            
        }
        
        $Conexion=parse_ini_file ("/volume1/web/Config/ConexionBD/BD.ini",true);

        $User=$Conexion['Conexion']['User'];
        $Password=$Conexion['Conexion']['Password'];
        $Host=$Conexion['Conexion']['Host'];
        error_reporting(E_ALL ^ E_DEPRECATED);
        $enlace =  mysql_connect($Host, $User, $Password);        
        mysql_set_charset('utf8');
        return $enlace;
    }
    public function crear_base_CFDI()
    {
        $this->conexion = $this->Conexion();
        if (!$this->conexion) {
            echo('No pudo conectarse: ' . mysql_error());
        }
       
        //mysql_close($enlace);              
        $sql="CREATE DATABASE IF NOT EXISTS `CFDI` /*!40100 DEFAULT CHARACTER SET utf8 */;";
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la base de datos  '.  mysql_error()."  ";            
            }                 
            mysql_close($this->conexion);
    }
    public function crear_tablas_ERD()
    {
        $this->conexion=  $this->Conexion();
        mysql_select_db('CFDI',  $this->conexion);
        if (!$this->conexion) {
            echo('No pudo conectarse: ' . mysql_error());
            return;
        }
        
        $sql="CREATE DATABASE IF NOT EXISTS `CFDI` /*!40100 DEFAULT CHARACTER SET utf8 */;";
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
        {
            echo 'Error al crear la base de datos  '. mysql_error()."  ";            
        }                 
        
        //SE CREA LA TABLA EMISOR DE RECIBO DE NOMINA         
        $sql="CREATE TABLE IF NOT EXISTS `emisor_recibo_nomina` (
          `idemisor` int(11) NOT NULL AUTO_INCREMENT,
          `rfc` varchar(100) NOT NULL,
          `nombre` varchar(45) NOT NULL,
          `pais` varchar(45) NOT NULL,
          `calle` varchar(200) NOT NULL,
          `estado` varchar(45) NOT NULL,
          `colonia` varchar(200) NOT NULL,
          `municipio` varchar(100) NOT NULL,
          `noExterior` int(11) DEFAULT NULL,
          `cp` int(11) NOT NULL,
          `pais_expedido` varchar(60) DEFAULT NULL,
          `calle_expedido` varchar(200) DEFAULT NULL,
          `estado_expedido` varchar(45) DEFAULT NULL,
          `colonia_expedido` varchar(200) DEFAULT NULL,
          `noExterior_expedido` int(11) DEFAULT NULL,
          `cp_expedido` int(11) DEFAULT NULL,
          PRIMARY KEY (`idemisor`,`rfc`)
        ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8
";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla emisor';            
            }
                  
            // SE CREA LA TABLA RECEPTOR DE RECIBO DE NOMINA
            $sql="CREATE TABLE IF NOT EXISTS `receptor_recibo_nomina` (
            `id_receptor` int(11) NOT NULL AUTO_INCREMENT,
            `curp` varchar(200) NOT NULL,
            `rfc` varchar(100) DEFAULT NULL,
            `nombre` varchar(200) DEFAULT NULL,
            `pais` varchar(45) DEFAULT NULL,
            `calle` varchar(200) DEFAULT NULL,
            `estado` varchar(200) DEFAULT NULL,
            `colonia` varchar(200) DEFAULT NULL,
            `municipio` varchar(200) DEFAULT NULL,
            `noExterior` varchar(10) DEFAULT NULL,
            `noInterior` varchar(10) DEFAULT NULL,
            `cp` varchar(10) DEFAULT NULL,
            PRIMARY KEY (`id_receptor`,`curp`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla receptor';            
            }
                 
            // SE CREA LA TABLA DETALLE DE RECIBO DE NOMINA
            
            $sql="CREATE TABLE IF NOT EXISTS `detalle_recibo_nomina` (
            `id_detalle_recibo_nomina` int(11) NOT NULL AUTO_INCREMENT,
            `id_emisor` int(11) NOT NULL,
            `id_receptor` int(11) NOT NULL,
            `id_validacion` int(11) NOT NULL,
            `curp` varchar(60) NOT NULL,
            `registro_patronal` varchar(250) DEFAULT NULL,
            `NumEmpleado` int(11) DEFAULT NULL,
            `tipoRegimen` int(11) DEFAULT NULL,
            `NumSegSocial` varchar(250) DEFAULT NULL,
            `FechaPago` date DEFAULT NULL,
            `FechaInicialPago` date DEFAULT NULL,
            `FechaFinalPago` date DEFAULT NULL,
            `NumDiasPagados` decimal(10,0) DEFAULT NULL,
            `departamento` varchar(200) DEFAULT NULL,
            `clabe` varchar(200) DEFAULT NULL,
            `banco` varchar(100) DEFAULT NULL,
            `FechaInicioLaboral` date DEFAULT NULL,
            `antiguedad` int(11) DEFAULT NULL,
            `puesto` varchar(200) DEFAULT NULL,
            `TipoContrato` varchar(200) DEFAULT NULL,
            `TipoJornada` varchar(70) DEFAULT NULL,
            `PeriodicidadPago` varchar(45) DEFAULT NULL,
            `SalarioBaseCotApor` float DEFAULT NULL,
            `RiesgoPuesto` int(11) DEFAULT NULL,
            `SalarioDiarioIntegrado` float DEFAULT NULL,
            `id_CentroCosto` int(11) DEFAULT '0',
            `xml_ruta` varchar(220) DEFAULT NULL,
            `pdf_ruta` varchar(220) DEFAULT NULL,
            `tipo_archivo` varchar(45) DEFAULT 'original',
            `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
             Full TEXT, 
             PRIMARY KEY (`id_detalle_recibo_nomina`,`curp`,`id_validacion`),
             FULLTEXT (Full),
             KEY `FK1` (`id_emisor`),
             KEY `FK2_idx` (`id_receptor`),
             CONSTRAINT `FK1` FOREIGN KEY (`id_emisor`) REFERENCES `emisor_recibo_nomina` (`idemisor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
             CONSTRAINT `FK2` FOREIGN KEY (`id_receptor`) REFERENCES `receptor_recibo_nomina` (`id_receptor`) ON DELETE NO ACTION ON UPDATE NO ACTION
             ) ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1


            ";
           $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla historial nomina  '. mysql_error();            
                }    
            /******************** Histórico Nomina*********************/
            $sql="CREATE TABLE IF NOT EXISTS `historial_nomina` (
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
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla historial nomina  '. mysql_error();            
                }    
            $sql="CREATE TABLE IF NOT EXISTS `validacion_nomina` (
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
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8
              ";
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla validacion nomina '. mysql_error();            
                }     
                
                
                
                /*      Validación  CFDI    */
                
                
                $sql="CREATE TABLE IF NOT EXISTS `validacion_proveedor` (
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
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8
              ";
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla validacion proveedor '. mysql_error();            
                }                                         
            
            $sql="CREATE TABLE IF NOT EXISTS `existe` (
            `idexiste` int(11) NOT NULL AUTO_INCREMENT,
            `id_emisor` int(11) NOT NULL,
            `nombre` varchar(200) DEFAULT NULL,
            `NoIntentos` int(11) DEFAULT '0',
            PRIMARY KEY (`idexiste`,`id_emisor`)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Tabla que registra el numero de intentos que se trata de procesar un recibo de nomina o algun otro comprobante'
          ";
            
            
            $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla existe  '. mysql_error();            
            }
            
            $sql="CREATE TABLE IF NOT EXISTS `registro_pdf` (
            `id_pdf` int(11) NOT NULL AUTO_INCREMENT,
            `nombre` varchar(200) DEFAULT NULL,
            PRIMARY KEY (`id_pdf`)
          ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COMMENT='Tabla que contiene los nombres de los PDF pendientes por insertar en la BD'
          ";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla registro_pdf  '. mysql_error();            
            }
 
            $sql="CREATE TABLE IF NOT EXISTS `registro_xml` (
            `id_registro_xml` int(11) NOT NULL AUTO_INCREMENT,
            `id_detalle` int(11) NOT NULL,
            `nombre_xml` varchar(200) DEFAULT NULL,
            PRIMARY KEY (`id_registro_xml`,`id_detalle`)
          ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1
            ";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla registro_xml  '. mysql_error();            
            }            
            /*UTILIZADO EN CARGA RECIBO DE NOMINA */
            $sql="CREATE OR REPLACE VIEW `insert_pdf` AS select `registro_xml`.`id_detalle` AS `id_detalle`,`registro_pdf`.`nombre` AS `nombre` from (`registro_xml` join `registro_pdf` on((`registro_xml`.`nombre_xml` = `registro_pdf`.`nombre`)))";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la vista insert_pdf  '. mysql_error();            
            }
            
            /* Tabla emisor Factura Cliente */    
        $sql="CREATE TABLE IF NOT EXISTS `emisor_factura_cliente` (
            `idemisor` int(11) NOT NULL AUTO_INCREMENT,
            `rfc` varchar(100) NOT NULL,
            `nombre` varchar(100) NOT NULL,
            `pais` varchar(45) NOT NULL,
            `calle` varchar(200) NOT NULL,
            `estado` varchar(45) NOT NULL,
            `colonia` varchar(200) NOT NULL,
            `municipio` varchar(100) NOT NULL,
            `noExterior` varchar(10) DEFAULT NULL,
            `cp` varchar(10) NOT NULL,
            `localidad` varchar(250) DEFAULT NULL,
            `expedidoCalle` varchar(150) DEFAULT NULL,
            `expedidoNoExterior` varchar(10) DEFAULT NULL,
            `expedidoColonia` varchar(150) DEFAULT NULL,
            `expedidoLocalidad` varchar(150) DEFAULT NULL,
            `expedidoMunicipio` varchar(150) DEFAULT NULL,
            `expedidoEstado` varchar(150) DEFAULT NULL,
            `expedidoPais` varchar(150) DEFAULT NULL,
            `expedidoCP` varchar(10) DEFAULT NULL,
            PRIMARY KEY (`idemisor`,`rfc`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8
        ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla emisor factura cliente '. mysql_error();                      
            }
            /* Tabla Receptor Factura Cliente */
            $sql="CREATE TABLE IF NOT EXISTS `receptor_factura_cliente` (
                `id_receptor` int(11) NOT NULL AUTO_INCREMENT,
                `rfc` varchar(200) NOT NULL,
                `nombre` varchar(200) DEFAULT NULL,
                `pais` varchar(45) DEFAULT NULL,
                `calle` varchar(200) DEFAULT NULL,
                `estado` varchar(200) DEFAULT NULL,
                `colonia` varchar(200) DEFAULT NULL,
                `municipio` varchar(200) DEFAULT NULL,
                `noExterior` varchar(10) DEFAULT NULL,
                `noInterior` varchar(10) DEFAULT NULL,
                `cp` varchar(10) DEFAULT NULL,
                `localidad` varchar(150) DEFAULT NULL,
                PRIMARY KEY (`id_receptor`,`rfc`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8

                 ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla receptor factura cliente '. mysql_error();                      
            }
            /* Tabla detalle factura cliente */
            $sql="CREATE TABLE IF NOT EXISTS `detalle_factura_cliente` (
            `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
            `id_emisor` int(11) NOT NULL DEFAULT '0',
            `id_receptor` int(11) NOT NULL DEFAULT '0',
            `id_validacion` int(11) NOT NULL,
            `rfc_cliente` varchar(70) DEFAULT NULL,
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
            `ruta_xml` varchar(250) DEFAULT NULL,
            `ruta_pdf` varchar(250) DEFAULT NULL,
            `tipo_archivo` varchar(45) DEFAULT 'original',
            `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
             Full TEXT,
             PRIMARY KEY (`id_detalle`,`id_validacion`),  
             FULLTEXT (Full),
             KEY `fk1_idx` (`id_emisor`),
             KEY `fk2_idx` (`id_receptor`),
             CONSTRAINT `f2` FOREIGN KEY (`id_receptor`) REFERENCES `receptor_factura_cliente` (`id_receptor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
             CONSTRAINT `f1` FOREIGN KEY (`id_emisor`) REFERENCES `emisor_factura_cliente` (`idemisor`) ON DELETE NO ACTION ON UPDATE NO ACTION
          ) ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1
          ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla detalle factura cliente '. mysql_error();                      
            }
            
            
            $sql="CREATE TABLE IF NOT EXISTS `historial_cliente` (
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
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla historial cliente  '. mysql_error();            
                }    
                
                $sql="CREATE TABLE IF NOT EXISTS `validacion_cliente` (
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
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8
              ";
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla validacion  Cliente'. mysql_error();            
                }     
                
            
            
            /* TRIGGERS DE INSERCIÓN PARA ARCHIVO ORIGINAL EN HISTORIAL   CLIENTE */
//            $sql="drop trigger if exists trigger_insert_historial_cliente";
//             $insertar=mysql_query($sql,  $this->conexion);
//            if(!$insertar)
//                {
//                    echo 'Error al crear la tabla LOGIN  '. mysql_error();            
//                }  
//                
//            $sql="
//                    CREATE TRIGGER trigger_insert_historial_cliente BEFORE INSERT ON detalle_factura_cliente FOR EACH ROW BEGIN
//                    INSERT INTO historial_cliente 
//                    SET id_detalle=NEW.id_detalle, fecha_hora=now(), ruta_xml=NEW.ruta_xml, tipo_archivo='original';
//                    END;
//                    ";
//             $insertar=mysql_query($sql,  $this->conexion);
//            if(!$insertar)
//                {
//                    echo 'Error al crear TRIGGER  '. mysql_error();            
//                }    
            
            
            /*  Facturas Proveedor */
            $sql="CREATE TABLE IF NOT EXISTS `emisor_factura_proveedor` (
            `idemisor` int(11) NOT NULL AUTO_INCREMENT,
            `rfc` varchar(100) NOT NULL,
            `nombre` varchar(100) NOT NULL,
            `pais` varchar(45) NOT NULL,
            `calle` varchar(200) NOT NULL,
            `estado` varchar(45) NOT NULL,
            `colonia` varchar(200) NOT NULL,
            `municipio` varchar(100) NOT NULL,
            `noExterior` varchar(10) DEFAULT NULL,
            `cp` varchar(10) NOT NULL,
            `localidad` varchar(250) DEFAULT NULL,
            `expedidoCalle` varchar(150) DEFAULT NULL,
            `expedidoNoExterior` varchar(10) DEFAULT NULL,
            `expedidoColonia` varchar(150) DEFAULT NULL,
            `expedidoLocalidad` varchar(150) DEFAULT NULL,
            `expedidoMunicipio` varchar(150) DEFAULT NULL,
            `expedidoEstado` varchar(150) DEFAULT NULL,
            `expedidoPais` varchar(150) DEFAULT NULL,
            `expedidoCP` varchar(10) DEFAULT NULL,
            PRIMARY KEY (`idemisor`,`rfc`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8
          ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla emisor factura proveedor '. mysql_error();                      
            }
                                                                        
            $sql="CREATE TABLE IF NOT EXISTS `receptor_factura_proveedor` (
            `id_receptor` int(11) NOT NULL AUTO_INCREMENT,
            `rfc` varchar(200) NOT NULL,
            `nombre` varchar(200) DEFAULT NULL,
            `pais` varchar(45) DEFAULT NULL,
            `calle` varchar(200) DEFAULT NULL,
            `estado` varchar(200) DEFAULT NULL,
            `colonia` varchar(200) DEFAULT NULL,
            `municipio` varchar(200) DEFAULT NULL,
            `noExterior` varchar(10) DEFAULT NULL,
            `noInterior` varchar(10) DEFAULT NULL,
            `cp` varchar(10) DEFAULT NULL,
            `localidad` varchar(150) DEFAULT NULL,
            PRIMARY KEY (`id_receptor`,`rfc`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla receptor_factura_proveedor '. mysql_error();                      
            }
            
            
            $sql="CREATE TABLE IF NOT EXISTS `detalle_factura_proveedor` (
            `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
            `id_emisor` int(11) NOT NULL DEFAULT '0',
            `id_receptor` int(11) NOT NULL DEFAULT '0',
            `id_validacion` int(11) NOT NULL,
            `rfc_cliente` varchar(70) DEFAULT NULL,
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
            `ruta_pdf` varchar(250) DEFAULT NULL,
            `ruta_xml` varchar(250) DEFAULT NULL,
            `tipo_archivo` varchar(45) DEFAULT 'original',
            `tipo_archivo_pdf` varchar(45) DEFAULT 'original',
             Full TEXT,
             PRIMARY KEY (`id_detalle`,`id_validacion`),
             FULLTEXT (Full),
             KEY `fk1_idx` (`id_emisor`),
             KEY `fk2_idx` (`id_receptor`),
             CONSTRAINT `f3` FOREIGN KEY (`id_emisor`) REFERENCES `emisor_factura_proveedor` (`idemisor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
             CONSTRAINT `f4` FOREIGN KEY (`id_receptor`) REFERENCES `receptor_factura_proveedor` (`id_receptor`) ON DELETE NO ACTION ON UPDATE NO ACTION
          )  ENGINE = MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1
          ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla detalle factura proveedor '. mysql_error();                      
            }
            
            /**********************Histórico Proveedor***********************/
            $sql="CREATE TABLE IF NOT EXISTS `historial_proveedor` (
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
             $insertar=mysql_query($sql,  $this->conexion);
            if(!$insertar)
                {
                    echo 'Error al crear la tabla LOGIN  '. mysql_error();            
                }    
            
            
          /*Registro de Usuarios */  
            $sql="CREATE TABLE IF NOT EXISTS `login` (
            `id_login` int(11) NOT NULL AUTO_INCREMENT,
            `id_correo` int(11) NOT NULL,
            `nombre_usuario` varchar(50) NOT NULL,
            `password` varchar(45) NOT NULL,
            `nombre` varchar(45) NOT NULL,
            `apellido_materno` varchar(45) NOT NULL,
            `apellido_paterno` varchar(45) DEFAULT NULL,
            `curp` varchar(45) DEFAULT NULL,
            `fecha_nac` date DEFAULT NULL,
            `tipo_usuario` varchar(45) NOT NULL,
            `estatus` int(11) DEFAULT '1',
            `fecha_alta` DATETIME  DEFAULT NULL,
            `fecha_baja` DATETIME  DEFAULT NULL,
            PRIMARY KEY (`id_login`,`nombre_usuario`)
          ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla LOGIN  '. mysql_error();            
            }                                  
            
            $sql="CREATE TABLE IF NOT EXISTS `correo` (
            `id_correo` int(11) NOT NULL AUTO_INCREMENT,
            `id_empleado` int(11) NOT NULL,
            `servidor` varchar(45) NULL,
            `smtp` varchar(45) DEFAULT NULL,
            `puerto` varchar(45) DEFAULT NULL,
            `seguridad` varchar(45) DEFAULT NULL,
            `auth` varchar(10) DEFAULT NULL,
            `password` varchar(45) DEFAULT NULL,
            `correo` varchar(45) DEFAULT NULL,
            `titulo_mostrar` varchar(45) DEFAULT NULL,
            `host_imap` varchar(150) DEFAULT NULL,
            `estatus` int(11) DEFAULT '1',
            PRIMARY KEY (`id_correo`,`id_empleado`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8
          ";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla Correo  '. mysql_error();            
            }               
            
            /* Vista utilizada en Carga_Nomina_XML */
            $sql="CREATE OR REPLACE VIEW exist_detalle AS select id_detalle_recibo_nomina, id_emisor, id_receptor, FechaPago, curp from detalle_recibo_nomina";
             $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla LOGIN  '. mysql_error();            
            }               
            
            // SE CREA LA TABLA RECEPTOR DE RECIBO DE NOMINA
            $sql="CREATE TABLE IF NOT EXISTS `motor_correo` (
            `id_motor` int(11) NOT NULL AUTO_INCREMENT,
            `id_correo` varchar(60) DEFAULT NULL,
            `id_emisor` int(11) DEFAULT NULL,
            `id_receptor` int(11) DEFAULT NULL,
            `id_detalle` int(11) DEFAULT NULL,
            `emisor_correo` varchar(100) DEFAULT NULL,
            `monto_factura` decimal(10,0) DEFAULT NULL,
            `folio` varchar(45) DEFAULT NULL,
            `fecha_factura` datetime DEFAULT NULL,
            `hora_recibido` datetime DEFAULT NULL,
            `fecha_ingreso` datetime DEFAULT NULL,
            `ruta_xml` text,
            `ruta_pdf` text,
            `estatus_insert` varchar(100) DEFAULT NULL,
            PRIMARY KEY (`id_motor`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Motor de Correo almacena los inserts realizados cuando se descarga, CFDI de cuentas de correo'
          ";
        
        $insertar=mysql_query($sql,  $this->conexion);
        if(!$insertar)
            {
                echo 'Error al crear la tabla receptor';            
            }
            
        
            
                        
            mysql_close($this->conexion);
    }
       
}
$bd=new Querys();
//$bd->crear_base_CFDI();
//$bd->crear_tablas_ERD();

