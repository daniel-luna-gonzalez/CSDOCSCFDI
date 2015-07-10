<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Users
 *
 * @author Daniel
 */
require_once 'DataBase.php';
require_once 'XML.php';
class Users {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'NewUser': $this->NewUser(); break;
            case 'UserList': $this->UserList(); break;
            case 'GetUserInfo': $this->GetUserInfo(); break;
            case 'ModifyUser': $this->ModifyUser(); break;
            case 'DeleteUser': $this->DeleteUser(); break;
            case 'DisplayAdminUsers': $this->DisplayAdminUsers(); break;
            case 'GetAdminUserInfo': $this->GetAdminUserInfo(); break;
            case 'ModifyAdminUser':$this->ModifyAdminUser(); break;
        }
    }    
    
    private function ModifyAdminUser()
    {
        $DB = new DataBase();
        
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $AdminUserEnterprise = filter_input(INPUT_POST, "AdminUserEnterprise");
        $Password = filter_input(INPUT_POST, "Password");
        $IdAdminUser = filter_input(INPUT_POST, "IdAdminUser");
        
        $UpdateAdminUser = "UPDATE Users SET Password = '$Password' WHERE IdUser = 1";

        if(($UpdateAdminUserResult = $DB->ConsultaQuery($AdminUserEnterprise, $UpdateAdminUser))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar los datos del usuario administrador</p><br>Detalles:<br><br>".$UpdateAdminUserResult);
            return 0;
        }
        
        XML::XmlResponse("ModifyAdminUser", 1, "Información actualizada");
    }
    
    private function DisplayAdminUsers()
    {
        $DB = new DataBase();
        
        $IdUSer = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
                
        $AdminUsers = "SELECT IdEnterprise, Alias FROM Enterprises";
        $AdminUsersResult = $DB->ConsultaSelect($EnterpriseAlias, $AdminUsers);
        if($AdminUsersResult['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar el listado de usuarios administradores</p><br>Detalles:<br><br>".$AdminUsersResult['Estado']);
            return 0;
        }
        
        XML::XmlArrayResponse("UsersAdmin", "User", $AdminUsersResult['ArrayDatos']);               
        
    }
    
    private function GetAdminUserInfo()
    {
        $DB = new DataBase();
        
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $UserAdminEnterpriseAlias = filter_input(INPUT_POST, "UserAdminEnterpriseAlias");
        
        $GetAdminInfo = "SELECT Password FROM Users WHERE UserName COLLATE utf8_bin = 'admin'";
        $GetAminInfoResult = $DB->ConsultaSelect($UserAdminEnterpriseAlias, $GetAdminInfo, 1);
        
        if($GetAminInfoResult['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar la información del usuario administrador</p><br>Detalles:<br><br>".$GetAminInfoResult['Estado']);
            return 0;
        }

        XML::XmlArrayResponse("UserInfo", "User", $GetAminInfoResult['ArrayDatos']);
    }
    
    private function DeleteUser()
    {
        $DB = new DataBase();
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $DeleteIdUser = filter_input(INPUT_POST, "DeleteIdUser");
        
        $Delete = "DELETE FROM Users WHERE IdUser = $DeleteIdUser";
        if(($ResultDelete = $DB->ConsultaQuery($EnterpriseAlias, $Delete))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al elminar el usuario</p><br>Detalles:<br><br>$ResultDelete");
            return 0;
        }
        
        XML::XmlResponse("DeletedUser", 1, "Usuario eliminado");
    }
    
    private function ModifyUser()
    {                
        $DB = new DataBase();
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $EditingIdUser = filter_input(INPUT_POST, "EditingIdUser");
        $EditUserName = filter_input(INPUT_POST, "Name");
        $LastName = filter_input(INPUT_POST, "LastName");
        $MLastName = filter_input(INPUT_POST, "MLastName");
        $SystemUsername = filter_input(INPUT_POST, "EditUserName");
        $Password = filter_input(INPUT_POST, "Password");
        
        $Update = "UPDATE Users SET UserName = '$SystemUsername', Name = '$EditUserName', LastName = '$LastName'
            , MLastName = '$MLastName', Password = '$Password' WHERE IdUser = $EditingIdUser";
        
        if(($ResultUpdate = $DB->ConsultaQuery($EnterpriseAlias, $Update))!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al actualizar la informacion del usuario</p><br>Detalles:<br><br>$ResultUpdate");
            return 0;
        }
        
        XML::XmlResponse("ModifyUser", 1, "Informacion Actualizada");
        
    }
    
    private function GetUserInfo()
    {
        $DB = new DataBase();
        
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $EditIdUser = filter_input(INPUT_POST, "EditIdUser");
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $Select = "SELECT *FROM Users WHERE IdUser = $EditIdUser";
        
        $ResultSelect = $DB->ConsultaSelect($EnterpriseAlias, $Select);
        if($ResultSelect['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar la información del usuario</p><br>Detalles<br><br>".$ResultSelect['Estado']);
            return 0;
        }
        
        $User = $ResultSelect['ArrayDatos'];
        XML::XmlArrayResponse("UserInfo", "User", $User);
    }
    
    private function UserList()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        
        $SelectUsers = "SELECT * FROM Users WHERE UserName != 'admin'";
        $ResultSelect = $DB->ConsultaSelect($EnterpriseAlias, $SelectUsers);
        if($ResultSelect['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al consultar los usuarios</p><br>Detalles:<br><br>".$ResultSelect['Estado']);
            return 0;
        }
        
        $Users = $ResultSelect['ArrayDatos'];
        XML::XmlArrayResponse("UserList", "User", $Users);
                
    }
    
    private function NewUser()
    {
        $DB = new DataBase();
        
        $EnterpriseAlias = filter_input(INPUT_POST, "EnterpriseAlias");
        $NewUserName = filter_input(INPUT_POST, "NewUsername");
        $LastName = filter_input(INPUT_POST, "LastName");
        $MLastName = filter_input(INPUT_POST, "MLastName");
        $SystemUsername = filter_input(INPUT_POST, "SystemUsername");
        $Password = filter_input(INPUT_POST, "Password");
        
        $Repeated = "SELECT * FROM Users WHERE UserName COLLATE utf8_bin = '$SystemUsername'";
        $ResultRepetaed = $DB->ConsultaSelect($EnterpriseAlias, $Repeated);
        if($ResultRepetaed['Estado']!=1)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al comprobar que el usuario no estuviera registrado previamente</p><br>Detalles:<br><br>".$ResultRepetaed['Estado']);
            return ;
        }               
        
        if(count($ResultRepetaed['ArrayDatos'])>0)
        {            
            XML::XmlResponse("RepeatedUser", 1, "El usuario '$NewUserName' ya existe");
            return 0;
        }
        $now = date('Y-m-d');
        $Insert = "INSERT INTO Users (UserName, Password, Name, LastName, MLastName, DischargeDate)
        VALUES ('$SystemUsername', '$Password', '$NewUserName', '$LastName', '$MLastName', '$now')";
        
        $IdUser = $DB->ConsultaInsertReturnId($EnterpriseAlias, $Insert);
        if(!$IdUser>0)
        {
            XML::XmlResponse("Error", 0, "<p><b>Error</b> al registrar el nuevo usuario</p><br>Detalles:<br><br>$ResultInsert");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("NewUser");
        $doc->appendChild($root);       
        $mensaje_=$doc->createElement('Mensaje',"Usuario '$NewUserName' registrado con éxito");
        $root->appendChild($mensaje_);
        $IdUserXml = $doc->createElement("IdUser", $IdUser);
        $root->appendChild($IdUserXml);
        $NewUsernameSystemXml = $doc->createElement("SystemUsername", $SystemUsername);
        $root->appendChild($NewUsernameSystemXml);
        $UserName = $doc->createElement("UserName", $NewUserName);
        $root->appendChild($UserName);
        $LastNameXml = $doc->createElement("LastName", $LastName);
        $root->appendChild($LastNameXml);
        $MLastNameXml = $doc->createElement("MLastName", $MLastName);
        $root->appendChild($MLastNameXml);
        $DischargeDate = $doc->createElement("DischargeDate", $now);
        $root->appendChild($DischargeDate);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();                        
    }
    
}

$Users = new Users();
