<?php
/*
 * Clase que establece el acceso al escritorio de la aplicación, devuelve 1 como acceso permitido
 * y el nombre del usuario, registra el acceso en un log
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once 'DataBase.php';
require_once 'XML.php';
class Login {
    public function __construct() {  
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'Login': $this->LogIn(); break;
        }
    }
    private function LogIn()
    {        
        $DB = new DataBase();
//        echo "<p>Ususario= ".$_POST['usuario']."   Contraseña=  ".$_POST['password']."</p>";
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");    /* Alias de la empresa */
        $IdEnterprise = filter_input(INPUT_POST, "IdEnterprise");
        $UserName = filter_input(INPUT_POST, "UserName");
        $idUser = 0;
        $Password = filter_input(INPUT_POST, "Password");
        $q = '';
        
        /* Modo administración solo puede entrar root */
        if((strcasecmp($UserName, 'root')!=0 and strcasecmp($IdEnterprise, 0)==0)) 
        {
            XML::XmlResponse ("AccessDenied", 0, "<p>Acceso solo para root</p>");
            return 0;
        }
        
        if(strcasecmp($EnterpriseAlias, "Manager")==0)
        {
            $q="SELECT * FROM Users WHERE UserName COLLATE utf8_bin = '$UserName' AND Password COLLATE utf8_bin = '$Password'";
        }
        else
            $q = "SELECT * FROM Users WHERE UserName COLLATE utf8_bin = '$UserName' AND Password COLLATE utf8_bin = '$Password'";                        
               
        
        $ResultLogin = $DB->ConsultaSelect($EnterpriseAlias, $q);
        if(($ResultLogin['Estado']!=1))
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al iniciar sesión</p><br>Detalles:<br><br>".$ResultLogin['Estado']);
            return 0;
        }
        
        $UserInfo = $ResultLogin['ArrayDatos'];
        if(count($UserInfo)>0)     
        {
            if(strcasecmp($UserName, "root")==0)
                $IdEnterprise = 1;
            
            $nombre_usuario = $UserInfo[0]['UserName'];
            $idUser = $UserInfo[0]['IdUser'];
         
        }
        else
        {
            XML::XmlResponse ("AccessDenied", 0, "<p>Usuario no registrado</p>");
            return 0;
        }
        
        /* Se busca que la empresa este registrada */
        if($IdEnterprise>0)
        {
            $EnterpriseLogin = "SELECT *FROM Enterprises WHERE IdEnterprise = $IdEnterprise ";
            $ResultEnterprisesLogin = $DB->ConsultaSelect($EnterpriseAlias, $EnterpriseLogin);
            if($ResultEnterprisesLogin['Estado']!=1)
            {
                XML::XmlResponse("Error", 0, "<p><b>Error</b> al solicitar la empresa $EnterpriseAlias</p><br>Detalles:<br><br>".$ResultEnterprisesLogin['Estado']);
                return 0;
            }

            if(!($ResultEnterprisesLogin['ArrayDatos']>0))
            {
                XML::XmlResponse ("AccessDenied", 0, "<p>Empresa desconocida</p>");
                return 0;
            }
        }
                        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Login');
        $doc->appendChild($root);
        $id_usuario_=$doc->createElement('IdUser',$idUser);
        $root->appendChild($id_usuario_);
        $nombre_usuario=$doc->createElement('UserName',$UserName);
        $root->appendChild($nombre_usuario);
        $EnterpriseNameXml = $doc->createElement("EnterpriseName", $EnterpriseAlias);
        $root->appendChild($EnterpriseNameXml);
        $IdEnterpriseXml = $doc->createElement("IdEnterprise", $IdEnterprise);
        $root->appendChild($IdEnterpriseXml);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
}
$login=new Login();

