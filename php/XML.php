<?php
/*
 * Clas que trata los archivos XML introducidos por el usuario desde la interfaz web.
 * La información que es procesada dentro del XML primero debe ser validada por el 
 * XSD que contiene el sistema para después invocar la clase DataBase
 */

/**
 * Description of XML
 *
 * @author daniel
 */
require_once 'DataBase.php';
class XML {
    public function __construct() {
        $this->ajax();
    }
    
    private function ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case 'ReadXML': $this->ReadXML(); break;
        }
    }
    
    /* Se válida el xml contra un esquema */
    function validacion_xml()
    {
        if(!(file_exists('../Configuracion/Esquema_CSDOCS1.0.xsd')))
        {
            $this->ResponseXML("Error", 0, "<p>No se encuentra el esquema de válidación</p>");
            return 0;
        }

        foreach ($_FILES as $file)
        {
            $RutaXml = $file['tmp_name'];
            if(file_exists($RutaXml))
            {                       
                $xml = new DOMDocument(); 
                libxml_use_internal_errors(true);
                if(!($xml->load($RutaXml)))
                {
                    $Error='';
                    $errors=libxml_get_errors();
                    for ($aux=0;$aux<count($errors); $aux++) {
                        // Aquí se manejan los errores} 
                        $Error.=$this->display_xml_error($errors[$aux]);
                    }
                    
                    echo "<p><b>Error</b> al leer el XML. </p> <br><p>Detalles:</p><br> $Error";
                    return 0;
                }
                
                if (!$xml->schemaValidate('../Configuracion/Esquema_CSDOCS1.0.xsd'))
                {           
                /*********** Errores ocurridos al válidar el archivo se registran en el log **********/
                    $Error='';
                    $errors=libxml_get_errors();
                    for ($aux=0;$aux<count($errors); $aux++) {
                        // Aquí se manejan los errores} 

                        $Error.=$this->display_xml_error($errors[$aux]);
                    }
                    echo "<p><b>Error</b>. Estructura inválida</p> <br><p>Detalles:</p><br> $Error";
                    libxml_clear_errors();   /* Se limpia buffer de errores */          
                    return 0;
                }                   
            }
            else
            {
                echo "<p>El XML no fué cargado correctamente ya que no se encuentra.</p>";
                return 0;
            }
            
            return $RutaXml;
                
        }                                
    }
    
    private function ReadXML()
    {
        $ValidacionEsquema=$this->validacion_xml();
        if(strcasecmp($ValidacionEsquema, 0)==0)
        {       
            return;
        }          
        /* Una vez válidado el XML se recorreo para realizar los inserts en laBD */
        $this->RecorrerXML($ValidacionEsquema);
    }
    
    private function RecorrerXML($ruta_xml)
    {
        echo "<p>Recorrer XML</p>";
        /* Se obtiene  los nodos hijos */
        $xml=  simplexml_load_file($ruta_xml);  
        foreach ($xml->children() as $valor)
        {
//            printf("<p>".$valor->getName()."</p>");
            $array_nodos[]=$valor->getName();            
        }
        
        $bd=new DataBase();
        
        
       /******************************* INSTANCIA BD *****************************/
        
        if(array_search('CrearInstanciaBD', $array_nodos)!==false)
        {            
//            echo "<p>Encontrado InstanciasBD</p>";
            $child=$xml->CrearInstanciaBD->InstanciaBD;
            foreach ($child as $instancia)
            {
//                printf ("<p>Creando instancia ".$instancia."</p>");
                if(($ResCreateInstancia = $bd->CreateIntanciaDataBase($instancia))!=1)
                {
                    echo "<br><p>$ResCreateInstancia<p><br>";
                    return 0;
                }                    
            }                    
        }
        
        /******************************* EMPRESAS *****************************/
        if (array_search('EstructuraEmpresas', $array_nodos) !== false) {
            echo "<br><p>Encontrado CrearEstructuraEmpresas=" . count($xml->EstructuraEmpresas->CrearEstructuraEmpresa) . "</p><br>";
            $EstructuraEmpresa=$xml->EstructuraEmpresas->CrearEstructuraEmpresa;
            $bd->CrearEstructEmpresa($EstructuraEmpresa);
        }


        /******************************* REPOSITORIOS *****************************/
        
        if(array_search('EstructuraRepositorio', $array_nodos)!==false)
        {
            echo "<br><p>Encontrado EstructuraRepositorio Peso =".count($xml->EstructuraRepositorio->CrearEstructuraRepositorio)."</p><br>";
            $detalle=array();
            
            /* Estrucutra Completa de CrearRepositorio */
            $Repositorio=$xml->EstructuraRepositorio->CrearEstructuraRepositorio;             
                                   
            /* Estructura para la creación del repositorio */                    
            $bd->crear_repositorio($Repositorio);
        }                                
        
        /******************************* CATALOGOS *****************************/
        
        if(array_search('Catalogos', $array_nodos)!==false)
        {
            $detalle_catalogo=array();
            echo "<br><p>Encontrado Catalogos Peso = ".count($xml->Catalogos->Catalogo)."</p><br>";
                        
            $catalogos=$xml->Catalogos->Catalogo;
            if(count($catalogos)>0)         
                foreach ($catalogos as $catalogo)
                {
                    $detalle=array("NombreCatalogo"=>$catalogo->NombreCatalogo, "Descripcion"=>$catalogo->Descripcion);                                 
                }
                
            $bd->crear_catalogo($detalle_catalogo);
        }   
        
        /******************************* USUARIOS *****************************/
        
        if(array_search('EstructuraUsuarios', $array_nodos)!==false)
        {
            echo "<br><p>Encontrado CrearEstructuraUsuarios Peso = ".count($xml->EstructuraUsuarios->CrearEstructuraUsuario)."</p><br>";
            $StructUsuario=$xml->EstructuraUsuarios->CrearEstructuraUsuario;
            $bd->CrearStructUsuario($StructUsuario);
                   
            $StructUsuarios=$xml->EstructuraUsuarios->InsertUsuario;
            $bd->insertar_usuario($StructUsuarios); 
        }   
        
        /**************************** INSERT EMPRESAS **************************/
        if (array_search('EstructuraEmpresas', $array_nodos) !== false) {
            echo "<br><p>Encontrado InsertEmpresas Peso=" . count($xml->EstructuraEmpresas->InsertEmpresa) . "</p><br>";
            $InsertEmpresas = $xml->EstructuraEmpresas->InsertEmpresa;
            $bd->insertar_empresa($InsertEmpresas);
        }
        
    }     
    
    /*
     * Se genera la respuesta XML
     */
    
    function ResponseXML($raiz, $estado, $mensaje)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement($raiz);
        $doc->appendChild($root);       
        $tipo_usuario=$doc->createElement('Estado',$estado);
        $root->appendChild($tipo_usuario);
        $mensaje_=$doc->createElement('Mensaje',$mensaje);
        $root->appendChild($mensaje_);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    public static function XmlResponse($raiz, $estado, $mensaje)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement($raiz);
        $doc->appendChild($root);       
        $tipo_usuario=$doc->createElement('Estado',$estado);
        $root->appendChild($tipo_usuario);
        $mensaje_=$doc->createElement('Mensaje',$mensaje);
        $root->appendChild($mensaje_);
        header ("Content-Type:text/xml charset=utf-8;");
        echo $doc->saveXML();
    }
    
    /***************************************************************************
     * Regresa un XML a partir de un Array Asociativo con la siguiente estructura
     * 
     *  Array{
     *          [0]=>Array{"campo"=>"valor", "campo"=>"valor"},
     *          [1]=>Array{"campo"=>"valor","campo"=>"valor" },
     *          [2]=>Array{"campo"=>"valor","campo"=>"valor" },
     *      }
     */
    function ResponseXmlFromArray($raiz,$bloque,$array)
    {
        /*  Devolución de repuesta en XML */
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement($raiz);
        $doc->appendChild($root);         
        for  ($cont=0; $cont<count($array);$cont++)
        {
            if(count($array[$cont])>0)
            {
                $Usuario=$doc->createElement($bloque);            
                foreach ($array[$cont] as $campo=>$valor)
                {
                    $campo=$doc->createElement($campo,$valor);
                    $Usuario->appendChild($campo);
                }
                $root->appendChild($Usuario);
            }            
        }        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }    
    
    public static function XmlArrayResponse($raiz,$bloque,$array)
    {
        /*  Devolución de repuesta en XML */
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement($raiz);
        $doc->appendChild($root);         
        for  ($cont=0; $cont<count($array);$cont++)
        {
            if(count($array[$cont])>0)
            {
                $Usuario=$doc->createElement($bloque);            
                foreach ($array[$cont] as $campo=>$valor)
                {
                    $campo=$doc->createElement($campo,$valor);
                    $Usuario->appendChild($campo);
                }
                $root->appendChild($Usuario);
            }            
        }        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
/* Retorna los errores que ocurren durante la validación de un XML */
    function display_xml_error($error)
    {
        $return  = $error->line . "\n";
        $return .= str_repeat('-', $error->column) . "^\n";

        switch ($error->level) {
            case LIBXML_ERR_WARNING:
                $return .= "Warning $error->code: ";
                break;
             case LIBXML_ERR_ERROR:
                $return .= "Error $error->code: ";
                break;
            case LIBXML_ERR_FATAL:
                $return .= "Fatal Error $error->code: ";
                break;
        }

        $return .= trim($error->message) .
                   "\n  Line: $error->line" .
                   "\n  Column: $error->column";

        if ($error->file) {
            $return .= "\n  File: $error->file";
        }

        return "$return\n\n--------------------------------------------\n\n";
    }
    
    
}
$xml = new XML();
